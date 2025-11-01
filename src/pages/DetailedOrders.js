// src/pages/DetailedOrders.jsx
import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
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
  IconButton,
  Tooltip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Menu,
  MenuItem as MUIMenuItem,
  Divider as MUIDivider,
  useTheme,
  useMediaQuery,
  TextField,
} from "@mui/material";
import {
  Eye,
  Download,
  RefreshCw,
  FileText,
  FilePlus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange";
import SelectInput from "../components/SelectInput";
import { exportToCSV as utilExportToCSV, exportToPDF as utilExportToPDF } from "../utils/exportUtils"; // optional utils if present

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CHUNK_SIZE = 20; // number of rows/cards rendered initially and per load more

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));

export default function DetailedOrders() {
  const { staff, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // Filters
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [dateRange, setDateRange] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);

  // Data & UI
  const [orders, setOrders] = useState([]); // raw orders from API
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({}); // id => boolean
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE); // for infinite scroll
  const sentinelRef = useRef(null);

  // Initialize brands/outlets
  useEffect(() => {
    if (staff?.permissions?.includes("tax_manage")) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // Filter outlets when brand selected
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

  // helper to build ISO from dayjs
  const toISO = (d, endOfDay = false) => {
    if (!d) return null;
    const dt = d.toDate();
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  };

  // fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
      setLoadingOrders(true);
      setError(null);
      try {
        const resp = await axios.get(`${API}/api/reports/orders`, {
          params: {
            brand_id: selectedBrand,
            outlet_id: selectedOutlet,
            start_date: toISO(dateRange[0], false),
            end_date: toISO(dateRange[1], true),
          },
          withCredentials: true,
        });

        // Expecting shape { orders: [...] }
        const serverOrders = resp.data?.orders || [];
        // normalize basic fields to avoid undefined exceptions
        const normalized = serverOrders.map((o) => ({
          ...o,
          _clientId: o._id || o.order_id || Math.random().toString(36).slice(2, 9),
        }));

        setOrders(normalized);
        setVisibleCount(CHUNK_SIZE);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setError("Failed to fetch orders");
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
    // reset visible count / expanded when filters change
    setExpandedOrders({});
    setVisibleCount(CHUNK_SIZE);
  }, [selectedBrand, selectedOutlet, dateRange]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (!selectedBrand || !selectedOutlet) {
        toast.info("Please select brand and outlet first");
        return;
      }
      setLoadingOrders(true);
      const resp = await axios.get(`${API}/api/reports/orders`, {
        params: {
          brand_id: selectedBrand,
          outlet_id: selectedOutlet,
          start_date: toISO(dateRange[0], false),
          end_date: toISO(dateRange[1], true),
        },
        withCredentials: true,
      });
      const serverOrders = resp.data?.orders || [];
      const normalized = serverOrders.map((o) => ({
        ...o,
        _clientId: o._id || o.order_id || Math.random().toString(36).slice(2, 9),
      }));
      setOrders(normalized);
      setVisibleCount(CHUNK_SIZE);
      toast.success("Orders refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
      setLoadingOrders(false);
    }
  };

  // Exports
  const exportToCSV = (filename = "detailed-orders.csv") => {
    if (typeof utilExportToCSV === "function") {
      // if you provided utility, use it
      try {
        utilExportToCSV(
          filteredOrdersForExport(),
          filename
        );
        return;
      } catch (err) {
        // fallback to in-component
        console.warn("utilExportToCSV failed, using fallback", err);
      }
    }

    // fallback csv generator
    const rows = [];
    rows.push(["OrderID", "Date", "Customer", "Staff", "OrderType", "Status", "Paid", "PaymentMethods"]);
    filteredOrdersForExport().forEach((o) => {
      rows.push([
        o.order_id || o._clientId,
        o.orderDayAt || o.createdAt || "",
        o.customer?.name || "",
        o.terminalStaff?.name || "",
        o.orderType?.name || "",
        o.status || "",
        o.paymentInfo?.totalPaid ?? 0,
        (o.paymentInfo?.payments || []).map((p) => p.typeName).join(", "),
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
    toast.success("CSV exported");
  };

  const exportToXLSX = async (filename = "detailed-orders.xlsx") => {
    try {
      const XLSX = await import("xlsx").then((m) => m.default || m);
      const rows = [
        ["OrderID", "Date", "Customer", "Staff", "OrderType", "Status", "Paid", "PaymentMethods"]
      ];
      filteredOrdersForExport().forEach((o) => {
        rows.push([
          o.order_id || o._clientId,
          o.orderDayAt || o.createdAt || "",
          o.customer?.name || "",
          o.terminalStaff?.name || "",
          o.orderType?.name || "",
          o.status || "",
          o.paymentInfo?.totalPaid ?? 0,
          (o.paymentInfo?.payments || []).map((p) => p.typeName).join(", "),
        ]);
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("xlsx not available, fallback to CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPDF = async (filename = "detailed-orders.pdf") => {
    if (typeof utilExportToPDF === "function") {
      try {
        utilExportToPDF(filteredOrdersForExport(), filename);
        return;
      } catch (err) {
        console.warn("utilExportToPDF failed", err);
      }
    }
    toast.info("PDF export requires html2canvas/jspdf or a server-side solution. Falling back to XLSX.");
    exportToXLSX(filename.replace(/\.pdf$/, ".xlsx"));
  };

  // helper: build export-safe order list (apply current search)
  const filteredOrdersForExport = () => {
    return filteredOrders; // use same filtered list currently visible
  };

  // Search: multi-field
  const matchesSearch = (order, text) => {
    if (!text) return true;
    const t = text.toLowerCase();

    // order id
    if ((order.order_id || "").toString().toLowerCase().includes(t)) return true;
    // customer
    if ((order.customer?.name || "").toLowerCase().includes(t)) return true;
    // staff
    if ((order.terminalStaff?.name || "").toLowerCase().includes(t)) return true;
    // order type
    if ((order.orderType?.name || "").toLowerCase().includes(t)) return true;
    // items
    if ((order.items || []).some((it) => (it.name || "").toLowerCase().includes(t))) return true;
    // payment method names
    if ((order.paymentInfo?.payments || []).some((p) => (p.typeName || "").toLowerCase().includes(t))) return true;

    // status
    if ((order.status || "").toLowerCase().includes(t)) return true;

    return false;
  };

  // filtered + sorted orders
  const filteredOrders = orders.filter((o) => matchesSearch(o, searchTerm));

  // visible slice (infinite scroll)
  const visibleOrders = filteredOrders.slice(0, visibleCount);

  // toggle expand inline
  const toggleOrder = (id) => setExpandedOrders((s) => ({ ...s, [id]: !s[id] }));

  // Export menu handlers
  const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
  const handleExportClose = () => setExportAnchor(null);

  // Intersection observer to increase visibleCount
  useEffect(() => {
    if (!sentinelRef.current) return;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((v) => Math.min(filteredOrders.length, v + CHUNK_SIZE));
          }
        });
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [sentinelRef.current, filteredOrders.length]);

  // helper: status badge style
  const getStatusProps = (status) => {
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

  // UI: loading placeholder
  if (loadingOrders) {
    return (
      <Box p={{ xs: 2, md: 3 }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Filters</Typography>
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
              <MenuItem value=""><em>Select Brand</em></MenuItem>
              {brands.map((b) => <MenuItem key={b._id} value={b._id}>{b.full_name}</MenuItem>)}
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
              <MenuItem value=""><em>Select Outlet</em></MenuItem>
              {filteredOutlets.map((o) => <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            placeholder="Search by order id, customer, staff, item, payment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 240 }}
          />

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
                  exportToCSV(`detailed_orders_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`);
                }}
              >
                <FileText size={16} style={{ marginRight: 8 }} /> Export CSV
              </MUIMenuItem>
              <MUIMenuItem
                onClick={() => {
                  handleExportClose();
                  exportToXLSX(`detailed_orders_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`);
                }}
              >
                <FilePlus size={16} style={{ marginRight: 8 }} /> Export XLSX
              </MUIMenuItem>
              <MUIDivider />
              <MUIMenuItem
                onClick={() => {
                  handleExportClose();
                  exportToPDF(`detailed_orders_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.pdf`);
                }}
              >
                <Download size={16} style={{ marginRight: 8 }} /> Export PDF
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

      {/* Orders list (cards + collapse) */}
      <Box>
        {visibleOrders.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No orders found for selected filters.</Typography>
          </Card>
        ) : (
          <Box display="grid" gap={2}>
            {visibleOrders.map((order) => {
              const id = order._clientId;
              const isExpanded = !!expandedOrders[id];
              const itemsCount = order.itemCount ?? (order.items?.length ?? 0);
              const dateText = order.orderDayAt || order.createdAt || "";
              return (
                <Card key={id} sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        {/* <Avatar sx={{ bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100" }}>
                          #{(order.order_id || id).toString().split("_")?.[1] ?? order.order_id ?? id}
                        </Avatar> */}
                        <Box
                          sx={{
                            px: 1.2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 13,
                            fontWeight: 600,
                            bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                            border: "1px solid",
                            borderColor: "divider",
                            color: theme.palette.text.primary,
                            fontFamily: "monospace",
                            minWidth: 90,
                            textAlign: "center",
                          }}
                        >
                          {order.order_id || id}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{order.orderType?.name || "Order"}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dateText ? `${new Date(dateText).toLocaleDateString()} • ${new Date(dateText).toLocaleTimeString()}` : "Date unknown"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ textAlign: "right", minWidth: 120 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{currency(order.paymentInfo?.totalPaid ?? order.total ?? 0)}</Typography>
                          <Typography variant="caption" color="text.secondary">{itemsCount} items</Typography>
                        </Box>

                        <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, fontSize: "0.75rem", ...getStatusProps(order.status) }}>
                          {(order.status || "pending").toString().charAt(0).toUpperCase() + (order.status || "pending").toString().slice(1)}
                        </Box>

                        <Button size="small" onClick={() => toggleOrder(id)} startIcon={isExpanded ? <ChevronDown /> : <ChevronRight />}>
                          {isExpanded ? "Hide" : "Details"}
                        </Button>
                      </Box>
                    </Box>

                    <Collapse in={isExpanded}>
                      <Divider sx={{ my: 2 }} />

                      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 320px" }} gap={2}>
                        {/* Left: order items (balanced) */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Order Items</Typography>
                          <Box>
                            {(order.items || []).map((it, idx) => (
                              <Box key={idx} display="flex" justifyContent="space-between" py={1} borderBottom="1px solid" borderColor="divider">
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{it.name}</Typography>
                                  {it.category_name && <Typography variant="caption" color="text.secondary">{it.category_name}</Typography>}
                                  {it.activeAddons?.length > 0 && (
                                    <Box mt={0.5} display="flex" gap={1} flexWrap="wrap">
                                      {it.activeAddons.map((a, ai) => (
                                        <Box key={ai} sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100", border: "1px solid", borderColor: "divider", fontSize: 12 }}>
                                          {a.name}
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Box>

                                <Box textAlign="right">
                                  <Typography variant="body2">{currency(it.total_price ?? it.price ?? 0)}</Typography>
                                  <Typography variant="caption" color="text.secondary">Qty: {it.quantity ?? 1}</Typography>
                                </Box>
                              </Box>
                            ))}

                            {(!order.items || order.items.length === 0) && (
                              <Typography variant="caption" color="text.secondary">No items present</Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Right: Payment & meta */}
                        <Box>
                          <Card sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
                            <CardContent>
                              <Typography variant="subtitle2">Payment Info</Typography>
                              <Divider sx={{ my: 1 }} />

                              <Box display="grid" gap={0.6}>
                                <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{currency(order.paymentInfo?.totalPaid ?? order.total ?? 0)}</Typography>

                                <Typography variant="caption" color="text.secondary">Tip</Typography>
                                <Typography variant="body2">{currency(order.paymentInfo?.tip ?? 0)}</Typography>

                                <Typography variant="caption" color="text.secondary">Return</Typography>
                                <Typography variant="body2">{currency(order.paymentInfo?.return ?? 0)}</Typography>
                              </Box>

                              <Box mt={2}>
                                <Typography variant="caption" color="text.secondary">Payment Methods</Typography>
                                <Box mt={1} display="flex" flexDirection="column" gap={1}>
                                  {(order.paymentInfo?.payments || []).length ? (
                                    order.paymentInfo.payments.map((p, pi) => (
                                      <Box key={pi} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, borderRadius: 1, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100", border: "1px solid", borderColor: "divider" }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                          <Eye size={14} />
                                          <Typography variant="body2">{p.typeName}</Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{currency(p.amount)}</Typography>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">No payment details</Typography>
                                  )}
                                </Box>
                              </Box>

                              <Divider sx={{ my: 1.5 }} />
                              <Box display="grid" gap={0.6}>
                                <Typography variant="caption" color="text.secondary">Customer</Typography>
                                <Typography variant="body2">{order.customer?.name || "N/A"}</Typography>
                                {order.customer?.email && <Typography variant="caption" color="text.secondary">{order.customer.email}</Typography>}
                                {order.customer?.phone && <Typography variant="caption" color="text.secondary">{order.customer.phone}</Typography>}
                              </Box>

                              <Box mt={1} display="grid" gap={0.6}>
                                <Typography variant="caption" color="text.secondary">Staff</Typography>
                                <Typography variant="body2">{order?.staff_id?.name || "N/A"}</Typography>
                                <Typography variant="caption" color="text.secondary">{order.orderType?.name || ""}</Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}

            {/* sentinel for infinite scroll */}
            <div ref={sentinelRef} />

            {/* small "loading more" indicator if there are more items to be shown */}
            {visibleCount < filteredOrders.length && (
              <Box textAlign="center" py={2}>
                <CircularProgress size={20} />
                <Typography variant="caption" color="text.secondary" display="block">Loading more...</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box mt={6}>
        <Typography variant="caption" color="text.secondary">
          Tip: You can export this report as CSV / XLSX / PDF using export button in the filter bar.
        </Typography>
      </Box>
    </Box>
  );
}
