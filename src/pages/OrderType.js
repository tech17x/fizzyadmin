// src/pages/OrderType.jsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    Box,
    Paper,
    Toolbar,
    Typography,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Tooltip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    CircularProgress,
    Chip,
    Divider,
    useTheme,
    FormControlLabel,
    Switch,
} from "@mui/material";
import {
    Search as SearchIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    FileDownload as FileDownloadIcon,
    Print as PrintIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import useFilteredData from "../hooks/filterData";

const API = process.env.REACT_APP_API_URL || "";

const CATEGORIES = [
    { label: "Pickup", value: "pickup" },
    { label: "Dine-in", value: "dine-in" },
    { label: "Quick Service", value: "quick-service" },
    { label: "Delivery", value: "delivery" },
    { label: "Third Party", value: "third-party" },
];

function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/[&<>\"'`=\/]/g, function (s) {
        return ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
            "/": "&#x2F;",
            "`": "&#x60",
            "=": "&#x3D",
        }[s]);
    });
}

export default function OrderType() {
    const theme = useTheme();
    const { staff: currentStaff, logout } = useContext(AuthContext);

    const [orderTypes, setOrderTypes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // form
    const emptyForm = {
        _id: "",
        name: "",
        category: "",
        status: "active",
        brand_id: "",
        outlet_id: "",
    };
    const [form, setForm] = useState(emptyForm);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // permission guard + load brands/outlets from context
    useEffect(() => {
        if (!currentStaff) return;
        if (!currentStaff.permissions?.includes("order_type_manage")) {
            logout();
            return;
        }
        setBrands(currentStaff.brands || []);
        setOutlets(currentStaff.outlets || []);
    }, [currentStaff, logout]);

    // fetch order types
    const fetchOrderTypes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/order-type/accessible`, { withCredentials: true });
            const list = res.data?.orderTypes || [];
            setOrderTypes(list);
        } catch (err) {
            console.error("fetchOrderTypes:", err);
            toast.error("Failed to fetch order types");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrderTypes();
    }, [fetchOrderTypes]);

    // filtered list using your hook
    const filteredData = useFilteredData({
        data: orderTypes,
        searchTerm: search,
        searchKeys: ["name", "category", "brand_id.full_name", "outlet_id.name"],
        filters: statusFilter === "all" ? {} : { status: statusFilter },
    });

    useEffect(() => setPage(0), [search, statusFilter, rowsPerPage]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // open add
    const handleOpenAdd = () => {
        setIsEditing(false);
        setForm({ ...emptyForm });
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setFilteredOutlets([]);
        setSelectedCategory(null);
        setDialogOpen(true);
    };

    // open edit
    const handleOpenEdit = (t) => {
        setIsEditing(true);
        setForm({
            _id: t._id,
            name: t.name || "",
            category: t.category || "",
            status: t.status || "active",
            brand_id: t.brand_id?._id || t.brand_id || "",
            outlet_id: t.outlet_id?._id || t.outlet_id || "",
        });

        const b = (brands.find((b) => b._id === (t.brand_id?._id || t.brand_id)) || null);
        const outletOptions = outlets.filter((o) => o.brand_id === (b?._id || t.brand_id?._id || t.brand_id));
        const o = outlets.find((x) => x._id === (t.outlet_id?._id || t.outlet_id)) || null;

        setSelectedBrand(b ? { label: b.full_name, value: b._id } : null);
        setFilteredOutlets(outletOptions);
        setSelectedOutlet(o ? { label: o.name, value: o._id } : null);
        setSelectedCategory(CATEGORIES.find((c) => c.value === t.category) || null);
        setDialogOpen(true);
    };

    // handlers
    const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    const handleBrandChange = (val) => {
        if (!val) {
            setSelectedBrand(null);
            setFilteredOutlets([]);
            setSelectedOutlet(null);
            setField("brand_id", "");
            return;
        }
        const b = brands.find((x) => x._id === val.value) || null;
        const filtered = outlets.filter((o) => o.brand_id === val.value);
        setSelectedBrand(val);
        setFilteredOutlets(filtered);
        setSelectedOutlet(null);
        setField("brand_id", val.value);
        if (!filtered.length) toast.info("Selected brand has no outlets");
    };

    const handleOutletChange = (val) => {
        setSelectedOutlet(val || null);
        setField("outlet_id", val?.value || "");
    };

    const handleCategoryChange = (val) => {
        setSelectedCategory(val || null);
        setField("category", val?.value || "");
    };

    // uniqueness
    const isDuplicate = (field) => {
        return orderTypes.some((type) => {
            const outletId = type.outlet_id?._id || type.outlet_id;
            const compareValue = (type[field] || "").toString().trim().toLowerCase();
            const candidate = (form[field] || "").toString().trim().toLowerCase() || (selectedCategory?.value || "");
            return (
                outletId === (selectedOutlet?.value) &&
                compareValue === candidate &&
                type._id !== form._id
            );
        });
    };

    // save
    const handleSave = async () => {
        setSaving(true);

        // validations
        if (!form.name || form.name.trim().length < 3) {
            toast.error("Name must be at least 3 characters long.");
            setSaving(false);
            return;
        }
        if (form.name.trim().length > 50) {
            toast.error("Name cannot exceed 50 characters.");
            setSaving(false);
            return;
        }
        if (!selectedCategory?.value) {
            toast.error("Please select a category.");
            setSaving(false);
            return;
        }
        if (!form.status) {
            toast.error("Please select a status.");
            setSaving(false);
            return;
        }
        if (!selectedBrand?.value) {
            toast.error("Please select a brand.");
            setSaving(false);
            return;
        }
        if (!selectedOutlet?.value) {
            toast.error("Please select an outlet.");
            setSaving(false);
            return;
        }

        // category uniqueness (skip third-party)
        if (selectedCategory?.value !== "third-party" && isDuplicate("category")) {
            toast.error("Category already exists for this outlet.");
            setSaving(false);
            return;
        }

        if (form.name && isDuplicate("name")) {
            toast.error("Name already exists for this brand.");
            setSaving(false);
            return;
        }

        const payload = {
            name: form.name.trim(),
            category: selectedCategory.value,
            status: form.status,
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
        };

        try {
            if (isEditing && form._id) {
                const res = await axios.put(`${API}/api/order-type/update/${form._id}`, payload, { withCredentials: true });
                const updated = res.data.orderType;
                setOrderTypes((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
                toast.success("Order type updated");
            } else {
                const res = await axios.post(`${API}/api/order-type/create`, payload, { withCredentials: true });
                setOrderTypes((prev) => [...prev, res.data.orderType]);
                toast.success("Order type created");
            }
            setDialogOpen(false);
        } catch (err) {
            console.error("save error:", err);
            toast.error(err?.response?.data?.message || "Failed to save order type");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (type) => {
        if (!window.confirm(`Delete order type "${type.name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/api/order-type/delete/${type._id}`, { withCredentials: true });
            setOrderTypes((prev) => prev.filter((t) => t._id !== type._id));
            toast.success("Order type deleted");
        } catch (err) {
            console.error("delete error:", err);
            toast.error(err?.response?.data?.message || "Failed to delete order type");
        }
    };

    // exports
    const rowsForExport = (rows) =>
        rows.map((r) => [r._id, r.name, r.category, r.brand_id?.full_name || "", r.outlet_id?.name || "", r.status]);

    const filenameBase = `order-types-${new Date().toISOString().slice(0, 10)}`;

    const exportToCSV = (filename = `${filenameBase}.csv`) => {
        const rows = [["ID", "Name", "Category", "Brand", "Outlet", "Status"], ...rowsForExport(filteredData)];
        const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
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
        try {
            const XLSX = await import("xlsx").then((m) => m.default || m);
            const rows = [["ID", "Name", "Category", "Brand", "Outlet", "Status"], ...rowsForExport(filteredData)];
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "OrderTypes");
            XLSX.writeFile(wb, filename);
            toast.success("XLSX exported");
        } catch (err) {
            console.warn("XLSX failed, falling back to CSV", err);
            exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
        }
    };

    const exportToPrint = (filename = filenameBase) => {
        const htmlRows = filteredData
            .map(
                (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.category)}</td>
        <td>${escapeHtml(r.brand_id?.full_name || "")}</td>
        <td>${escapeHtml(r.outlet_id?.name || "")}</td>
        <td>${escapeHtml(r.status)}</td>
      </tr>`
            )
            .join("");

        const html = `
      <html><head><title>${filename}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 16px; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { padding: 8px 10px; border: 1px solid #e5e7eb; text-align:left; }
          th { background:#f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Order Types</h2>
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Brand</th><th>Outlet</th><th>Status</th></tr></thead>
          <tbody>${htmlRows}</tbody>
        </table>
      </body></html>
    `;

        const w = window.open("", "_blank", "width=900,height=700");
        if (!w) {
            toast.error("Popup blocked. Allow popups to print.");
            return;
        }
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 500);
    };

    // visible rows
    const visibleRows = useMemo(() => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredData, page, rowsPerPage]);

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setBrands(currentStaff?.brands || brands);
            setOutlets(currentStaff?.outlets || outlets);
            fetchOrderTypes();
            setLoading(false);
            toast.success("Refreshed");
        }, 200);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Paper sx={{ mb: 3, p: { xs: 1, md: 2 }, borderRadius: 1 }}>
                <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                        <Typography variant="h6">Order Types</Typography>

                        <TextField
                            size="small"
                            placeholder="Search order types..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                            sx={{ width: { xs: 140, sm: 320 } }}
                        />

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="all">All status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {filteredData.length} result(s)
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Tooltip title="Export CSV"><IconButton onClick={() => exportToCSV()}><FileDownloadIcon /></IconButton></Tooltip>
                        <Tooltip title="Export XLSX"><IconButton onClick={() => exportToXLSX()}><FileDownloadIcon /></IconButton></Tooltip>
                        <Tooltip title="Print"><IconButton onClick={() => exportToPrint(filenameBase)}><PrintIcon /></IconButton></Tooltip>
                        <Tooltip title="Refresh"><IconButton onClick={handleRefresh}><RefreshIcon /></IconButton></Tooltip>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>Add Order Type</Button>
                    </Box>
                </Toolbar>
            </Paper>

            <Paper elevation={1} sx={{ borderRadius: 1, overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: 520 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ background: theme.palette.action.hover }}>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Outlet</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell>
                                </TableRow>
                            ) : visibleRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>No order types found.</TableCell>
                                </TableRow>
                            ) : (
                                visibleRows.map((t) => (
                                    <TableRow key={t._id} hover>
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell><Chip label={t.category || "—"} size="small" /></TableCell>
                                        <TableCell>{t.brand_id?.full_name || "—"}</TableCell>
                                        <TableCell>{t.outlet_id?.name || "All Outlets"}</TableCell>
                                        <TableCell><Chip label={t.status === "active" ? "Active" : "Inactive"} color={t.status === "active" ? "success" : "default"} size="small" /></TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenEdit(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(t)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredData.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Rows"
                />
            </Paper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{isEditing ? "Edit Order Type" : "Add Order Type"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="big">
                                <Select
                                    displayEmpty
                                    value={selectedBrand?.value || form.brand_id || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const b = brands.find((x) => x._id === val) || null;
                                        handleBrandChange(b ? { label: b.full_name, value: b._id } : null);
                                    }}
                                >
                                    <MenuItem value="">Select Brand</MenuItem>
                                    {brands.map((b) => <MenuItem key={b._id} value={b._id}>{b.full_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="big">
                                <Select
                                    displayEmpty
                                    value={selectedOutlet?.value || form.outlet_id || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const o = outlets.find((x) => x._id === val) || null;
                                        handleOutletChange(o ? { label: o.name, value: o._id } : null);
                                    }}
                                    disabled={filteredOutlets.length === 0}
                                >
                                    <MenuItem value="">{!selectedBrand ? "Select a brand first" : "Select Outlet"}</MenuItem>
                                    {filteredOutlets.map((o) => <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="big">
                                <Select
                                    displayEmpty
                                    value={selectedCategory?.value || form.category || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const c = CATEGORIES.find((x) => x.value === val) || null;
                                        handleCategoryChange(c ? { label: c.label, value: c.value } : null);
                                    }}
                                >
                                    <MenuItem value="">Select Category</MenuItem>
                                    {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Type Name" fullWidth value={form.name} onChange={(e) => setField("name", e.target.value)} />
                        </Grid>

                        <FormControlLabel
                            control={<Switch checked={form.status === "active"} onChange={(e) => setField("status", e.target.checked ? "active" : "inactive")} />}
                            label="Active"
                        />

                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Cancel</Button>
                    <Box sx={{ position: "relative" }}>
                        <Button variant="contained" onClick={handleSave} disabled={saving}>{isEditing ? "Update" : "Create"}</Button>
                        {saving && <CircularProgress size={20} sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />}
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
