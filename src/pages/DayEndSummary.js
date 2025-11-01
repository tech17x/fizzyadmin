// src/pages/DayEndSummary.jsx
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
  Collapse,
  LinearProgress,
  Skeleton,
  TablePagination,
} from "@mui/material";
import {
  Download,
  Calendar,
  User,
  DollarSign,
  RefreshCw,
  FileText,
  FilePlus,
  Search as SearchIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange"; // same FilterDateRange used elsewhere
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

export default function DayEndSummary() {
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // export, search, table
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 250);
  const [expandedId, setExpandedId] = useState(null);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // init brands/outlets
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
    setPage(0);
  }, [selectedBrand, outlets]);

  // helper to convert dayjs to ISO with timezone fix
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // fetch day end summary
  const fetchDayEndSummary = async () => {
    if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API}/api/reports/dayend-summary`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });

      const serverData = resp.data?.data ?? resp.data ?? [];
      // normalize each report, ensure numeric fields are numbers
      const normalized = (serverData || []).map((r, idx) => {
        // convert numeric-ish fields
        const totalSales = Number(r.totalSales ?? 0);
        const totalOrders = Number(r.totalOrders ?? 0);
        const openingCash = Number(r.openingCash ?? 0);
        const closingCash = Number(r.closingCash ?? 0);
        // detect payment fields dynamically: keys ending with 'Sales' or include payment-like names
        const paymentFields = Object.keys(r).filter(
          (k) =>
            /sales$/i.test(k) && typeof r[k] === "number" ||
            /card|cash|upi|wallet|stripe|razorpay|paypal|netbanking/i.test(k)
        );

        // build payments map
        const payments = {};
        paymentFields.forEach((k) => {
          payments[k] = Number(r[k] ?? 0);
        });

        return {
          ...r,
          _clientId: r.dayId ?? (r.date ? `${r.date}_${idx}` : `report_${idx}`),
          date: r.date ?? "",
          totalSales,
          totalOrders,
          openingCash,
          closingCash,
          payments,
        };
      });

      setReports(normalized);
    } catch (err) {
      console.error("Day end summary fetch error:", err);
      setError("Failed to load day end summary");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // auto fetch when filters change
  useEffect(() => {
    fetchDayEndSummary();
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedOutlet, dateRange]);

  // refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDayEndSummary();
      toast.success("Day end summary refreshed");
    } catch (err) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // search across all fields (date, openedBy, closedBy, totals, payments)
  const filtered = useMemo(() => {
    if (!debouncedSearch) return reports;
    const q = String(debouncedSearch).trim().toLowerCase();
    return reports.filter((r) => {
      const candidates = [
        r.date,
        r.openedBy,
        r.closedBy,
        String(r.totalOrders),
        String(r.totalSales),
        r.openComment,
        r.closingComment,
        r.dayId,
      ]
        .concat(Object.values(r.payments).map(String))
        .map((c) => String(c ?? "").toLowerCase());
      return candidates.some((c) => c.includes(q));
    });
  }, [reports, debouncedSearch]);

  // totals for cards based on filtered data
  const totalReports = filtered.length;
  const totalOrders = filtered.reduce((s, r) => s + (Number(r.totalOrders || 0)), 0);
  const totalSales = filtered.reduce((s, r) => s + (Number(r.totalSales || 0)), 0);

  // export helpers
  const filenameBase = `dayend-summary-${dayjs().format("YYYY-MM-DD")}`;

  const exportRowsFor = (rows) =>
    rows.map((r) => {
      // flatten payments into columns (dynamic)
      const payments = r.payments || {};
      const paymentColumns = Object.keys(payments)
        .map((k) => ({ k, v: payments[k] }))
        .sort((a, b) => a.k.localeCompare(b.k));
      const paymentValues = paymentColumns.map((p) => p.v);
      return [
        r.dayId,
        r.date,
        r.openedBy,
        r.closedBy,
        r.openingCash,
        r.closingCash,
        r.totalOrders,
        r.totalSales,
        ...paymentValues,
        r.totalTax ?? "",
        r.totalDiscounts ?? "",
        r.totalExtraCharges ?? "",
      ];
    });

  const exportToCSV = (filename = `${filenameBase}.csv`) => {
    if (!filtered.length) {
      toast.info("No data to export");
      return;
    }
    // compute payment header union
    const paymentKeys = Array.from(
      new Set(filtered.flatMap((r) => Object.keys(r.payments || {})))
    ).sort();
    const header = [
      "DayId",
      "Date",
      "OpenedBy",
      "ClosedBy",
      "OpeningCash",
      "ClosingCash",
      "TotalOrders",
      "TotalSales",
      ...paymentKeys,
      "TotalTax",
      "TotalDiscounts",
      "TotalExtraCharges",
    ];

    const rows = filtered.map((r) => {
      const payments = paymentKeys.map((k) => Number(r.payments?.[k] ?? 0));
      return [
        r.dayId,
        r.date,
        r.openedBy,
        r.closedBy,
        r.openingCash,
        r.closingCash,
        r.totalOrders,
        r.totalSales,
        ...payments,
        r.totalTax ?? "",
        r.totalDiscounts ?? "",
        r.totalExtraCharges ?? "",
      ];
    });

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((c) => `"${String(c ?? "")?.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

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
    if (!filtered.length) {
      toast.info("No data to export");
      return;
    }
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const paymentKeys = Array.from(
        new Set(filtered.flatMap((r) => Object.keys(r.payments || {})))
      ).sort();
      const header = [
        "DayId",
        "Date",
        "OpenedBy",
        "ClosedBy",
        "OpeningCash",
        "ClosingCash",
        "TotalOrders",
        "TotalSales",
        ...paymentKeys,
        "TotalTax",
        "TotalDiscounts",
        "TotalExtraCharges",
      ];

      const rows = filtered.map((r) => {
        const payments = paymentKeys.map((k) => Number(r.payments?.[k] ?? 0));
        return [
          r.dayId,
          r.date,
          r.openedBy,
          r.closedBy,
          r.openingCash,
          r.closingCash,
          r.totalOrders,
          r.totalSales,
          ...payments,
          r.totalTax ?? "",
          r.totalDiscounts ?? "",
          r.totalExtraCharges ?? "",
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DayEnd");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("xlsx export failed, fallback to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  // export menu handlers
  const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportClose = () => setExportAnchor(null);

  // pagination handlers
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // pagination slice (memo)
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

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
          { title: "Reports", value: totalReports, color: "#3B82F6", icon: <Calendar size={28} /> },
          { title: "Total Orders", value: totalOrders, color: "#10B981", icon: <User size={28} /> },
          { title: "Total Sales", value: currency(totalSales), color: "#8B5CF6", icon: <DollarSign size={28} /> },
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

      {/* Table + Search */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Day End Reports</Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search date / opened by / closed by / orders / sales / payments..."
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
                sx={{ width: { xs: "100%", sm: 480 }, ml: 2 }}
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

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Opened By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Closed By</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Orders</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Total Sales</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Opening Cash</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Closing Cash</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No day end reports for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((r) => {
                    const isExpanded = expandedId === r._clientId;
                    return (
                      <React.Fragment key={r._clientId}>
                        <TableRow
                          hover
                          onClick={() => setExpandedId(isExpanded ? null : r._clientId)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell>{r.date}</TableCell>
                          <TableCell>{r.openedBy}</TableCell>
                          <TableCell>{r.closedBy}</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{r.totalOrders}</TableCell>
                          <TableCell sx={{ textAlign: "right" }}>{currency(r.totalSales)}</TableCell>
                          <TableCell sx={{ textAlign: "right" }}>{currency(r.openingCash)}</TableCell>
                          <TableCell sx={{ textAlign: "right" }}>{currency(r.closingCash)}</TableCell>
                        </TableRow>

                        {/* Expandable details row */}
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Payment Breakdown
                                </Typography>

                                {/* dynamic payments grid */}
                                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2} mb={2}>
                                  {Object.keys(r.payments || {}).length === 0 ? (
                                    <Box sx={{ color: "text.secondary" }}>No payment breakdown available.</Box>
                                  ) : (
                                    Object.entries(r.payments)
                                      .sort((a, b) => a[0].localeCompare(b[0]))
                                      .map(([key, val]) => {
                                        const sharePct = r.totalSales ? (Number(val) / Number(r.totalSales)) * 100 : 0;
                                        return (
                                          <Box key={key} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 1, boxShadow: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                              {key}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                              {currency(val)}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                                              <Box sx={{ width: "100%" }}>
                                                <LinearProgress variant="determinate" value={Math.min(100, sharePct)} />
                                              </Box>
                                              <Typography variant="caption" sx={{ minWidth: 48, textAlign: "right" }}>
                                                {sharePct.toFixed(1)}%
                                              </Typography>
                                            </Box>
                                          </Box>
                                        );
                                      })
                                  )}
                                </Box>

                                {/* Financial summary */}
                                <Box
                                  display="flex"
                                  gap={2}
                                  flexDirection={{ xs: "column", md: "row" }}
                                >
                                  {[
                                    { label: "Total Tax", value: currency(r.totalTax ?? 0) },
                                    { label: "Total Discounts", value: `-${currency(r.totalDiscounts ?? 0)}`, color: "error.main" },
                                    { label: "Extra Charges", value: `+${currency(r.totalExtraCharges ?? 0)}` },
                                  ].map((item, i) => (
                                    <Box
                                      key={i}
                                      sx={(theme) => ({
                                        flex: 1,
                                        p: 2,
                                        borderRadius: 1,
                                        backgroundColor:
                                          theme.palette.mode === "dark"
                                            ? theme.palette.background.paper
                                            : theme.palette.grey[50],
                                        color: theme.palette.text.primary,
                                        border: `1px solid ${theme.palette.divider}`,
                                      })}
                                    >
                                      <Typography variant="body2" color="text.secondary">
                                        {item.label}
                                      </Typography>
                                      <Typography variant="h6" color={item.color ?? "inherit"}>
                                        {item.value}
                                      </Typography>
                                    </Box>
                                  ))}

                                  {/* COMMENTS BOX */}
                                  <Box
                                    sx={(theme) => ({
                                      flex: 1,
                                      p: 2,
                                      borderRadius: 1,
                                      backgroundColor:
                                        theme.palette.mode === "dark"
                                          ? theme.palette.background.paper
                                          : theme.palette.grey[50],
                                      color: theme.palette.text.primary,
                                      border: `1px solid ${theme.palette.divider}`,
                                    })}
                                  >
                                    <Typography variant="body2" color="text.secondary">Comments</Typography>
                                    <Typography variant="body2">
                                      {r.openComment || r.closingComment ? (
                                        <>
                                          {r.openComment && (
                                            <div><strong>Open:</strong> {r.openComment}</div>
                                          )}
                                          {r.closingComment && (
                                            <div><strong>Close:</strong> {r.closingComment}</div>
                                          )}
                                        </>
                                      ) : (
                                        <span style={{ opacity: 0.6 }}>—</span>
                                      )}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filtered.length}
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
          Tip: Click any row to expand and view payment breakdown. Use export buttons to download CSV / XLSX.
        </Typography>
      </Box>
    </Box>
  );
}
