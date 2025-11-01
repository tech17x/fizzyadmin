// src/pages/CancellationReport.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Paper,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem as MUIMenuItem,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  Download,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  FilePlus,
  Search as SearchIcon,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange"; // same FilterDateRange used elsewhere
import dayOfYear from "dayjs/plugin/dayOfYear";
dayjs.extend(dayOfYear);

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function currency(v) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));
}

// Debounce hook (inline)
function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function CancellationReport() {
  const { staff, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // Filters (dayjs tuple)
  const [dateRange, setDateRange] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // Data + UI
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Export + Search + Menu
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);

  // Init brands/outlets from staff
  useEffect(() => {
    if (staff?.permissions?.includes("staff_manage")) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // When brand changes, filter outlets
  useEffect(() => {
    if (selectedBrand) {
      const filtered = (outlets || []).filter((o) => o.brand_id === selectedBrand);
      setFilteredOutlets(filtered);
      setSelectedOutlet("");
      if (filtered.length === 0) toast.error("Selected brand has no outlets.");
    } else {
      setFilteredOutlets([]);
      setSelectedOutlet("");
    }
    // reset search when filter changed (optional)
    setSearchText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, outlets]);

  // Helper: convert dayjs to ISO with timezone fix
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // Fetch cancel/refund summary
  const fetchCancelRefundSummary = async () => {
    if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API}/api/reports/cancel-refund-summary`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });

      if (resp.data?.success) {
        const data = resp.data.data || {};
        setSummary(data.summary || null);
        setOrders(data.orders || []);
        toast.success("Cancel/Refund summary loaded");
      } else {
        setSummary(null);
        setOrders([]);
        toast.error("Failed to load cancel/refund summary");
      }
    } catch (err) {
      console.error("Fetch cancel/refund error:", err);
      setError("Server error while fetching cancel/refund summary");
      setSummary(null);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when filters change
  useEffect(() => {
    fetchCancelRefundSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedOutlet, dateRange]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCancelRefundSummary();
      toast.success("Refreshed");
    } catch (err) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Search across many fields (client-side)
  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders;
    const q = String(debouncedSearch).trim().toLowerCase();
    return orders.filter((o) => {
      // candidate fields: order_id, status, staff name, total, cancelReason, refundReason, date
      const candidates = [
        String(o.order_id ?? ""),
        String(o.status ?? ""),
        String(o.staff_id?.name ?? ""),
        String(o.summary?.total ?? ""),
        String(o.cancelReason ?? ""),
        String(o.refundReason ?? ""),
        o.orderDayAt ? new Date(o.orderDayAt).toLocaleString() : "",
      ].map((s) => s.toLowerCase());
      return candidates.some((c) => c.includes(q));
    });
  }, [orders, debouncedSearch]);

  // Exports: rows -> CSV/XLSX/Print
  const filenameBase = `cancellation-report-${dayjs().format("YYYY-MM-DD")}`;

  const rowsForExport = (rows) =>
    rows.map((r) => [
      r.order_id,
      r.status,
      r.staff_id?.name ?? "",
      r.summary?.total ?? 0,
      r.cancelReason ?? "",
      r.refundReason ?? "",
      r.orderDayAt ? new Date(r.orderDayAt).toISOString() : "",
    ]);

  const exportToCSV = (filename = `${filenameBase}.csv`) => {
    if (!filteredOrders.length) {
      toast.info("No data to export");
      return;
    }
    const header = ["Order ID", "Status", "Staff", "Total", "Cancel Reason", "Refund Reason", "Date"];
    const rows = [header, ...rowsForExport(filteredOrders)];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "")?.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const exportToXLSX = async (filename = `${filenameBase}.xlsx`) => {
    if (!filteredOrders.length) {
      toast.info("No data to export");
      return;
    }
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const rows = [
        ["Order ID", "Status", "Staff", "Total", "Cancel Reason", "Refund Reason", "Date"],
        ...rowsForExport(filteredOrders),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cancellations");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("XLSX export failed, falling back to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPrint = (filename = filenameBase) => {
    if (!filteredOrders.length) {
      toast.info("No data to print");
      return;
    }
    const htmlRows = filteredOrders
      .map(
        (r) => `
      <tr>
        <td>${escapeHtml(r.order_id)}</td>
        <td>${escapeHtml(r.status)}</td>
        <td>${escapeHtml(r.staff_id?.name ?? "")}</td>
        <td style="text-align:right">${currency(r.summary?.total ?? 0)}</td>
        <td>${escapeHtml(r.cancelReason ?? "")}</td>
        <td>${escapeHtml(r.refundReason ?? "")}</td>
        <td>${escapeHtml(r.orderDayAt ? new Date(r.orderDayAt).toLocaleString() : "")}</td>
      </tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 16px; color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { padding: 8px 10px; border: 1px solid #e5e7eb; }
            th { background: #f3f4f6; text-align: left; }
            .right { text-align: right; }
            h2 { margin: 0; font-size: 18px; }
            .meta { margin-top: 8px; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>Cancellation Report</h2>
          <div class="meta">Date range: ${dateRange[0]?.format("DD/MM/YYYY")} → ${dateRange[1]?.format("DD/MM/YYYY")}</div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Status</th><th>Staff</th><th style="text-align:right">Total</th><th>Cancel Reason</th><th>Refund Reason</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "width=900,height=720");
    if (!w) {
      toast.error("Popup blocked. Allow popups for this site to print.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
      return (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
          "/": "&#x2F;",
          "`": "&#x60;",
          "=": "&#x3D",
        }[s]
      );
    });
  }

  // export menu handlers
  const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportClose = () => setExportAnchor(null);

  // small loading skeleton while fetching
  if (loading) {
    return (
      <Box p={{ xs: 2, md: 3 }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Filters
          </Typography>
          <Box display="flex" gap={2}>
            <Skeleton variant="rectangular" width={200} height={44} />
            <Skeleton variant="rectangular" width={200} height={44} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" width="100%" height={44} />
            </Box>
          </Box>
        </Paper>

        <Box display="grid" gap={2}>
          <Skeleton variant="rectangular" height={120} />
          <Skeleton variant="rectangular" height={280} />
        </Box>
      </Box>
    );
  }

  // top filter bar + UI
  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Filter Bar (matches other pages, includes quick presets via FilterDateRange) */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 0,
          bgcolor: "background.paper",
          boxShadow: "0 6px 18px rgba(20,20,30,0.05)",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Filters
        </Typography>

        {/* FilterDateRange provides quick preset selections (Today / Week / Month / 3M / 6M) */}
        <Box mb={2}>
          <FilterDateRange value={dateRange} onChange={(r) => setDateRange(r)} calendars={isSm ? 1 : 2} />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mt={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
            <Select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              displayEmpty
              sx={{ height: 44 }}
              renderValue={(v) => (v ? brands.find((b) => b._id === v)?.full_name : "Select Brand")}
            >
              <MenuItem value="">
                <em>Select Brand</em>
              </MenuItem>
              {brands.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
            <Select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              displayEmpty
              sx={{ height: 44 }}
              renderValue={(v) => (v ? filteredOutlets.find((o) => o._id === v)?.name : "Select Outlet")}
            >
              <MenuItem value="">
                <em>Select Outlet</em>
              </MenuItem>
              {filteredOutlets.map((o) => (
                <MenuItem key={o._id} value={o._id}>
                  {o.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export">
              <IconButton onClick={handleExportOpen}>
                <Download />
              </IconButton>
            </Tooltip>

            <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportClose}>
              <MUIMenuItem
                onClick={() => {
                  handleExportClose();
                  exportToCSV(`${filenameBase}.csv`);
                }}
              >
                <FileText size={16} style={{ marginRight: 8 }} /> Export CSV
              </MUIMenuItem>
              <MUIMenuItem
                onClick={() => {
                  handleExportClose();
                  exportToXLSX(`${filenameBase}.xlsx`);
                }}
              >
                <FilePlus size={16} style={{ marginRight: 8 }} /> Export XLSX
              </MUIMenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MUIMenuItem
                onClick={() => {
                  handleExportClose();
                  exportToPrint(filenameBase);
                }}
              >
                <Download size={16} style={{ marginRight: 8 }} /> Print
              </MUIMenuItem>
            </Menu>
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary" mt={2} display="block">
          Showing data for <b>{dateRange[0]?.format("DD/MM/YYYY")}</b> → <b>{dateRange[1]?.format("DD/MM/YYYY")}</b>
          {selectedBrand && `, Brand: ${brands.find((b) => b._id === selectedBrand)?.full_name}`}
          {selectedOutlet && `, Outlet: ${filteredOutlets.find((o) => o._id === selectedOutlet)?.name}`}
        </Typography>
      </Paper>

      {/* Error */}
      {error && (
        <Box mb={2}>
          <Card sx={{ backgroundColor: "background.paper", p: 2 }}>
            <Typography color="error.main">{error}</Typography>
          </Card>
        </Box>
      )}

      {/* Summary Cards (theme-aware) */}
      {summary && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            mb: 3,
          }}
        >
          <Card>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ bgcolor: "error.main", color: "common.white", p: 1.5, borderRadius: 1 }}>
                <XCircle />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Cancellations
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main" }}>
                  {summary.cancelledOrders}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ bgcolor: "warning.main", color: "common.white", p: 1.5, borderRadius: 1 }}>
                <AlertTriangle />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Refunds
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "warning.main" }}>
                  {summary.refundedOrders}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ bgcolor: "secondary.main", color: "common.white", p: 1.5, borderRadius: 1 }}>
                <AlertTriangle />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Refund Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {currency(summary.refundAmount ?? 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Main Data Area — kept similar to your original style but theme-aware */}
      {orders.length > 0 ? (
        <Box>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Header with search */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
                <Typography variant="h6">Cancellation & Refund Details</Typography>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    size="small"
                    placeholder="Search order id / staff / status / reason..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon size={14} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: { xs: 200, sm: 360 } }}
                  />
                  <Tooltip title="Export CSV">
                    <IconButton onClick={() => exportToCSV(`${filenameBase}.csv`)}>
                      <FileText />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export XLSX">
                    <IconButton onClick={() => exportToXLSX(`${filenameBase}.xlsx`)}>
                      <FilePlus />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton onClick={handleRefresh} disabled={isRefreshing}>
                      <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider />

              {/* Table (kept HTML-like but inside CardContent) */}
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: theme.palette.action.hover }}>
                      <th style={{ textAlign: "left", padding: 12 }}>Order ID</th>
                      <th style={{ textAlign: "left", padding: 12 }}>Date</th>
                      <th style={{ textAlign: "left", padding: 12 }}>Status</th>
                      <th style={{ textAlign: "left", padding: 12 }}>Staff</th>
                      <th style={{ textAlign: "right", padding: 12 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: 24, color: theme.palette.text.secondary }}>
                          No cancel/refund data available for selected filters
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o, idx) => (
                        <tr key={o.order_id ?? idx} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <td style={{ padding: 12 }}>{o.order_id}</td>
                          <td style={{ padding: 12 }}>{o.orderDayAt ? new Date(o.orderDayAt).toLocaleString() : "—"}</td>
                          <td style={{ padding: 12 }}>{o.status}</td>
                          <td style={{ padding: 12 }}>{o.staff_id?.name || "Unassigned"}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>{currency(o.summary?.total ?? 0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>

          {/* Analysis Section */}
          {summary && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Cancellation Analysis
                </Typography>
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
                  {/* Top reasons */}
                  <Box>
                    <Typography variant="subtitle2" mb={1}>
                      Top Cancellation Reasons
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {Object.entries(
                        orders.reduce((acc, order) => {
                          if (order.status === "cancel") {
                            const reason = order.cancelReason || "Not specified";
                            acc[reason] = (acc[reason] || 0) + 1;
                          }
                          return acc;
                        }, {})
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([reason, count], i) => (
                          <Box
                            key={i}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              p: 1.25,
                              borderRadius: 1,
                              bgcolor: "background.paper",
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Typography variant="body2">{reason}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {count}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </Box>

                  {/* Financial impact */}
                  <Box>
                    <Typography variant="subtitle2" mb={1}>
                      Financial Impact
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Lost Revenue (Cancellations)</Typography>
                        <Typography>{currency(summary.cancelledAmount ?? 0)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Refunded Amount</Typography>
                        <Typography color="error.main">{currency(summary.refundAmount ?? 0)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${theme.palette.divider}`, pt: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>Total Impact</Typography>
                        <Typography sx={{ fontWeight: 700, color: "error.main" }}>{currency(summary.totalLoss ?? 0)}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Footer quick exports */}
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Tooltip title="Export CSV">
              <IconButton onClick={() => exportToCSV(`${filenameBase}.csv`)}>
                <FileText />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export XLSX">
              <IconButton onClick={() => exportToXLSX(`${filenameBase}.xlsx`)}>
                <FilePlus />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={() => exportToPrint(filenameBase)}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Box>
          <Card>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No cancel/refund data available for selected filters</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
