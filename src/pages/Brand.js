// src/pages/Brand.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
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
    TextareaAutosize,
    Switch,
    FormControlLabel,
    CircularProgress,
    Avatar,
    Chip,
    useTheme,
} from "@mui/material";
import {
    Search as SearchIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    FileDownload as FileDownloadIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Print as PrintIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import useFilteredData from "../hooks/filterData";
import PhoneEnabledIcon from "@mui/icons-material/PhoneEnabled";
import { countryOptions, countryCodeOptions } from "../constants/countryOptions";

const API = process.env.REACT_APP_API_URL || "";

function currency(v) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v || 0));
}

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
            "`": "&#x60",
            "=": "&#x3D",
        }[s]);
    });
}

export default function Brand() {
    const theme = useTheme();
    const { staff, updateStaff, logout } = useContext(AuthContext);

    // data + loading
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // filters / search
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [countryFilter, setCountryFilter] = useState("");

    // pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // dialog/form
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const emptyForm = {
        _id: "",
        full_name: "",
        short_name: "",
        gst_no: "",
        license_no: "",
        food_license: "",
        phone: "",
        country_code: countryCodeOptions[1] || { label: "+91", value: "IN" },
        email: "",
        website: "",
        city: "",
        state: "",
        country: countryOptions[1] || { label: "India", value: "india" },
        postal_code: "",
        street_address: "",
        status: true,
    };
    const [form, setForm] = useState(emptyForm);

    // load brands from staff context (you said APIs already work and staff has brands)
    useEffect(() => {
        if (!staff) return;
        if (staff.permissions?.includes("brand_manage")) {
            setBrands(staff.brands || []);
            setLoading(false);
        } else {
            logout();
        }
    }, [staff, logout]);

    // filtered data hook (re-uses your hook but we also apply country/status)
    const filteredData = useFilteredData({
        data: brands,
        searchTerm: search,
        searchKeys: [
            "full_name", "short_name", "email", "phone", "website", "city", "state", "country",
            "postal_code", "street_address", "gst_no", "license_no", "food_license",
        ],
        filters: statusFilter === "all" ? {} : { status: statusFilter },
    }).filter((b) => (countryFilter ? String(b.country).toLowerCase() === String(countryFilter).toLowerCase() : true));


    // pagination handlers
    useEffect(() => setPage(0), [search, statusFilter, countryFilter, rowsPerPage]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // form helpers
    const openAdd = () => {
        setIsEditing(false);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (brand) => {
        setIsEditing(true);
        setForm({
            _id: brand._id || "",
            full_name: brand.full_name || "",
            short_name: brand.short_name || "",
            gst_no: brand.gst_no || "",
            license_no: brand.license_no || "",
            food_license: brand.food_license || "",
            phone: brand.phone || "",
            country_code: countryCodeOptions.find((c) => c.value === brand.country_code) || countryCodeOptions[1],
            email: brand.email || "",
            website: brand.website || "",
            city: brand.city || "",
            state: brand.state || "",
            country: countryOptions.find((c) => String(c.value).toLowerCase() === String(brand.country).toLowerCase()) || countryOptions[1],
            postal_code: brand.postal_code || "",
            street_address: brand.street_address || "",
            status: brand.status === "active",
        });
        setDialogOpen(true);
    };

    const setField = (key, value) => setForm((s) => ({ ...s, [key]: value }));

    // validation (same rules you used)
    const validateBrandData = (brandData) => {
        const errors = {};
        if (!brandData.full_name) errors.full_name = "Brand name is required.";
        if (!brandData.short_name) errors.short_name = "Short name is required.";
        if (!brandData.email) errors.email = "Email is required.";
        if (!brandData.phone) errors.phone = "Phone number is required.";
        if (!brandData.gst_no) errors.gst_no = "GST number is required.";
        if (!brandData.license_no) errors.license_no = "License number is required.";
        if (!brandData.food_license) errors.food_license = "Food license is required.";
        if (!brandData.city) errors.city = "City is required.";
        if (!brandData.state) errors.state = "State is required.";
        if (!brandData.country) errors.country = "Country is required.";
        if (!brandData.country_code) errors.country_code = "Country code is required.";
        if (!brandData.postal_code) errors.postal_code = "Postal code is required.";
        if (!brandData.street_address) errors.street_address = "Street address is required.";
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (brandData.email && !emailRegex.test(brandData.email)) {
            errors.email = "Invalid email format.";
        }
        return errors;
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            _id: form._id,
            full_name: String(form.full_name).trim(),
            short_name: String(form.short_name).trim(),
            gst_no: String(form.gst_no).trim(),
            license_no: String(form.license_no).trim(),
            food_license: String(form.food_license).trim(),
            phone: String(form.phone).trim(),
            country_code: form.country_code?.value ?? form.country_code,
            email: String(form.email).trim(),
            website: String(form.website).trim(),
            city: String(form.city).trim(),
            state: String(form.state).trim(),
            country: form.country?.value ?? form.country,
            postal_code: String(form.postal_code).trim(),
            street_address: String(form.street_address).trim(),
            status: form.status ? "active" : "inactive",
        };

        const errs = validateBrandData({ ...payload, country: payload.country, country_code: payload.country_code });
        if (Object.keys(errs).length) {
            Object.values(errs).forEach((m) => toast.error(m));
            setSaving(false);
            return;
        }

        try {
            if (isEditing && payload._id) {
                const resp = await axios.put(`${API}/api/brands/${payload._id}`, payload, { withCredentials: true });
                const updatedBrand = resp.data.brand;
                const updated = brands.map((b) => (b._id === updatedBrand._id ? updatedBrand : b));
                setBrands(updated);
                updateStaff({ ...staff, brands: updated });
                toast.success("Brand updated");
            } else {
                const resp = await axios.post(`${API}/api/brands`, payload, { withCredentials: true });
                const newBrand = resp.data.brand;
                const updated = [...brands, newBrand];
                setBrands(updated);
                updateStaff({ ...staff, brands: updated });
                toast.success("Brand created");
            }
            setDialogOpen(false);
        } catch (err) {
            console.error("Brand save error:", err);
            toast.error(err.response?.data?.message || "Failed to save brand");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(`Delete brand "${brand.full_name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/api/brands/${brand._id}`, { withCredentials: true });
            const updated = brands.filter((b) => b._id !== brand._id);
            setBrands(updated);
            updateStaff({ ...staff, brands: updated });
            toast.success("Brand deleted");
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.response?.data?.message || "Failed to delete brand");
        }
    };

    // refresh (re-sync from staff context)
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setBrands(staff.brands || []);
            setLoading(false);
            toast.success("Refreshed");
        }, 250);
    };

    // Exports: CSV / XLSX / Print
    const rowsForExport = (rows) =>
        rows.map((r) => [
            r._id,
            r.short_name,
            r.full_name,
            r.email,
            r.phone,
            r.city,
            r.state,
            r.country,
            r.status,
        ]);

    const filenameBase = `brands-${new Date().toISOString().slice(0, 10)}`;

    const exportToCSV = (filename = `${filenameBase}.csv`) => {
        const rows = [["ID", "Short", "Full Name", "Email", "Phone", "City", "State", "Country", "Status"], ...rowsForExport(filteredData)];
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
            const rows = [["ID", "Short", "Full Name", "Email", "Phone", "City", "State", "Country", "Status"], ...rowsForExport(filteredData)];
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Brands");
            XLSX.writeFile(wb, filename);
            toast.success("XLSX exported");
        } catch (err) {
            console.warn("XLSX export failed, falling back to CSV", err);
            exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
        }
    };

    const exportToPrint = (filename = filenameBase) => {
        const htmlRows = filteredData.map((r) => `
      <tr>
        <td>${escapeHtml(r.short_name)}</td>
        <td>${escapeHtml(r.full_name)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td>${escapeHtml(r.city)}</td>
        <td>${escapeHtml(r.state)}</td>
        <td>${escapeHtml(r.country)}</td>
        <td>${escapeHtml(r.status)}</td>
      </tr>
    `).join("");
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
        <h2>Brands</h2>
        <table>
          <thead><tr><th>Short</th><th>Full Name</th><th>Email</th><th>Phone</th><th>City</th><th>State</th><th>Country</th><th>Status</th></tr></thead>
          <tbody>${htmlRows}</tbody>
        </table>
      </body></html>
    `;
        const w = window.open("", "_blank", "width=900,height=700");
        if (!w) { toast.error("Popup blocked. Allow popups to print."); return; }
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 500);
    };

    // visible rows for table page
    const visibleRows = useMemo(() => {
        return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

    // Render
    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Paper sx={{ mb: 3, p: { xs: 1, md: 2 }, borderRadius: 1 }}>
                <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                        <Typography variant="h6">Brands</Typography>

                        <TextField
                            size="small"
                            placeholder="Search brands..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: { xs: 140, sm: 320 } }}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="all">All status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <Select
                                displayEmpty
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                            >
                                <MenuItem value="">All countries</MenuItem>
                                {countryOptions.map((c) => (
                                    <MenuItem key={c.value} value={c.value}>
                                        {c.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {filteredData.length} result(s)
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Tooltip title="Export CSV">
                            <IconButton onClick={() => exportToCSV()}>
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Export XLSX">
                            <IconButton onClick={() => exportToXLSX()}>
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Print">
                            <IconButton onClick={() => exportToPrint(filenameBase)}>
                                <PrintIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Refresh">
                            <IconButton onClick={handleRefresh}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>

                        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
                            Add Brand
                        </Button>
                    </Box>
                </Toolbar>
            </Paper>

            <Paper elevation={1} sx={{
                borderRadius: 1,
                overflow: "hidden",
                // subtle shadow + hover border handled per-row
            }}>
                <TableContainer sx={{ maxHeight: 520 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ background: theme.palette.action.hover }}>
                                <TableCell>Short</TableCell>
                                <TableCell>Full Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>State</TableCell>
                                <TableCell>Country</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : visibleRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                        No brands found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleRows.map((b) => (
                                    <TableRow
                                        key={b._id}
                                        hover
                                        sx={{
                                            "&:hover": {
                                                boxShadow: `0 1px 3px rgba(0,0,0,0.06)`,
                                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                                backgroundColor: theme.palette.action.selected,
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>
                                                    {(b.short_name || "B").charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{b.short_name}</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{b.full_name}</Typography>
                                            {b.website && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {b.website}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>{b.email || "—"}</TableCell>
                                        <TableCell>
                                            {b.phone ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <PhoneEnabledIcon fontSize="small" /> <span>{b.phone}</span>
                                                </Box>
                                            ) : "—"}
                                        </TableCell>

                                        <TableCell>{b.city || "—"}</TableCell>
                                        <TableCell>{b.state || "—"}</TableCell>
                                        <TableCell>{b.country || "—"}</TableCell>

                                        <TableCell>
                                            <Chip label={b.status === "active" ? "Active" : "Inactive"} color={b.status === "active" ? "success" : "default"} size="small" />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => openEdit(b)}><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDelete(b)}><DeleteIcon fontSize="small" /></IconButton>
                                            </Tooltip>
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

            {/* Dialog: Add / Edit */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {isEditing ? "Edit Brand" : "Add Brand"}
                    <Box />
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField label="Brand Name" fullWidth required value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Short Name" fullWidth required value={form.short_name} onChange={(e) => setField("short_name", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="GST No" fullWidth required value={form.gst_no} onChange={(e) => setField("gst_no", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="License No" fullWidth required value={form.license_no} onChange={(e) => setField("license_no", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Food License" fullWidth required value={form.food_license} onChange={(e) => setField("food_license", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Grid container spacing={1}>
                                <Grid item xs={4} sm={3} md={3}>
                                    <FormControl fullWidth size="big">
                                        <Select
                                            value={form.country_code?.value || ""}
                                            onChange={(e) => {
                                                const found = countryCodeOptions.find(c => c.value === e.target.value) || { value: e.target.value, label: e.target.value };
                                                setField("country_code", found);
                                            }}
                                        >
                                            {countryCodeOptions.map((c) => (
                                                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={8} sm={9} md={9}>
                                    <TextField
                                        label="Phone"
                                        fullWidth
                                        required
                                        value={form.phone}
                                        onChange={(e) => setField("phone", e.target.value.replace(/[^\d+()-\s]/g, ""))}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneEnabledIcon /></InputAdornment> }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Email" type="email" fullWidth required value={form.email} onChange={(e) => setField("email", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Website" fullWidth value={form.website} onChange={(e) => setField("website", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Street Address" fullWidth required value={form.street_address} onChange={(e) => setField("street_address", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="City" fullWidth required value={form.city} onChange={(e) => setField("city", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="State" fullWidth required value={form.state} onChange={(e) => setField("state", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="big">
                                <Select
                                    value={form.country?.value || ""}
                                    onChange={(e) => {
                                        const found = countryOptions.find(c => c.value === e.target.value) || { value: e.target.value, label: e.target.value };
                                        setField("country", found);
                                    }}
                                >
                                    {countryOptions.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Postal Code" fullWidth required value={form.postal_code} onChange={(e) => setField("postal_code", e.target.value)} />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel control={<Switch checked={form.status} onChange={(e) => setField("status", e.target.checked)} />} label="Active" />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">Cancel</Button>
                    <Box sx={{ position: "relative" }}>
                        <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={isEditing ? <EditIcon /> : <AddIcon />}>
                            {isEditing ? "Update" : "Save"}
                        </Button>
                        {saving && <CircularProgress size={20} sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />}
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
