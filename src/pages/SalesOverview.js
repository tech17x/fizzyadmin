// src/pages/SalesOverview.jsx
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
  Avatar,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Tooltip,
  Collapse,
  Menu,
  MenuItem as MUIMenuItem,
  Divider as MUIDivider,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  Download,
  FileText,
  Printer,
  FilePlus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import SelectInput from "../components/SelectInput";
import DateRangeFilter from "./shared/DateRangeFilter.jsx";
import FilterDateRange from "../components/FilterDateRange"; // if you use the dayjs version
// NOTE: If you have only one date component, point to the correct import above.

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function SalesOverview() {
  const { staff, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // Filters
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

  // Data
  const [salesData, setSalesData] = useState(null); // response.data
  const [saleOrders, setSaleOrders] = useState([]); // response.data
  const [salesTrends, setSalesTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const reportRef = useRef(null);

  // init brands/outlets
  useEffect(() => {
    if (staff?.permissions?.includes("tax_manage")) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // filter outlets when brand selected
  useEffect(() => {
    if (selectedBrand) {
      const filtered = outlets.filter((o) => o.brand_id === selectedBrand);
      setFilteredOutlets(filtered);
      setSelectedOutlet("");
      if (filtered.length === 0) toast.error("Selected brand has no outlets.");
    } else {
      setFilteredOutlets([]);
      setSelectedOutlet("");
    }
  }, [selectedBrand, outlets]);

  // build ISO from dayjs
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // fetch sales
  useEffect(() => {
    const fetchSales = async () => {
      if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) {
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API}/api/reports/sales`, {
          params: {
            brand_id: selectedBrand,
            outlet_id: selectedOutlet,
            start_date: toISO(dateRange[0], false),
            end_date: toISO(dateRange[1], true),
          },
          withCredentials: true,
        });

        if (response.data?.success) {
          // response shape (your server):
          // { success: true, data: { summary, orderTypes, ... }, salesTrends, orders, ... }
          setSalesData(response.data.data);
          setSaleOrders(response.data.orders);
          setSalesTrends(response.data.salesTrends || []);
          toast.success("Sales data loaded");
        } else {
          setError("Failed to load sales data");
        }
      } catch (err) {
        console.error("Sales fetch error", err);
        setError("Error fetching sales data");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [selectedBrand, selectedOutlet, dateRange]);

  // refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // re-run the fetch effect by toggling dateRange to same value (or simply call direct)
      if (selectedBrand && selectedOutlet && dateRange?.[0] && dateRange?.[1]) {
        setLoading(true);
        const response = await axios.get(`${API}/api/reports/sales`, {
          params: {
            brand_id: selectedBrand,
            outlet_id: selectedOutlet,
            start_date: toISO(dateRange[0], false),
            end_date: toISO(dateRange[1], true),
          },
          withCredentials: true,
        });
        if (response.data?.success) {
          setSalesData(response.data.data || response.data);
          setSaleOrders(response.data.orders);
          setSalesTrends(response.data.salesTrends || []);
          toast.success("Sales refreshed");
        } else {
          toast.error("Failed to refresh sales");
        }
      } else {
        toast.info("Please pick a brand, outlet and date range");
      }
    } catch (err) {
      console.error(err);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // helpers
  const toggleExpanded = (id) => setExpandedOrder(expandedOrder === id ? null : id);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "settle":
        return { bgcolor: "success.light", color: "success.dark" };
      case "cancel":
      case "cancelled":
        return { bgcolor: "error.light", color: "error.dark" };
      case "refund":
      case "refunded":
        return { bgcolor: "warning.light", color: "warning.dark" };
      default:
        return { bgcolor: "grey.100", color: "text.primary" };
    }
  };

  // charts data (safe defaults)
  const summary = salesData?.summary || {};
  const pieData = Object.entries(salesData?.paymentsWithTax || {}).map(([k, v]) => ({
    name: k,
    value: v,
  }));
  const barData = Object.entries(salesData?.paymentsWithTax || {}).map(([k, withTax]) => ({
    method: k,
    withTax,
    withoutTax: (salesData?.paymentsWithoutTax && salesData.paymentsWithoutTax[k]) || 0,
  }));
  const orderTypeData = Object.entries(salesData?.orderTypes || {}).map(([type, count]) => ({
    type,
    count,
    sales: (salesData?.orderTypeSales?.[type]?.withTax) || 0,
    salesWithoutTax: (salesData?.orderTypeSales?.[type]?.withoutTax) || 0,
  }));

  // format date range summary
  const formatDateRange = () => {
    if (!dateRange?.[0] || !dateRange?.[1]) return "Select date range";
    const s = dateRange[0].toDate();
    const e = dateRange[1].toDate();
    return `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`;
  };

  // ----- EXPORTS -----
  // CSV export
  const exportToCSV = (filename = "sales_report.csv") => {
    if (!salesData) {
      toast.error("No data to export");
      return;
    }

    const rows = [];
    // summary block
    rows.push(["Sales Summary"]);
    rows.push(["Total with tax", summary.withTaxSales || 0]);
    rows.push(["Total without tax", summary.withoutTaxSales || 0]);
    rows.push(["Completed orders", summary.completedOrders || 0]);
    rows.push([]);
    // orders table headers
    rows.push(["OrderId", "CreatedAt", "Customer", "Total(withTax)", "Status"]);
    const orders = saleOrders || [];
    orders.forEach((o) => {
      rows.push([
        o.order_id || o._id || "",
        o.createdAt ? new Date(o.createdAt).toISOString() : "",
        o.customer?.name || "",
        (o.summary?.total != null) ? o.summary.total : "",
        o.status || "",
      ]);
    });

    const csv = rows.map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  // XLSX export (optional — uses xlsx lib if present)
  const exportToXLSX = async (filename = "sales_report.xlsx") => {
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      // create table array
      const orders = salesData?.orders || [];
      const wsData = [
        ["OrderId", "CreatedAt", "Customer", "Total(withTax)", "Status"],
        ...orders.map((o) => [
          o.order_id || o._id || "",
          o.createdAt ? new Date(o.createdAt).toISOString() : "",
          o.customer?.name || "",
          o.summary?.total || 0,
          o.status || "",
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX downloaded");
    } catch (err) {
      console.warn("xlsx not available, falling back to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  // PDF export (optional) - uses html2canvas + jspdf if installed
  const exportToPDF = async (filename = "sales_report.pdf") => {
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas").then((m) => m.default || m),
        import("jspdf").then((m) => m.jsPDF || m.default || m),
      ]);

      if (!reportRef.current) {
        toast.error("Nothing to export");
        return;
      }

      const node = reportRef.current;
      // create a high-res canvas (scale for crispness)
      const canvas = await html2canvasModule(node, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDFModule("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 16; // small margins
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      let position = 8;
      pdf.addImage(imgData, "PNG", 8, position, imgWidth, imgHeight);
      pdf.save(filename);
      toast.success("PDF exported");
    } catch (err) {
      console.error("PDF export error", err);
      toast.error("PDF export failed (missing libs). Install html2canvas and jspdf for PDF export.");
    }
  };

  const handleExportMenuOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportMenuClose = () => setExportAnchor(null);

  // small loading placeholder for charts
  if (loading) {
    return (
      <Box p={{ xs: 2, md: 3 }}>
        <Paper className="glass" sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Filters
          </Typography>
          <Skeleton height={44} />
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
      {/* Filter Bar (mirrors StaffOverview's look) */}
      <Paper
        className="glass"
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
          <FilterDateRange
            value={dateRange}
            onChange={(r) => setDateRange(r)}
            calendars={isSm ? 1 : 2}
          />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mt={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
            <Select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              displayEmpty
              sx={{ height: 44 }}
              renderValue={(value) =>
                value ? brands.find((b) => b._id === value)?.full_name : "Select Brand"
              }
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
              renderValue={(value) =>
                value ? filteredOutlets.find((o) => o._id === value)?.name : "Select Outlet"
              }
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
              <IconButton onClick={handleExportMenuOpen}>
                <Download />
              </IconButton>
            </Tooltip>

            <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportMenuClose}>
              <MUIMenuItem
                onClick={() => {
                  handleExportMenuClose();
                  exportToCSV(`sales_report_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`);
                }}
              >
                <FileText size={16} style={{ marginRight: 8 }} />
                Export CSV
              </MUIMenuItem>
              <MUIMenuItem
                onClick={() => {
                  handleExportMenuClose();
                  exportToXLSX(`sales_report_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`);
                }}
              >
                <FilePlus size={16} style={{ marginRight: 8 }} />
                Export XLSX
              </MUIMenuItem>
              <MUIDivider />
              <MUIMenuItem
                onClick={() => {
                  handleExportMenuClose();
                  exportToPDF(`sales_report_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.pdf`);
                }}
              >
                <Printer size={16} style={{ marginRight: 8 }} />
                Export PDF
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Report content that will be exported (wrap ref) */}
      <div ref={reportRef}>
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
            {
              title: "Total Sales",
              value: `$${(summary.withTaxSales ?? 0).toFixed(2)}`,
              subtitle: `$${(summary.withoutTaxSales ?? 0).toFixed(2)} without tax`,
              icon: <DollarSign size={18} />,
              color: "#3B82F6",
            },
            {
              title: "Completed Orders",
              value: summary.completedOrders ?? 0,
              subtitle: `${summary.cancelledOrders ?? 0} cancelled`,
              icon: <ShoppingCart size={18} />,
              color: "#10B981",
            },
            {
              title: "Payment Methods",
              value: Object.keys(salesData?.paymentsWithTax || {}).length,
              subtitle: "Active methods",
              icon: <CreditCard size={18} />,
              color: "#8B5CF6",
            },
            {
              title: "Refunds",
              value: `$${(summary.refundTotal ?? 0).toFixed(2)}`,
              subtitle: `${summary.refundedOrders ?? 0} orders`,
              icon: <RefreshCw size={18} />,
              color: "#F59E0B",
            },
            {
              title: "Tips",
              value: `$${(summary.totalTips ?? 0).toFixed(2)}`,
              subtitle: "Total tips earned",
              icon: <TrendingUp size={18} />,
              color: "#14B8A6",
            },
            {
              title: "Order Types",
              value: Object.keys(salesData?.orderTypes || {}).length,
              subtitle: "Different types",
              icon: <Users size={18} />,
              color: "#6366F1",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              sx={{
                borderRadius: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  py: 2.5,
                  gap: 0.5,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: stat.color,
                    width: 44,
                    height: 44,
                    mb: 1,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Sales Trends */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <div>
                <Typography variant="h6">Sales Trends</Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily sales performance over selected range
                </Typography>
              </div>
              <Box>
                <Tooltip title="Download chart as PNG (use Export -> PDF/XLSX)"><IconButton><Download /></IconButton></Tooltip>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrends || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartTooltip formatter={(val) => `$${(Number(val) || 0).toFixed(2)}`} contentStyle={{ color : "#333" }} />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Payment & Tax Charts */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3} mb={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Payment Methods</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Distribution of payment types
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={pieData.map((d) => ({
                      name: d.name,
                      value: Number(d.value.toFixed(2)),
                    }))}
                    margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === "dark" ? "#444" : "#e0e0e0"}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(val) =>
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(val)
                      }
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: theme.palette.text.primary }}
                      width={100}
                    />
                    <RechartTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 2px 6px rgba(0,0,0,0.5)"
                            : "0 2px 6px rgba(0,0,0,0.1)",
                        color: "#333"
                      }}
                      formatter={(val) =>
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        }).format(val)
                      }
                    />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">Tax Breakdown</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Payment amounts with and without tax
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <RechartTooltip formatter={(val) => `$${(Number(val) || 0).toFixed(2)}`} contentStyle={{ color : "#333" }} />
                    <Legend />
                    <Bar dataKey="withTax" fill="#3B82F6" name="With Tax" />
                    <Bar dataKey="withoutTax" fill="#10B981" name="Without Tax" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Order Type breakdown */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Order Types Performance</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sales breakdown by order categories
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderTypeData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <RechartTooltip
                    contentStyle={{ color : "#333" }}
                    formatter={(value, name) => {
                      if (name === "count" || name === "Orders") {
                        return [Number(value), "Orders"];
                      }
                      return [`$${(Number(value) || 0).toFixed(2)}`, name];
                    }}
                    labelFormatter={(label) => `Order Type: ${label}`}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" name="Orders" />
                  <Bar dataKey="sales" fill="#3B82F6" name="Sales" />
                  <Bar dataKey="salesWithoutTax" fill="#10B981" name="Without Tax" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Order Type Details Grid */}
            <Box
              sx={{
                mt: 3,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              {orderTypeData.map((item, index) => (
                <Box
                  key={item.type}
                  sx={{
                    bgcolor: "background.default",
                    borderRadius: 1.5,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "text.primary", mb: 1, fontWeight: 600 }}
                  >
                    {item.type}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Orders:{" "}
                      <Typography component="span" variant="body2" fontWeight={500}>
                        {item.count}
                      </Typography>
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Sales:{" "}
                      <Typography component="span" variant="body2" fontWeight={500}>
                        ${item.sales.toFixed(2)}
                      </Typography>
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Without tax:{" "}
                      <Typography component="span" variant="body2" fontWeight={500}>
                        ${item.salesWithoutTax.toFixed(2)}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Orders table (expandable) */}
        {saleOrders && saleOrders.length > 0 ? (
          <Card sx={{ mb: 6 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <div>
                  <Typography variant="h6">Recent Orders</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Showing {saleOrders.length} orders
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateRange()}
                  </Typography>
                </div>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Order</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {saleOrders.map((order, i) => {
                      const id = order._id || order.order_id || i;
                      return (
                        <React.Fragment key={id}>
                          <TableRow hover>
                            <TableCell>
                              <IconButton size="small" onClick={() => toggleExpanded(id)}>
                                {expandedOrder === id ? <ChevronDown /> : <ChevronRight />}
                              </IconButton>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                #{order.order_id?.split("_")?.[1] || order._id || id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.order_id || order._id}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 28, height: 28 }}>{(order.customer?.name || "U").charAt(0)}</Avatar>
                                <Typography variant="body2">{order.customer?.name || "N/A"}</Typography>
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2">
                                {format(new Date(order.createdAt || new Date()), "MMM dd, yyyy")}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(order.createdAt || new Date()), "HH:mm")}
                              </Typography>
                            </TableCell>

                            <TableCell>{order.items?.length || 0}</TableCell>

                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                ${((order.summary?.total != null) ? order.summary.total : 0).toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ${((order.summary?.subtotal != null) ? order.summary.subtotal : 0).toFixed(2)} + ${((order.summary?.tax != null) ? order.summary.tax : 0).toFixed(2)} tax
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Box
                                component="span"
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.75rem",
                                  ...getStatusColor(order.status),
                                }}
                              >
                                {(order.status || "pending").toString().charAt(0).toUpperCase() +
                                  (order.status || "pending").toString().slice(1)}
                              </Box>
                            </TableCell>

                          </TableRow>

                          {/* Expanded details */}
                          <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                              <Collapse in={expandedOrder === id} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 2 }}>
                                  <Box
                                    mb={2}
                                    display="flex"
                                    gap={2}
                                    flexDirection={{ xs: "column", md: "row" }}
                                  >
                                    {/* --- Order Items --- */}
                                    <Card
                                      sx={{
                                        flex: 1,
                                        bgcolor: "background.paper",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                      }}
                                    >
                                      <CardContent>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                          Order Items
                                        </Typography>
                                        <Divider sx={{ mb: 1.5 }} />

                                        {order.items?.map((item, idx) => (
                                          <Box
                                            key={idx}
                                            display="flex"
                                            justifyContent="space-between"
                                            py={1.2}
                                            sx={{
                                              borderBottom: "1px solid",
                                              borderColor: "divider",
                                            }}
                                          >
                                            <Box>
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {item.name}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {item.category_name}
                                              </Typography>

                                              {item.activeAddons?.length > 0 && (
                                                <Box mt={0.6}>
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: "block" }}
                                                  >
                                                    Add-ons:
                                                  </Typography>
                                                  <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                                                    {item.activeAddons.map((a, ai) => (
                                                      <Box
                                                        key={ai}
                                                        sx={{
                                                          px: 1,
                                                          py: 0.4,
                                                          borderRadius: 1,
                                                          fontSize: 12,
                                                          bgcolor: theme.palette.mode === "dark"
                                                            ? "grey.800"
                                                            : "grey.100",
                                                          color: "text.primary",
                                                          border: "1px solid",
                                                          borderColor: "divider",
                                                        }}
                                                      >
                                                        {a.name}
                                                      </Box>
                                                    ))}
                                                  </Box>
                                                </Box>
                                              )}
                                            </Box>

                                            <Box textAlign="right">
                                              <Typography variant="body2">
                                                ${(item.total_price ?? item.price ?? 0).toFixed(2)}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                Qty: {item.quantity || 1}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        ))}
                                      </CardContent>
                                    </Card>

                                    {/* --- Payment Info --- */}
                                    <Card
                                      sx={{
                                        width: { xs: "100%", md: 320 },
                                        bgcolor: "background.paper",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                      }}
                                    >
                                      <CardContent>
                                        <Typography variant="subtitle2">Payment Info</Typography>
                                        <Divider sx={{ my: 1.5 }} />

                                        <Box display="grid" gap={0.8}>
                                          <Typography variant="caption" color="text.secondary">
                                            Total Paid
                                          </Typography>
                                          <Typography variant="body2" fontWeight={700}>
                                            ${(order.paymentInfo?.totalPaid ?? 0).toFixed(2)}
                                          </Typography>

                                          <Typography variant="caption" color="text.secondary">
                                            Tip
                                          </Typography>
                                          <Typography variant="body2">
                                            ${(order.paymentInfo?.tip ?? 0).toFixed(2)}
                                          </Typography>

                                          <Typography variant="caption" color="text.secondary">
                                            Return
                                          </Typography>
                                          <Typography variant="body2">
                                            ${(order.paymentInfo?.return ?? 0).toFixed(2)}
                                          </Typography>
                                        </Box>

                                        <Box mt={2.5}>
                                          <Typography variant="caption" color="text.secondary">
                                            Payment Methods
                                          </Typography>
                                          <Box mt={1.2} display="flex" flexDirection="column" gap={1}>
                                            {order.paymentInfo?.payments?.length ? (
                                              order.paymentInfo.payments.map((p, pi) => (
                                                <Box
                                                  key={pi}
                                                  sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    p: 1,
                                                    borderRadius: 1,
                                                    bgcolor:
                                                      theme.palette.mode === "dark"
                                                        ? "grey.800"
                                                        : "grey.100",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                  }}
                                                >
                                                  <CreditCard size={14} />
                                                  <Typography variant="body2">
                                                    {p.typeName}: ${Number(p.amount || 0).toFixed(2)}
                                                  </Typography>
                                                </Box>
                                              ))
                                            ) : (
                                              <Typography variant="caption" color="text.secondary">
                                                No payment details
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Box>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>

                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ) : (
          <Typography align="center" color="text.secondary">
            No sales orders available for the selected filters.
          </Typography>
        )}
      </div>

      {/* Footer */}
      <Box mt={6}>
        <Typography variant="caption" color="text.secondary">
          Tip: You can export this report as CSV / XLSX / PDF using export button in the filter bar.
        </Typography>
      </Box>
    </Box>
  );
}
