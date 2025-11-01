// src/pages/ItemwiseSales.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Download, RefreshCw, FileText, FilePlus, Package } from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange";
import { exportToCSV as utilExportToCSV, exportToPDF as utilExportToPDF } from "../utils/exportUtils";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CHUNK_SIZE = 20;

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));

export default function ItemwiseSales() {
  const { staff, logout } = useContext(AuthContext);
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");

  // export menu
  const [exportAnchor, setExportAnchor] = useState(null);

  // infinite scroll
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const sentinelRef = useRef(null);

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

  // fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await axios.get(`${API}/api/reports/itemwise-sales`, {
          params: {
            brand_id: selectedBrand,
            outlet_id: selectedOutlet,
            start_date: toISO(dateRange[0], false),
            end_date: toISO(dateRange[1], true),
          },
          withCredentials: true,
        });

        // expected shape { success: true, data: [...] }
        const serverData = resp.data?.data || [];
        const normalized = serverData.map((it, idx) => ({
          ...it,
          _clientId: it._id || it.name + "_" + idx,
          name: it.name ?? "Unknown",
          category: it.category ?? "Uncategorized",
          foodType: it.foodType ?? "unknown",
          quantitySold: Number(it.quantitySold ?? 0),
          grossSales: Number(it.grossSales ?? 0),
          addonRevenue: Number(it.addonRevenue ?? 0),
          totalRevenue: Number(it.totalRevenue ?? (it.grossSales ?? 0) + (it.addonRevenue ?? 0)),
        }));

        setItems(normalized);
        setVisibleCount(CHUNK_SIZE);
      } catch (err) {
        console.error("Itemwise sales fetch error:", err);
        setError("Failed to load itemwise sales");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    // reset visible count when key filters change
    setVisibleCount(CHUNK_SIZE);
  }, [selectedBrand, selectedOutlet, dateRange]);

  // refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (!selectedBrand || !selectedOutlet) {
        toast.info("Please select brand and outlet first");
        return;
      }
      setLoading(true);
      const resp = await axios.get(`${API}/api/reports/itemwise-sales`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });

      const serverData = resp.data?.data || [];
      const normalized = serverData.map((it, idx) => ({
        ...it,
        _clientId: it._id || it.name + "_" + idx,
        name: it.name ?? "Unknown",
        category: it.category ?? "Uncategorized",
        foodType: it.foodType ?? "unknown",
        quantitySold: Number(it.quantitySold ?? 0),
        grossSales: Number(it.grossSales ?? 0),
        addonRevenue: Number(it.addonRevenue ?? 0),
        totalRevenue: Number(it.totalRevenue ?? (it.grossSales ?? 0) + (it.addonRevenue ?? 0)),
      }));

      setItems(normalized);
      setVisibleCount(CHUNK_SIZE);
      toast.success("Itemwise sales refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // exports (try util exports first)
  const exportToCSV = (filename = "itemwise-sales.csv") => {
    if (typeof utilExportToCSV === "function") {
      try {
        utilExportToCSV(filteredForExport(), filename);
        return;
      } catch (err) {
        console.warn("utilExportToCSV failed, falling back", err);
      }
    }

    // fallback CSV
    const rows = [
      ["Name", "Category", "FoodType", "QuantitySold", "GrossSales", "AddonRevenue", "TotalRevenue"],
      ...filteredForExport().map((it) => [
        it.name,
        it.category,
        it.foodType,
        it.quantitySold,
        it.grossSales,
        it.addonRevenue,
        it.totalRevenue,
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

  const exportToXLSX = async (filename = "itemwise-sales.xlsx") => {
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const rows = [
        ["Name", "Category", "FoodType", "QuantitySold", "GrossSales", "AddonRevenue", "TotalRevenue"],
        ...filteredForExport().map((it) => [
          it.name,
          it.category,
          it.foodType,
          it.quantitySold,
          it.grossSales,
          it.addonRevenue,
          it.totalRevenue,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Items");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("xlsx not available, fallback to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPDF = (filename = "itemwise-sales.pdf") => {
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

  const filteredForExport = () => {
    // apply current category + food filters to full items list
    return items
      .filter((it) => (categoryFilter === "all" || it.category === categoryFilter))
      .filter((it) => (foodTypeFilter === "all" || it.foodType === foodTypeFilter));
  };

  // filters applied to rows shown
  const filteredItems = items
    .filter((it) => (categoryFilter === "all" ? true : it.category === categoryFilter))
    .filter((it) => (foodTypeFilter === "all" ? true : it.foodType === foodTypeFilter));

  // derived categories
  const categories = [...new Set(items.map((i) => i.category || "Uncategorized"))].sort();

  // visible slice for infinite loading
  const visibleItems = filteredItems.slice(0, visibleCount);

  // sentinel intersection observer
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((v) => Math.min(filteredItems.length, v + CHUNK_SIZE));
          }
        });
      },
      { root: null, rootMargin: "300px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [sentinelRef.current, filteredItems.length]);

  // totals
  const totalQty = filteredItems.reduce((s, it) => s + (it.quantitySold || 0), 0);
  const totalRevenue = filteredItems.reduce((s, it) => s + (Number(it.totalRevenue || 0)), 0);

  // export menu handlers
  const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportClose = () => setExportAnchor(null);

  // loading placeholder (matches DetailedOrders pattern)
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

          {/* Category */}
          <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              displayEmpty
              sx={{ height: 44 }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Food Type */}
          <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
            <Select
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
              displayEmpty
              sx={{ height: 44 }}
            >
              <MenuItem value="all">All Food Types</MenuItem>
              <MenuItem value="veg">Vegetarian</MenuItem>
              <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
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
                  exportToCSV(`itemwise_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`);
                }}
              >
                <FileText size={16} style={{ marginRight: 8 }} /> Export CSV
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleExportClose();
                  exportToXLSX(`itemwise_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`);
                }}
              >
                <FilePlus size={16} style={{ marginRight: 8 }} /> Export XLSX
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  handleExportClose();
                  exportToPDF(`itemwise_sales_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.pdf`);
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
          { title: "Total Items", value: filteredItems.length, color: "#3B82F6" },
          { title: "Total Quantity Sold", value: totalQty, color: "#10B981" },
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
              <Package size={28} style={{ color: card.color, marginBottom: 8 }} />
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

      {/* Items Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Itemwise Sales
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Quantity Sold</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Gross Sales</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Add-on Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Total Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No item sales found for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleItems.map((it) => (
                    <TableRow key={it._clientId} hover>
                      <TableCell>{it.name}</TableCell>
                      <TableCell>{it.category}</TableCell>
                      <TableCell>
                        <Box component="span" sx={{
                          px: 1,
                          py: 0.4,
                          borderRadius: 1,
                          fontSize: 12,
                          color: it.foodType === "veg" ? "success.main" : "error.main",
                          bgcolor: it.foodType === "veg" ? "success.lighter" : "error.lighter",
                        }}>
                          {it.foodType === "veg" ? "Veg" : it.foodType === "non-veg" ? "Non-Veg" : it.foodType}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{it.quantitySold}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{currency(it.grossSales)}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{currency(it.addonRevenue)}</TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>{currency(it.totalRevenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* sentinel */}
          <div ref={sentinelRef} />

          {/* loading more indicator */}
          {visibleCount < filteredItems.length && (
            <Box textAlign="center" py={2}>
              <CircularProgress size={20} />
              <Typography variant="caption" color="text.secondary" display="block">
                Loading more...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Footer tip */}
      <Box mt={6}>
        <Typography variant="caption" color="text.secondary">
          Tip: You can export this report as CSV / XLSX / PDF using export button in the filter bar.
        </Typography>
      </Box>
    </Box>
  );
}
