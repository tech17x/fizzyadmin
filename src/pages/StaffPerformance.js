// src/pages/StaffPerformance.jsx
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
} from "@mui/material";
import {
  Download,
  Users,
  TrendingUp,
  RefreshCw,
  FileText,
  FilePlus,
  Search as SearchIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));

// simple debounce hook inline
function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function StaffPerformance() {
  const { staff, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // filters (dayjs array like Itemwise)
  const [dateRange, setDateRange] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // data & ui
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // export menu + search
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 250);

  // init brands/outlets from staff
  useEffect(() => {
    if (staff?.permissions?.includes("staff_manage")) {
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
  }, [selectedBrand, outlets]);

  // helper to convert dayjs to ISO with timezone fix
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // fetch staff performance
  const fetchStaffPerformance = async () => {
    if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API}/api/reports/staff-performance`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });

      const serverData = resp.data?.data || [];
      // normalize fields with safe numbers
      const normalized = serverData.map((s, idx) => {
        const totalSales = Number(s.totalSales ?? 0);
        const ordersHandled = Number(s.ordersHandled ?? s.order_count ?? 0);
        const avgOrderValue = ordersHandled ? Number(s.avgOrderValue ?? s.avg ?? totalSales / ordersHandled) : 0;
        return {
          ...s,
          _clientId: s._id || s.name + "_" + idx,
          name: s.name ?? "Unknown",
          ordersHandled,
          totalSales,
          avgOrderValue,
          totalAddons: Number(s.totalAddons ?? s.addons ?? 0),
          cancelCount: Number(s.cancelCount ?? s.cancellations ?? 0),
          refundCount: Number(s.refundCount ?? 0),
        };
      });

      setStaffPerformance(normalized);
    } catch (err) {
      console.error("Staff performance fetch error:", err);
      setError("Failed to load staff performance");
      setStaffPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  // auto fetch when filters change
  useEffect(() => {
    fetchStaffPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedOutlet, dateRange]);

  // refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchStaffPerformance();
      toast.success("Staff performance refreshed");
    } catch (err) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // filtered (search across many fields)
  const filteredStaff = useMemo(() => {
    if (!debouncedSearch) return staffPerformance;
    const q = String(debouncedSearch).trim().toLowerCase();
    return staffPerformance.filter((s) => {
      const candidates = [
        String(s.name ?? ""),
        String(s.ordersHandled ?? ""),
        String(s.totalSales ?? ""),
        String(s.avgOrderValue ?? ""),
        String(s.totalAddons ?? ""),
        String(s.cancelCount ?? ""),
        String(s.refundCount ?? ""),
      ].map((c) => c.toLowerCase());
      return candidates.some((val) => val.includes(q));
    });
  }, [staffPerformance, debouncedSearch]);

  // totals based on filteredStaff
  const totalActiveStaff = filteredStaff.length;
  const totalTeamSales = filteredStaff.reduce((sum, s) => sum + (Number(s.totalSales || 0)), 0);
  const topPerformer = filteredStaff.reduce((top, cur) => (cur.totalSales > (top?.totalSales || 0) ? cur : top), {});

  // exports (inline helpers)
  const rowsForExport = (rows) =>
    rows.map((r) => [
      r.name,
      r.ordersHandled,
      r.totalSales,
      r.avgOrderValue,
      r.totalAddons,
      r.cancelCount,
      r.refundCount,
    ]);

  const exportToCSV = (filename = "staff-performance.csv") => {
    if (!filteredStaff.length) {
      toast.info("No data to export");
      return;
    }
    const rows = [
      ["Staff Name", "Orders Handled", "Total Sales", "Avg Order Value", "Total Add-ons", "Cancellations", "Refunds"],
      ...rowsForExport(filteredStaff),
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

  const exportToXLSX = async (filename = "staff-performance.xlsx") => {
    if (!filteredStaff.length) {
      toast.info("No data to export");
      return;
    }
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const rows = [
        ["Staff Name", "Orders Handled", "Total Sales", "Avg Order Value", "Total Add-ons", "Cancellations", "Refunds"],
        ...rowsForExport(filteredStaff),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "StaffPerformance");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("xlsx not available, fallback to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPrint = (filename = "staff-performance") => {
    if (!filteredStaff.length) {
      toast.info("No data to print");
      return;
    }
    const htmlRows = filteredStaff
      .map(
        (r) =>
          `<tr>
            <td>${escapeHtml(r.name)}</td>
            <td style="text-align:right">${r.ordersHandled}</td>
            <td style="text-align:right">${currency(r.totalSales)}</td>
            <td style="text-align:right">${currency(r.avgOrderValue)}</td>
            <td style="text-align:right">${r.totalAddons}</td>
            <td style="text-align:right">${r.cancelCount}</td>
            <td style="text-align:right">${r.refundCount}</td>
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
          <h2>Staff Performance</h2>
          <div class="meta">Date range: ${dateRange[0]?.format("DD/MM/YYYY")} → ${dateRange[1]?.format("DD/MM/YYYY")}</div>
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th style="text-align:right">Orders Handled</th>
                <th style="text-align:right">Total Sales</th>
                <th style="text-align:right">Avg Order Value</th>
                <th style="text-align:right">Total Add-ons</th>
                <th style="text-align:right">Cancellations</th>
                <th style="text-align:right">Refunds</th>
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
    setTimeout(() => {
      w.print();
      // w.close(); // optional: don't close automatically in case user cancels print
    }, 500);
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

  // skeleton loader if loading
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
      {/* Filter Bar */}
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
                  exportToCSV(`staff_performance_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`);
                }}
              >
                <FileText size={16} style={{ marginRight: 8 }} /> Export CSV
              </MUIMenuItem>
              <MUIMenuItem
                onClick={() => {
                  handleExportClose();
                  exportToXLSX(`staff_performance_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`);
                }}
              >
                <FilePlus size={16} style={{ marginRight: 8 }} /> Export XLSX
              </MUIMenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MUIMenuItem
                onClick={() => {
                  handleExportClose();
                  exportToPrint(`staff_performance_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}`);
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
          { title: "Active Staff", value: totalActiveStaff, color: "#3B82F6", icon: <Users size={28} /> },
          {
            title: "Top Performer",
            value: topPerformer?.name || "—",
            sub: topPerformer?.totalSales ? currency(topPerformer.totalSales) : null,
            color: "#10B981",
            icon: <TrendingUp size={28} />,
          },
          { title: "Team Total Sales", value: currency(totalTeamSales), color: "#8B5CF6", icon: <TrendingUp size={28} /> },
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
              {card.sub && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {card.sub}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Table + Search */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Staff Performance Details</Typography>

            <TextField
              size="small"
              placeholder="Search name / orders / sales / avg / addons..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={14} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 360 }, ml: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Staff Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Orders Handled</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Total Sales</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Avg Order Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Add-ons</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Cancellations</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Refunds</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Performance</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No staff performance found for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => {
                    const performancePct = totalTeamSales ? (Number(member.totalSales) / totalTeamSales) * 100 : 0;
                    const isTop = member.name === topPerformer?.name;
                    return (
                      <TableRow key={member._clientId} hover selected={isTop}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{member.ordersHandled}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>{currency(member.totalSales)}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>{currency(member.avgOrderValue)}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{member.totalAddons}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>{member.cancelCount}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>{member.refundCount}</TableCell>
                        <TableCell sx={{ textAlign: "right", width: 160 }}>
                          <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                            <Box sx={{ width: 120 }}>
                              <LinearProgress variant="determinate" value={Math.min(100, performancePct)} />
                            </Box>
                            <Typography sx={{ minWidth: 36, textAlign: "right" }}>{performancePct.toFixed(1)}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Footer tip + quick export */}
      <Box mt={4} display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          Tip: You can export this report as CSV / XLSX / Print using the export button in the filter bar.
        </Typography>

        <Box>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => exportToCSV(`staff_performance_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`)}>
              <FileText />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export XLSX">
            <IconButton onClick={() => exportToXLSX(`staff_performance_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`)}>
              <FilePlus />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
