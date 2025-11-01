// src/pages/PaymentSummary.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem as MUIMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Skeleton,
  TablePagination,
} from "@mui/material";
import {
  Download,
  CreditCard,
  RefreshCw,
  FileText,
  FilePlus,
  Search as SearchIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange"; // uses quick presets (Today/Week/Month/3M/6M)
import dayOfYear from "dayjs/plugin/dayOfYear";
dayjs.extend(dayOfYear);

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));

// simple debounce hook (inline)
function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function PaymentSummary() {
  const { staff, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // filters (dayjs tuple)
  const [dateRange, setDateRange] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // data & ui
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // export + search + pagination
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 250);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- Initialize brands/outlets from staff
  useEffect(() => {
    if (staff?.permissions?.includes("staff_manage") || staff?.permissions?.includes("tax_manage")) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // when brand changes, filter outlets
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
    // reset pagination when filter changes
    setPage(0);
  }, [selectedBrand, outlets]);

  // helper: convert dayjs to ISO with timezone fix
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // fetch payment summary
  const fetchPaymentSummary = async () => {
    if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API}/api/reports/payment-summary`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });

      // normalize response shapes
      const server = resp.data?.data ?? resp.data ?? {};
      const payments = server?.payments ?? server?.paymentMethods ?? server ?? [];

      const normalized = (payments || []).map((m, idx) => {
        const transactions = Number(m.transactions ?? m.count ?? 0);
        const totalAmount = Number(m.totalAmount ?? m.amount ?? 0);
        const sharePercentage = Number(m.sharePercentage ?? m.share ?? 0);
        return {
          ...m,
          _clientId: (m.type ?? m.method ?? "type") + "_" + idx,
          type: m.type ?? m.method ?? "Unknown",
          transactions,
          totalAmount,
          sharePercentage,
        };
      });

      setPaymentMethods(normalized);
    } catch (err) {
      console.error("Payment summary fetch error:", err);
      setError("Failed to load payment summary");
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  // auto fetch when filters change
  useEffect(() => {
    fetchPaymentSummary();
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedOutlet, dateRange]);

  // refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPaymentSummary();
      toast.success("Payment summary refreshed");
    } catch (err) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // filtered (search across fields)
  const filteredPayments = useMemo(() => {
    if (!debouncedSearch) return paymentMethods;
    const q = String(debouncedSearch).trim().toLowerCase();
    return paymentMethods.filter((m) => {
      const candidates = [
        String(m.type ?? ""),
        String(m.transactions ?? ""),
        String(m.totalAmount ?? ""),
        String(m.sharePercentage ?? ""),
      ].map((c) => c.toLowerCase());
      return candidates.some((val) => val.includes(q));
    });
  }, [paymentMethods, debouncedSearch]);

  // slice for pagination (memoized)
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredPayments.slice(start, start + rowsPerPage);
  }, [filteredPayments, page, rowsPerPage]);

  // totals based on filtered items
  const totalAmount = filteredPayments.reduce((s, m) => s + (Number(m.totalAmount || 0)), 0);
  const totalTransactions = filteredPayments.reduce((s, m) => s + (Number(m.transactions || 0)), 0);
  const totalMethods = filteredPayments.length;

  // export helpers (CSV / XLSX)
  const rowsForExport = (rows) => rows.map((r) => [r.type, r.transactions, r.totalAmount, r.sharePercentage]);

  const filenameBase = `payment-summary-${dayjs().format("YYYY-MM-DD")}`;

  const exportToCSV = (filename = `${filenameBase}.csv`) => {
    if (!filteredPayments.length) {
      toast.info("No data to export");
      return;
    }
    const rows = [
      ["Payment Type", "Transactions", "Total Amount", "Share %"],
      ...rowsForExport(filteredPayments),
    ];
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
    if (!filteredPayments.length) {
      toast.info("No data to export");
      return;
    }
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const rows = [
        ["Payment Type", "Transactions", "Total Amount", "Share %"],
        ...rowsForExport(filteredPayments),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payments");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("xlsx not available, fallback to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPrint = (filename = filenameBase) => {
    if (!filteredPayments.length) {
      toast.info("No data to print");
      return;
    }
    const htmlRows = filteredPayments
      .map(
        (r) =>
          `<tr>
            <td>${escapeHtml(r.type)}</td>
            <td style="text-align:right">${r.transactions}</td>
            <td style="text-align:right">${currency(r.totalAmount)}</td>
            <td style="text-align:right">${Number(r.sharePercentage || 0).toFixed(1)}%</td>
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
          <h2>Payment Summary</h2>
          <div class="meta">Date range: ${dateRange[0]?.format("DD/MM/YYYY")} → ${dateRange[1]?.format("DD/MM/YYYY")}</div>
          <table>
            <thead>
              <tr>
                <th>Payment Type</th>
                <th style="text-align:right">Transactions</th>
                <th style="text-align:right">Total Amount</th>
                <th style="text-align:right">Share %</th>
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
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
      }[s]);
    });
  }

  // export menu handlers
  const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportClose = () => setExportAnchor(null);

  // pagination handlers
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // loading skeleton
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


  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Filter Bar (matches StaffPerformance layout + FilterDateRange) */}
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
              renderValue={(value) => (value ? brands.find((b) => b._id === value)?.full_name : "Select Brand")}
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
              renderValue={(value) => (value ? filteredOutlets.find((o) => o._id === value)?.name : "Select Outlet")}
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
              <IconButton onClick={(e) => handleExportOpen(e)}>
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
            </Menu>
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary" mt={2} display="block">
          Showing data for <b>{dateRange[0]?.format("DD/MM/YYYY")}</b> → <b>{dateRange[1]?.format("DD/MM/YYYY")}</b>
          {selectedBrand && `, Brand: ${brands.find((b) => b._id === selectedBrand)?.full_name}`}
          {selectedOutlet && `, Outlet: ${filteredOutlets.find((o) => o._id === selectedOutlet)?.name}`}
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
          mb: 4,
        }}
      >
        {[
          { title: "Payment Methods", value: totalMethods, color: "#3B82F6", icon: <CreditCard size={28} /> },
          { title: "Total Transactions", value: totalTransactions.toLocaleString(), color: "#10B981", icon: <CreditCard size={28} /> },
          { title: "Total Amount", value: currency(totalAmount), color: "#8B5CF6", icon: <CreditCard size={28} /> },
        ].map((card, i) => (
          <Card
            key={i}
            sx={{
              borderRadius: 1.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.18s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Table + compact Search (inside header row, right aligned) */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Payment Methods Breakdown</Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search type / transactions / amount / share..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={14} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: 360 },
                  ml: 2,
                  "& .MuiOutlinedInput-root": { borderRadius: "20px" },
                }}
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
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* show progress under header when refreshing/fetching */}
          {(isRefreshing || loading) && <LinearProgress sx={{ mb: 1 }} />}

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Transactions</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Share %</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No payment summary found for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((m) => (
                    <TableRow key={m._clientId} hover>
                      <TableCell>{m.type}</TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{m.transactions}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{currency(m.totalAmount)}</TableCell>
                      <TableCell sx={{ textAlign: "right", width: 160 }}>
                        <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                          <Box sx={{ width: 120 }}>
                            <LinearProgress variant="determinate" value={Math.min(100, Number(m.sharePercentage || 0))} />
                          </Box>
                          <Typography sx={{ minWidth: 36, textAlign: "right" }}>{Number(m.sharePercentage || 0).toFixed(1)}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredPayments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Footer tip */}
      <Box mt={4} display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          Tip: Use the export menu in the filter bar to download CSV / XLSX or quick export buttons above.
        </Typography>
      </Box>
    </Box>
  );
}
