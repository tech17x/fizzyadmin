// src/pages/NewVsRepeatCustomers.jsx
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
} from "@mui/material";
import {
    Calendar,
    RefreshCw,
    Download,
    FileText,
    FilePlus,
    ChevronDown,
    ChevronRight,
    CreditCard,
    Users,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import FilterDateRange from "../components/FilterDateRange"; // dayjs-based filter component
import SelectInput from "../components/SelectInput";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const currency = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        Number(v || 0)
    );

export default function NewVsRepeatCustomers() {
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

    // Data & UI
    const [data, setData] = useState(null); // response.data
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [expandedCustomers, setExpandedCustomers] = useState({});
    const [expandedOrders, setExpandedOrders] = useState({});
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

    // helper: to ISO using dayjs date objects (convert local to UTC ISO as your API expects)
    const toISO = (d, endOfDay = false) => {
        if (!d) return null;
        const dt = d.toDate();
        if (endOfDay) dt.setHours(23, 59, 59, 999);
        return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
    };

    // fetch data when filters change
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedBrand || !selectedOutlet || !dateRange?.[0] || !dateRange?.[1]) return;
            setLoading(true);
            setError(null);
            try {
                const resp = await axios.get(`${API}/api/reports/new-vs-repeat-customers`, {
                    params: {
                        brand_id: selectedBrand,
                        outlet_id: selectedOutlet,
                        start_date: toISO(dateRange[0], false),
                        end_date: toISO(dateRange[1], true),
                    },
                    withCredentials: true,
                });

                if (resp.data?.success) {
                    setData(resp.data);
                    toast.success("Customer analytics loaded");
                } else {
                    setError("Failed to load data");
                }
            } catch (err) {
                console.error(err);
                setError("Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedBrand, selectedOutlet, dateRange]);

    // refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (!selectedBrand || !selectedOutlet) {
                toast.info("Please select brand and outlet");
                setIsRefreshing(false);
                return;
            }
            setLoading(true);
            const resp = await axios.get(`${API}/api/reports/new-vs-repeat-customers`, {
                params: {
                    brand_id: selectedBrand,
                    outlet_id: selectedOutlet,
                    start_date: toISO(dateRange[0], false),
                    end_date: toISO(dateRange[1], true),
                },
                withCredentials: true,
            });
            if (resp.data?.success) {
                setData(resp.data);
                toast.success("Refreshed");
            } else {
                toast.error("Refresh failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Refresh failed");
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    const toggleCustomer = (id) =>
        setExpandedCustomers((s) => ({ ...s, [id]: !s[id] }));
    const toggleOrder = (id) => setExpandedOrders((s) => ({ ...s, [id]: !s[id] }));

    const formatDate = (d) => {
        if (!d) return "N/A";
        return dayjs(d).format("MMM DD, YYYY");
    };

    // Export helpers (CSV / XLSX)
    const exportToCSV = (filename = "customers_report.csv") => {
        if (!data) {
            toast.error("No data to export");
            return;
        }

        const rows = [];
        rows.push(["New vs Repeat Customers Report"]);
        rows.push([]);
        rows.push(["Summary"]);
        rows.push(["New Customers", data.data?.newCustomersCount ?? 0]);
        rows.push(["Repeat Customers", data.data?.repeatCustomersCount ?? 0]);
        rows.push(["Total Customers", data.data?.totalCustomers ?? 0]);
        rows.push([]);
        rows.push(["Repeat Customers"]);
        rows.push(["CustomerId", "Name", "Email", "Phone", "OrdersInPeriod", "TotalSpent"]);
        (data.data?.repeatCustomers || []).forEach((c) => {
            const total = (c.orders || []).filter((o) => o.status === "settle").reduce((s, o) => s + (o.total || 0), 0);
            rows.push([
                c.customerId || "",
                c.customerInfo?.name || "",
                c.customerInfo?.email || "",
                c.customerInfo?.phone || "",
                c.orders?.length || 0,
                total.toFixed(2),
            ]);
        });

        rows.push([]);
        rows.push(["New Customers"]);
        rows.push(["CustomerId", "Name", "Email", "Phone", "OrdersInPeriod", "TotalSpent"]);
        (data.data?.newCustomers || []).forEach((c) => {
            const total = (c.orders || []).filter((o) => o.status === "settle").reduce((s, o) => s + (o.total || 0), 0);
            rows.push([
                c.customerId || "",
                c.customerInfo?.name || "",
                c.customerInfo?.email || "",
                c.customerInfo?.phone || "",
                c.orders?.length || 0,
                total.toFixed(2),
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

    const exportToXLSX = async (filename = "customers_report.xlsx") => {
        try {
            const XLSX = await import("xlsx").then((m) => m.default || m);
            const rows = [
                ["CustomerId", "Name", "Email", "Phone", "Category", "OrdersInPeriod", "TotalSpent"],
            ];
            const pushRow = (c, category) => {
                const total = (c.orders || []).filter((o) => o.status === "settle").reduce((s, o) => s + (o.total || 0), 0);
                rows.push([
                    c.customerId || "",
                    c.customerInfo?.name || "",
                    c.customerInfo?.email || "",
                    c.customerInfo?.phone || "",
                    category,
                    c.orders?.length || 0,
                    total,
                ]);
            };
            (data.data?.repeatCustomers || []).forEach((c) => pushRow(c, "Repeat"));
            (data.data?.newCustomers || []).forEach((c) => pushRow(c, "New"));
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Customers");
            XLSX.writeFile(wb, filename);
            toast.success("XLSX exported");
        } catch (err) {
            console.warn("xlsx not available:", err);
            exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
        }
    };

    const handleExportOpen = (e) => setExportAnchor(e.currentTarget);
    const handleExportClose = () => setExportAnchor(null);

    // small loading state
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
                    <FilterDateRange
                        value={dateRange}
                        onChange={(r) => setDateRange(r)}
                        calendars={isSm ? 1 : 2}
                    />
                </Box>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="center"
                    mt={2}
                >
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
                            <IconButton onClick={handleExportOpen}>
                                <Download />
                            </IconButton>
                        </Tooltip>

                        <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportClose}>
                            <MUIMenuItem
                                onClick={() => {
                                    handleExportClose();
                                    exportToCSV(`new_vs_repeat_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.csv`);
                                }}
                            >
                                <FileText size={16} style={{ marginRight: 8 }} />
                                Export CSV
                            </MUIMenuItem>
                            <MUIMenuItem
                                onClick={() => {
                                    handleExportClose();
                                    exportToXLSX(`new_vs_repeat_${selectedBrand || "brand"}_${dayjs().format("YYYYMMDD")}.xlsx`);
                                }}
                            >
                                <FilePlus size={16} style={{ marginRight: 8 }} />
                                Export XLSX
                            </MUIMenuItem>
                        </Menu>
                    </Box>
                </Stack>

                <Typography variant="caption" color="text.secondary" mt={2} display="block">
                    Showing data for{" "}
                    <b>{dateRange[0]?.format("DD/MM/YYYY")}</b> → <b>{dateRange[1]?.format("DD/MM/YYYY")}</b>
                    {selectedBrand && `, Brand: ${brands.find((b) => b._id === selectedBrand)?.full_name}`}
                    {selectedOutlet && `, Outlet: ${filteredOutlets.find((o) => o._id === selectedOutlet)?.name}`}
                </Typography>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Report */}
            <div ref={reportRef}>
                {/* Summary cards */}
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
                            title: "New Customers",
                            value: data?.data?.newCustomersCount ?? 0,
                            subtitle: "Customers with first order in period",
                            icon: <Users size={18} />,
                            color: "#10B981",
                        },
                        {
                            title: "Repeat Customers",
                            value: data?.data?.repeatCustomersCount ?? 0,
                            subtitle: "Customers with prior orders",
                            icon: <Users size={18} />,
                            color: "#6366F1",
                        },
                        {
                            title: "Total Customers",
                            value: data?.data?.totalCustomers ?? 0,
                            subtitle: "All customers in period",
                            icon: <Users size={18} />,
                            color: "#3B82F6",
                        },
                    ].map((s, i) => (
                        <Card
                            key={i}
                            sx={{
                                borderRadius: 1.5,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                "&:hover": {
                                    transform: "translateY(-3px)",
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                                },
                                transition: "all 0.18s ease",
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <Avatar sx={{ bgcolor: s.color, width: 44, height: 44, mx: "auto", mb: 1 }}>
                                    {s.icon}
                                </Avatar>
                                <Typography variant="body2" color="text.secondary">
                                    {s.title}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {s.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {s.subtitle}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Repeat Customers */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <div>
                                <Typography variant="h6">Repeat Customers</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Customers who returned during the selected period
                                </Typography>
                            </div>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    {data?.timezone?.label ?? "Timezone unknown"}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {data?.data?.repeatCustomers?.length > 0 ? (
                            data.data.repeatCustomers.map((cust) => {
                                const id = cust.customerId;
                                const expanded = !!expandedCustomers[id];
                                const totalSpent = (cust.orders || []).filter((o) => o.status === "settle")
                                    .reduce((s, o) => s + (o.total || 0), 0);

                                return (
                                    <Box
                                        key={id}
                                        sx={{
                                            borderRadius: 1,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            p: 2,
                                            mb: 2,
                                            bgcolor: "background.paper",
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{
                                                    bgcolor: "linear-gradient(45deg,#06b6d4,#7c3aed)",
                                                    width: 48,
                                                    height: 48,
                                                }}>
                                                    {(cust.customerInfo?.name || "?").charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        {cust.customerInfo?.name || "Unknown Customer"}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {cust.customerId} {cust.customerInfo?.email ? ` • ${cust.customerInfo.email}` : ""}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box textAlign="right">
                                                <Typography variant="h6">{currency(totalSpent)}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Total Spent
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box display="flex" gap={2} mb={1}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Total Orders</Typography>
                                                <Typography variant="h6">{cust.orderCount ?? (cust.orders?.length ?? 0)}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Orders in Period</Typography>
                                                <Typography variant="h6">{cust.orders?.length ?? 0}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">First Order</Typography>
                                                <Typography variant="body2">{formatDate(cust.firstOrderDate)}</Typography>
                                            </Box>
                                        </Box>

                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="caption" color="text.secondary">
                                                {cust.orders?.length ?? 0} order{(cust.orders?.length || 0) !== 1 ? "s" : ""} in this period
                                            </Typography>
                                            <Button size="small" onClick={() => toggleCustomer(id)}>
                                                {expanded ? "Hide Orders" : "View Orders"}
                                            </Button>
                                        </Box>

                                        <Collapse in={expanded}>
                                            <Box mt={1} display="grid" gap={1}>
                                                {(cust.orders || []).map((order) => {
                                                    const oid = order.order_id || order._id;
                                                    const orderExpanded = !!expandedOrders[oid];
                                                    return (
                                                        <Card key={oid} variant="outlined" sx={{ bgcolor: "background.default" }}>
                                                            <CardContent sx={{ p: 1.5 }}>
                                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                    <Box>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                            #{(order.order_id || oid).split("_")?.[1] ?? oid}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {formatDate(order.createdAt)} • {order.itemCount ?? (order.items?.length ?? 0)} items
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box display="flex" alignItems="center" gap={2}>
                                                                        <Typography variant="subtitle2">{currency(order.total)}</Typography>
                                                                        <Button size="small" onClick={() => toggleOrder(oid)}>
                                                                            {orderExpanded ? <><ChevronDown /> Hide</> : <><ChevronRight /> Details</>}
                                                                        </Button>
                                                                    </Box>
                                                                </Box>

                                                                <Collapse in={orderExpanded}>
                                                                    <Box mt={1}>
                                                                        <Divider sx={{ my: 1 }} />
                                                                        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 300px" }} gap={2}>
                                                                            <Box>
                                                                                {(order.items || []).map((it, idx) => (
                                                                                    <Box key={idx} display="flex" justifyContent="space-between" py={0.8} borderBottom="1px solid" borderColor="divider">
                                                                                        <Box>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{it.name}</Typography>
                                                                                            <Typography variant="caption" color="text.secondary">{it.category_name}</Typography>
                                                                                        </Box>
                                                                                        <Box textAlign="right">
                                                                                            <Typography variant="body2">{currency(it.total_price ?? it.price)}</Typography>
                                                                                            <Typography variant="caption" color="text.secondary">Qty: {it.quantity ?? 1}</Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                ))}
                                                                            </Box>

                                                                            <Box>
                                                                                <Typography variant="subtitle2">Payment Info</Typography>
                                                                                <Divider sx={{ my: 1 }} />
                                                                                <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                                    {currency(order.paymentInfo?.totalPaid ?? order.total ?? 0)}
                                                                                </Typography>

                                                                                <Box mt={1}>
                                                                                    <Typography variant="caption" color="text.secondary">Tip</Typography>
                                                                                    <Typography variant="body2">{currency(order.paymentInfo?.tip ?? 0)}</Typography>
                                                                                </Box>

                                                                                <Box mt={1}>
                                                                                    <Typography variant="caption" color="text.secondary">Return</Typography>
                                                                                    <Typography variant="body2">{currency(order.paymentInfo?.return ?? 0)}</Typography>
                                                                                </Box>

                                                                                <Box mt={2}>
                                                                                    <Typography variant="caption" color="text.secondary">Payment Methods</Typography>
                                                                                    <Box mt={1} display="flex" flexDirection="column" gap={1}>
                                                                                        {(order.paymentInfo?.payments || []).length ? (
                                                                                            order.paymentInfo.payments.map((p, pi) => (
                                                                                                <Box key={pi} sx={{
                                                                                                    display: "flex",
                                                                                                    alignItems: "center",
                                                                                                    justifyContent: "space-between",
                                                                                                    p: 1,
                                                                                                    borderRadius: 1,
                                                                                                    bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                                                                                                    border: "1px solid",
                                                                                                    borderColor: "divider",
                                                                                                }}>
                                                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                                                        <CreditCard size={14} />
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
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Collapse>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </Box>
                                        </Collapse>
                                    </Box>
                                );
                            })
                        ) : (
                            <Typography color="text.secondary">No repeat customers in this period.</Typography>
                        )}
                    </CardContent>
                </Card>

                {/* New Customers */}
                <Card sx={{ mb: 6 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <div>
                                <Typography variant="h6">New Customers</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Customers whose first order falls into the selected period
                                </Typography>
                            </div>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {data?.data?.newCustomers?.length > 0 ? (
                            data.data.newCustomers.map((cust) => {
                                const id = cust.customerId;
                                const expanded = !!expandedCustomers[id];
                                const totalSpent = (cust.orders || []).filter((o) => o.status === "settle")
                                    .reduce((s, o) => s + (o.total || 0), 0);

                                return (
                                    <Box key={id} sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", p: 2, mb: 2 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ bgcolor: "linear-gradient(45deg,#10b981,#06b6d4)", width: 48, height: 48 }}>
                                                    {(cust.customerInfo?.name || "?").charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{cust.customerInfo?.name || "Unknown"}</Typography>
                                                    <Typography variant="caption" color="text.secondary">ID: {cust.customerId}</Typography>
                                                </Box>
                                            </Box>

                                            <Box textAlign="right">
                                                <Typography variant="h6">{currency(totalSpent)}</Typography>
                                                <Typography variant="caption" color="text.secondary">Total Spent</Typography>
                                            </Box>
                                        </Box>

                                        <Box display="flex" gap={2} mt={1} mb={1}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Total Orders</Typography>
                                                <Typography variant="h6">{cust.orderCount ?? (cust.orders?.length ?? 0)}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Orders in Period</Typography>
                                                <Typography variant="h6">{cust.orders?.length ?? 0}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">First Order</Typography>
                                                <Typography variant="body2">{formatDate(cust.firstOrderDate)}</Typography>
                                            </Box>
                                        </Box>

                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.secondary">
                                                {cust.orders?.length ?? 0} order{(cust.orders?.length || 0) !== 1 ? "s" : ""} in this period
                                            </Typography>
                                            <Button size="small" onClick={() => toggleCustomer(id)}>{expanded ? "Hide Orders" : "View Orders"}</Button>
                                        </Box>

                                        <Collapse in={expanded}>
                                            <Box mt={1} display="grid" gap={1}>
                                                {(cust.orders || []).map((order) => {
                                                    const oid = order.order_id || order._id;
                                                    const orderExpanded = !!expandedOrders[oid];
                                                    return (
                                                        <Card key={oid} variant="outlined">
                                                            <CardContent sx={{ p: 1.5 }}>
                                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                    <Box>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                            #{(order.order_id || oid).split("_")?.[1] ?? oid}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {formatDate(order.createdAt)} • {order.itemCount ?? (order.items?.length ?? 0)} items
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box display="flex" alignItems="center" gap={2}>
                                                                        <Typography variant="subtitle2">{currency(order.total)}</Typography>
                                                                        <Button size="small" onClick={() => toggleOrder(oid)}>
                                                                            {orderExpanded ? <><ChevronDown /> Hide</> : <><ChevronRight /> Details</>}
                                                                        </Button>
                                                                    </Box>
                                                                </Box>

                                                                <Collapse in={orderExpanded}>
                                                                    <Box mt={2}>
                                                                        <Divider sx={{ my: 2 }} />

                                                                        <Box
                                                                            sx={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                gap: 2,
                                                                                bgcolor: theme.palette.mode === "dark" ? "background.default" : "grey.50",
                                                                                borderRadius: 1.5,
                                                                                p: 2,
                                                                                border: "1px solid",
                                                                                borderColor: "divider",
                                                                            }}
                                                                        >
                                                                            {/* 🧾 ORDER ITEMS SECTION */}
                                                                            <Box>
                                                                                <Typography
                                                                                    variant="subtitle2"
                                                                                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
                                                                                >
                                                                                    Order Items
                                                                                </Typography>

                                                                                {(order.items || []).length ? (
                                                                                    order.items.map((it, idx) => (
                                                                                        <Box
                                                                                            key={idx}
                                                                                            sx={{
                                                                                                display: "flex",
                                                                                                justifyContent: "space-between",
                                                                                                alignItems: "flex-start",
                                                                                                py: 0.8,
                                                                                                borderBottom: "1px solid",
                                                                                                borderColor: "divider",
                                                                                            }}
                                                                                        >
                                                                                            <Box>
                                                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                                    {it.name}
                                                                                                </Typography>
                                                                                                <Typography variant="caption" color="text.secondary">
                                                                                                    {it.category_name}
                                                                                                </Typography>
                                                                                                {it.activeAddons?.length ? (
                                                                                                    <Box mt={0.5}>
                                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                                            Add-ons:
                                                                                                        </Typography>
                                                                                                        <Box mt={0.5} display="flex" gap={1} flexWrap="wrap">
                                                                                                            {it.activeAddons.map((a, ai) => (
                                                                                                                <Box
                                                                                                                    key={ai}
                                                                                                                    sx={{
                                                                                                                        px: 1,
                                                                                                                        py: 0.4,
                                                                                                                        borderRadius: 1,
                                                                                                                        bgcolor:
                                                                                                                            theme.palette.mode === "dark"
                                                                                                                                ? "grey.800"
                                                                                                                                : "grey.100",
                                                                                                                        fontSize: 12,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {a.name}
                                                                                                                </Box>
                                                                                                            ))}
                                                                                                        </Box>
                                                                                                    </Box>
                                                                                                ) : null}
                                                                                            </Box>

                                                                                            <Box textAlign="right">
                                                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                                                    {currency(it.total_price ?? it.price)}
                                                                                                </Typography>
                                                                                                <Typography variant="caption" color="text.secondary">
                                                                                                    Qty: {it.quantity ?? 1}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        </Box>
                                                                                    ))
                                                                                ) : (
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        No items found
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>

                                                                            {/* 💳 PAYMENT DETAILS */}
                                                                            <Box>
                                                                                <Typography
                                                                                    variant="subtitle2"
                                                                                    sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
                                                                                >
                                                                                    Payment Info
                                                                                </Typography>
                                                                                <Divider sx={{ mb: 1 }} />

                                                                                <Box
                                                                                    sx={{
                                                                                        display: "grid",
                                                                                        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                                                                                        gap: 2,
                                                                                        mb: 2,
                                                                                    }}
                                                                                >
                                                                                    <Box>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            Total Paid
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                                            {currency(order.paymentInfo?.totalPaid ?? order.total ?? 0)}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Box>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            Tip
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {currency(order.paymentInfo?.tip ?? 0)}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Box>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            Return
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {currency(order.paymentInfo?.return ?? 0)}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                </Box>

                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Payment Methods
                                                                                </Typography>
                                                                                <Box mt={1} display="flex" flexDirection="column" gap={1}>
                                                                                    {(order.paymentInfo?.payments || []).length ? (
                                                                                        order.paymentInfo.payments.map((p, pi) => (
                                                                                            <Box
                                                                                                key={pi}
                                                                                                sx={{
                                                                                                    display: "flex",
                                                                                                    alignItems: "center",
                                                                                                    justifyContent: "space-between",
                                                                                                    p: 1,
                                                                                                    borderRadius: 1,
                                                                                                    bgcolor:
                                                                                                        theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                                                                                                    border: "1px solid",
                                                                                                    borderColor: "divider",
                                                                                                }}
                                                                                            >
                                                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                                                    <CreditCard size={14} />
                                                                                                    <Typography variant="body2">{p.typeName}</Typography>
                                                                                                </Box>
                                                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                                                    {currency(p.amount)}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        ))
                                                                                    ) : (
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            No payment details available
                                                                                        </Typography>
                                                                                    )}
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Collapse>

                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </Box>
                                        </Collapse>
                                    </Box>
                                );
                            })
                        ) : (
                            <Typography color="text.secondary">No new customers in this period.</Typography>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Footer note */}
            <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                    Tip: Export CSV/XLSX from the export button in the filter bar.
                </Typography>
            </Box>
        </Box>
    );
}
