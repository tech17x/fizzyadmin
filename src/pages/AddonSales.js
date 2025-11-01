// src/pages/AddonSales.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Menu,
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
  Skeleton,
} from "@mui/material";
import {
  Download,
  Plus,
  RefreshCw,
  FileText,
  FilePlus,
  Search as SearchIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange"; // same as ItemwiseSales

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));

// simple debounce hook implemented inline
function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function AddonSales() {
  const { staff, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // filters (matching Itemwise style: dayjs range & selectedBrand/outlet as id strings)
  const [dateRange, setDateRange] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // data & ui
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // export menu + search
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 250);

  // init brands/outlets from staff
  useEffect(() => {
    if (staff?.permissions?.includes("tax_manage")) {
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

  // helper to convert dayjs to ISO with timezone fix (same as Itemwise)
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // fetch addon sales from API
  const fetchAddonSales = async () => {
    if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API}/api/reports/addon-sales`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });

      const serverData = resp.data?.data || [];
      const normalized = serverData.map((a, idx) => {
        // expect API fields: name, parentItem (or associatedItem), quantitySold, totalSales
        const quantitySold = Number(a.quantitySold ?? a.qty ?? 0);
        const totalSales = Number(a.totalSales ?? a.sales ?? 0);
        const avgPrice = quantitySold ? totalSales / quantitySold : 0;
        return {
          ...a,
          _clientId: a._id || a.name + "_" + idx,
          name: a.name ?? "Unknown",
          parentItem: a.parentItem ?? a.associatedItem ?? a.itemName ?? "—",
          quantitySold,
          totalSales,
          avgPrice,
        };
      });

      setAddons(normalized);
    } catch (err) {
      console.error("Addon sales fetch error:", err);
      setError("Failed to load addon sales");
      setAddons([]);
    } finally {
      setLoading(false);
    }
  };

  // auto fetch when filters change
  useEffect(() => {
    fetchAddonSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedOutlet, dateRange]);

  // refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAddonSales();
      toast.success("Addon sales refreshed");
    } catch (err) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // search (search across all fields: name, parentItem, quantity, totalSales, avgPrice)
  const filteredAddons = useMemo(() => {
    if (!debouncedSearch) return addons;
    const q = String(debouncedSearch).trim().toLowerCase();
    return addons.filter((a) => {
      const candidates = [
        String(a.name ?? "").toLowerCase(),
        String(a.parentItem ?? "").toLowerCase(),
        String(a.quantitySold ?? "").toLowerCase(),
        String(a.totalSales ?? "").toLowerCase(),
        String(a.avgPrice ?? "").toLowerCase(),
      ];
      return candidates.some((val) => val.includes(q));
    });
  }, [addons, debouncedSearch]);

  // totals (based on filteredAddons)
  const totalAddons = filteredAddons.length;
  const totalQuantityUsed = filteredAddons.reduce((s, a) => s + (Number(a.quantitySold || 0)), 0);
  const totalAddonRevenue = filteredAddons.reduce((s, a) => s + (Number(a.totalSales || 0)), 0);

  // exports (inline helpers)
  const exportRowsFrom = (rows, filenameBase = "addon_sales") =>
    rows.map((r) => [
      r.name,
      r.parentItem,
      r.quantitySold,
      r.avgPrice,
      r.totalSales,
    ]);

  const exportToCSV = (filename = "addon-sales.csv") => {
    const rows = [
      ["Add-on", "Parent Item", "Qty Used", "Avg Price", "Total Revenue"],
      ...exportRowsFrom(filteredAddons),
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

  const exportToXLSX = async (filename = "addon-sales.xlsx") => {
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const rows = [
        ["Add-on", "Parent Item", "Qty Used", "Avg Price", "Total Revenue"],
        ...exportRowsFrom(filteredAddons),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Addons");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("xlsx not available, fallback to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPDF = (filename = "addon-sales.pdf") => {
    // lightweight fallback: export XLSX when html2canvas/jspdf not present
    toast.info("PDF export requires html2canvas/jspdf; falling back to XLSX.");
    exportToXLSX(filename.replace(/\.pdf$/, ".xlsx"));
  };

  // export menu handlers
  const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportClose = () => setExportAnchor(null);

  // loading skeleton similar to Itemwise
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
              <MenuItem
                onClick={() => {
                  handleExportClose();
                  exportToCSV(`addon_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`);
                }}
              >
                <FileText size={16} style={{ marginRight: 8 }} /> Export CSV
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleExportClose();
                  exportToXLSX(`addon_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`);
                }}
              >
                <FilePlus size={16} style={{ marginRight: 8 }} /> Export XLSX
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  handleExportClose();
                  exportToPDF(`addon_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.pdf`);
                }}
              >
                <Download size={16} style={{ marginRight: 8 }} /> Export PDF
              </MenuItem>
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
          { title: "Total Add-ons", value: totalAddons, color: "#3B82F6" },
          { title: "Total Quantity Used", value: totalQuantityUsed, color: "#10B981" },
          { title: "Total Add-on Revenue", value: currency(totalAddonRevenue), color: "#8B5CF6" },
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
              <Plus size={28} style={{ color: card.color, marginBottom: 8 }} />
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
            <Typography variant="h6">Add-on Performance</Typography>

            <TextField
              size="small"
              placeholder="Search add-on / item / qty / revenue..."
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
                  <TableCell sx={{ fontWeight: 700 }}>Add-on</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Associated Item</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Qty Used</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Avg Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Total Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Revenue %</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAddons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No addon sales found for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAddons.map((a) => {
                    const revenuePercentage = totalAddonRevenue ? (Number(a.totalSales) / totalAddonRevenue) * 100 : 0;
                    return (
                      <TableRow key={a._clientId} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Plus size={14} style={{ color: "#6b7280" }} />
                            <Typography>{a.name}</Typography>
                          </Box>
                        </TableCell>

                        <TableCell>{a.parentItem}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{a.quantitySold}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>{currency(a.avgPrice)}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>{currency(a.totalSales)}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>
                          <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                            <Box sx={{ width: 96, mr: 1 }}>
                              <Box sx={{ height: 8, background: "#e6e9ee", borderRadius: 1, overflow: "hidden" }}>
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: `${Math.min(100, revenuePercentage)}%`,
                                    background: "linear-gradient(90deg,#3b82f6,#8b5cf6)",
                                  }}
                                />
                              </Box>
                            </Box>
                            <Typography sx={{ minWidth: 40, textAlign: "right" }}>{revenuePercentage.toFixed(1)}%</Typography>
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

      {/* Footer tip + quick export buttons */}
      <Box mt={4} display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          Tip: Use the export menu in the filter bar to download CSV / XLSX / PDF.
        </Typography>

        <Box>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => exportToCSV(`addon_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`)}>
              <FileText />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export XLSX">
            <IconButton onClick={() => exportToXLSX(`addon_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`)}>
              <FilePlus />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
