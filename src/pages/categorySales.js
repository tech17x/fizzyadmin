// src/pages/CategorySales.jsx
import React, { useEffect, useState, useMemo } from "react";
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
} from "@mui/material";
import { Download, RefreshCw, FileText, FilePlus, Tag, Search as SearchIcon } from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange";
import { exportToCSV as utilExportToCSV, exportToPDF as utilExportToPDF } from "../utils/exportUtils";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));

export default function CategorySales() {
  const { staff, logout } = React.useContext(AuthContext);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // filters
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [dateRange, setDateRange] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);

  // data & ui
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // export menu + search
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchText, setSearchText] = useState("");

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

  // helper to convert dayjs to ISO with timezone fix
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // fetch categories from API
  const fetchCategorySales = async () => {
    if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API}/api/reports/categorywise-sales`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });

      const serverData = resp.data?.data || [];
      const normalized = serverData.map((c, idx) => ({
        ...c,
        _clientId: c._id || c.category + "_" + idx,
        category: c.category ?? "Uncategorized",
        totalOrders: Number(c.totalOrders ?? 0),
        quantitySold: Number(c.quantitySold ?? 0),
        grossSales: Number(c.grossSales ?? 0),
        addonRevenue: Number(c.addonRevenue ?? 0),
        totalRevenue: Number(c.totalRevenue ?? (c.grossSales ?? 0) + (c.addonRevenue ?? 0)),
      }));

      setCategories(normalized);
    } catch (err) {
      console.error("Categorywise sales fetch error:", err);
      setError("Failed to load categorywise sales");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // auto fetch when filters change
  useEffect(() => {
    fetchCategorySales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedOutlet, dateRange]);

  // refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCategorySales();
      toast.success("Category sales refreshed");
    } catch (err) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // filtered (search across all visible fields)
  const filteredCategories = useMemo(() => {
    if (!searchText) return categories;
    const q = String(searchText).trim().toLowerCase();
    return categories.filter((c) => {
      if (!c) return false;
      // fields to search: category name, orders, qty, gross, addon, total
      const candidates = [
        String(c.category || ""),
        String(c.totalOrders ?? ""),
        String(c.quantitySold ?? ""),
        String(c.grossSales ?? ""),
        String(c.addonRevenue ?? ""),
        String(c.totalRevenue ?? ""),
      ];
      return candidates.some((val) => val.toLowerCase().includes(q));
    });
  }, [categories, searchText]);

  // exports (use filtered list so export respects search)
  const filteredForExport = () => filteredCategories;

  const exportToCSV = (filename = "category-sales.csv") => {
    if (typeof utilExportToCSV === "function") {
      try {
        utilExportToCSV(filteredForExport(), filename);
        return;
      } catch (err) {
        console.warn("utilExportToCSV failed, falling back", err);
      }
    }

    const rows = [
      ["Category", "Orders", "QuantitySold", "GrossSales", "AddonRevenue", "TotalRevenue"],
      ...filteredForExport().map((c) => [
        c.category,
        c.totalOrders,
        c.quantitySold,
        c.grossSales,
        c.addonRevenue,
        c.totalRevenue,
      ]),
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

  const exportToXLSX = async (filename = "category-sales.xlsx") => {
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const rows = [
        ["Category", "Orders", "QuantitySold", "GrossSales", "AddonRevenue", "TotalRevenue"],
        ...filteredForExport().map((c) => [
          c.category,
          c.totalOrders,
          c.quantitySold,
          c.grossSales,
          c.addonRevenue,
          c.totalRevenue,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Categories");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("xlsx not available, fallback to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPDF = (filename = "category-sales.pdf") => {
    if (typeof utilExportToPDF === "function") {
      try {
        utilExportToPDF(filteredForExport(), filename);
        return;
      } catch (err) {
        console.warn("utilExportToPDF failed", err);
      }
    }
    toast.info("PDF export requires html2canvas/jspdf or server-side; falling back to XLSX.");
    exportToXLSX(filename.replace(/\.pdf$/, ".xlsx"));
  };

  // totals for summary cards (based on filteredCategories)
  const totalCategories = filteredCategories.length;
  const totalOrders = filteredCategories.reduce((s, c) => s + (c.totalOrders || 0), 0);
  const totalQty = filteredCategories.reduce((s, c) => s + (c.quantitySold || 0), 0);
  const totalRevenue = filteredCategories.reduce((s, c) => s + (Number(c.totalRevenue || 0)), 0);

  // export menu handlers
  const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportClose = () => setExportAnchor(null);

  // loading placeholder (matches ItemwiseSales)
  if (loading) {
    return (
      <Box p={{ xs: 2, md: 3 }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Filters
          </Typography>
          <Box display="flex" gap={2}>
            <Box sx={{ width: 200, height: 44, bgcolor: "grey.100", borderRadius: 1 }} />
            <Box sx={{ width: 200, height: 44, bgcolor: "grey.100", borderRadius: 1 }} />
            <Box sx={{ flex: 1, height: 44, bgcolor: "grey.100", borderRadius: 1 }} />
          </Box>
        </Paper>

        <Box display="grid" gap={2}>
          <Box sx={{ height: 120, bgcolor: "grey.100", borderRadius: 1 }} />
          <Box sx={{ height: 280, bgcolor: "grey.100", borderRadius: 1 }} />
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
                  exportToCSV(`category_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`);
                }}
              >
                <FileText size={16} style={{ marginRight: 8 }} /> Export CSV
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleExportClose();
                  exportToXLSX(`category_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`);
                }}
              >
                <FilePlus size={16} style={{ marginRight: 8 }} /> Export XLSX
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  handleExportClose();
                  exportToPDF(`category_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.pdf`);
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
          { title: "Total Categories", value: totalCategories, color: "#3B82F6" },
          { title: "Total Orders", value: totalOrders, color: "#10B981" },
          { title: "Total Quantity Sold", value: totalQty, color: "#F59E0B" },
          { title: "Total Revenue", value: currency(totalRevenue), color: "#8B5CF6" },
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
              <Tag size={28} style={{ color: card.color, marginBottom: 8 }} />
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

      {/* Categories Table */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Categorywise Sales</Typography>

            <TextField
              size="small"
              placeholder="Search category / orders / qty / revenue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={14} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 320 }, ml: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Orders</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Qty Sold</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Gross Sales</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Add-on Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Total Revenue</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No category sales found for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((c) => (
                    <TableRow key={c._clientId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Tag size={14} style={{ color: "#6b7280" }} />
                          <Typography>{c.category}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{c.totalOrders}</TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{c.quantitySold}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{currency(c.grossSales)}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{currency(c.addonRevenue)}</TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>{currency(c.totalRevenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Footer tip */}
      <Box mt={6}>
        <Typography variant="caption" color="text.secondary">
          Tip: You can export this report as CSV / XLSX / PDF using the export button in the filter bar.
        </Typography>
      </Box>
    </Box>
  );
}
