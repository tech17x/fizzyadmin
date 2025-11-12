// src/pages/Outlet.jsx
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
import PhoneEnabledIcon from "@mui/icons-material/PhoneEnabled";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import useFilteredData from "../hooks/filterData";
import { countryOptions, countryCodeOptions } from "../constants/countryOptions";
import { timezones } from "../constants/timezoneOptions";

const API = process.env.REACT_APP_API_URL || "";

export default function Outlet() {
    const theme = useTheme();
    const { staff, updateStaff, logout } = useContext(AuthContext);

    // data + loading
    const [outlets, setOutlets] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // filters / search
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // "" = all
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
        brand_id: "",
        name: "",
        code: "",
        password: "",
        email: "",
        phone: "",
        country_code: countryCodeOptions[1] || { label: "+91", value: "IN" },
        timezone: timezones[5] || { label: "(UTC+05:30) India Standard Time", value: "Asia/Kolkata" },
        opening_time: "",
        closing_time: "",
        website: "",
        street: "",
        city: "",
        state: "",
        country: countryOptions[1] || { label: "India", value: "india" },
        postal_code: "",
        status: true,
    };
    const [form, setForm] = useState(emptyForm);

    // load from staff context
    useEffect(() => {
        if (!staff) return;
        if (staff.permissions?.includes("outlet_manage")) {
            setOutlets(staff.outlets || []);
            setBrands(staff.brands || []);
            setLoading(false);
        } else {
            logout();
        }
    }, [staff, logout]);

    // filtered data
    const filteredData = useFilteredData({
        data: outlets,
        searchTerm: search,
        searchKeys: [
            "name",
            "code",
            "email",
            "phone",
            "website",
            "street",
            "city",
            "state",
            "country",
            "postal_code",
        ],
        filters: statusFilter ? { status: statusFilter } : {},
    }).filter((o) => (countryFilter ? String(o.country).toLowerCase() === String(countryFilter).toLowerCase() : true));

    // pagination reset on filters/search change
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

    const openEdit = (outlet) => {
        setIsEditing(true);
        setForm({
            _id: outlet._id || "",
            brand_id: outlet.brand_id || "",
            name: outlet.name || "",
            code: outlet.code || "",
            password: "",
            email: outlet.email || "",
            phone: outlet.phone || "",
            country_code: countryCodeOptions.find((c) => c.value === outlet.country_code) || countryCodeOptions[1],
            timezone: outlet.timezone || timezones[5],
            opening_time: outlet.opening_time || "",
            closing_time: outlet.closing_time || "",
            website: outlet.website || "",
            street: outlet.street || "",
            city: outlet.city || "",
            state: outlet.state || "",
            country: countryOptions.find((c) => String(c.value).toLowerCase() === String(outlet.country).toLowerCase()) || { label: outlet.country || "", value: outlet.country || "" },
            postal_code: outlet.postal_code || "",
            status: outlet.status === "active",
        });
        setDialogOpen(true);
    };

    const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    // validation
    const validateOutletData = (d) => {
        const errors = {};
        const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!d.brand_id) errors.brand_id = "Brand is required.";
        if (!d.name) errors.name = "Name is required.";
        if (!d.code) errors.code = "Code is required.";
        if (!d.email || !emailRegex.test(d.email)) errors.email = "Valid email is required.";
        if (!d.phone) errors.phone = "Phone is required.";
        if (!d.timezone?.value) errors.timezone = "Timezone is required.";
        if (!d.opening_time || !timeRegex.test(d.opening_time)) errors.opening_time = "Opening time must be in HH:mm format.";
        if (!d.closing_time || !timeRegex.test(d.closing_time)) errors.closing_time = "Closing time must be in HH:mm format.";
        if (!d.street) errors.street = "Street is required.";
        if (!d.city) errors.city = "City is required.";
        if (!d.state) errors.state = "State is required.";
        if (!d.country) errors.country = "Country is required.";

        return errors;
    };

    // save
    const handleSave = async () => {
        setSaving(true);
        const payload = {
            _id: form._id,
            brand_id: typeof form.brand_id === "object" ? form.brand_id.value : form.brand_id,
            name: String(form.name || "").trim(),
            code: String(form.code || "").trim(),
            password: String(form.password || "").trim(),
            email: String(form.email || "").trim(),
            phone: String(form.phone || "").trim(),
            country_code: form.country_code?.value ?? form.country_code ?? "",
            timezone: form.timezone,
            opening_time: String(form.opening_time || "").trim(),
            closing_time: String(form.closing_time || "").trim(),
            website: String(form.website || "").trim(),
            street: String(form.street || "").trim(),
            city: String(form.city || "").trim(),
            state: String(form.state || "").trim(),
            country: form.country?.value ?? form.country ?? "",
            postal_code: String(form.postal_code || "").trim(),
            status: form.status ? "active" : "inactive",
        };

        const errs = validateOutletData(payload);
        if (Object.keys(errs).length) {
            Object.values(errs).forEach((m) => toast.error(m));
            setSaving(false);
            return;
        }

        try {
            if (isEditing && payload._id) {
                const resp = await axios.put(`${API}/api/outlets/${payload._id}`, payload, { withCredentials: true });
                const updatedOutlet = resp.data.outlet;
                const updated = outlets.map((o) => (o._id === updatedOutlet._id ? updatedOutlet : o));
                setOutlets(updated);
                updateStaff({ ...staff, outlets: updated });
                toast.success("Outlet updated");
            } else {
                const resp = await axios.post(`${API}/api/outlets`, payload, { withCredentials: true });
                const newOutlet = resp.data.outlet;
                const updated = [...outlets, newOutlet];
                setOutlets(updated);
                updateStaff({ ...staff, outlets: updated });
                toast.success("Outlet created");
            }
            setDialogOpen(false);
        } catch (err) {
            console.error("Outlet save error:", err);
            toast.error(err.response?.data?.message || "Failed to save outlet");
        } finally {
            setSaving(false);
        }
    };

    // delete
    const handleDelete = async (o) => {
        if (!window.confirm(`Delete outlet "${o.name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/api/outlets/${o._id}`, { withCredentials: true });
            const updated = outlets.filter((x) => x._id !== o._id);
            setOutlets(updated);
            updateStaff({ ...staff, outlets: updated });
            toast.success("Outlet deleted");
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.response?.data?.message || "Failed to delete outlet");
        }
    };

    // refresh
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setOutlets(staff.outlets || []);
            setBrands(staff.brands || []);
            setLoading(false);
            toast.success("Refreshed");
        }, 250);
    };

    // Generate a random 4-digit code + 2 letters (example: "3482AB")
    const generateOutletCode = () => {
        const num = Math.floor(1000 + Math.random() * 9000); // 4-digit number
        const letters = Math.random().toString(36).substring(2, 4).toUpperCase(); // 2 random letters
        return `${num}${letters}`;
    };


    // exports
    const rowsForExport = (rows) =>
        rows.map((r) => [
            r._id,
            r.name,
            r.code,
            r.email,
            r.phone,
            r.city,
            r.state,
            r.country,
            r.status,
        ]);
    const filenameBase = `outlets-${new Date().toISOString().slice(0, 10)}`;

    const exportToCSV = (filename = `${filenameBase}.csv`) => {
        const rows = [
            ["ID", "Name", "Code", "Email", "Phone", "City", "State", "Country", "Status"],
            ...rowsForExport(filteredData),
        ];
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
            const rows = [
                ["ID", "Name", "Code", "Email", "Phone", "City", "State", "Country", "Status"],
                ...rowsForExport(filteredData),
            ];
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Outlets");
            XLSX.writeFile(wb, filename);
            toast.success("XLSX exported");
        } catch (err) {
            console.warn("XLSX export failed, falling back to CSV", err);
            exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
        }
    };

    const exportToPrint = (filename = filenameBase) => {
        const htmlRows = filteredData
            .map(
                (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.code)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td>${escapeHtml(r.city)}</td>
        <td>${escapeHtml(r.state)}</td>
        <td>${escapeHtml(r.country)}</td>
        <td>${escapeHtml(r.status)}</td>
      </tr>
    `
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
        <h2>Outlets</h2>
        <table>
          <thead><tr><th>Name</th><th>Code</th><th>Email</th><th>Phone</th><th>City</th><th>State</th><th>Country</th><th>Status</th></tr></thead>
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

    // helper to escape HTML in print
    function escapeHtml(str) {
        if (str == null) return "";
        return String(str).replace(/[&<>"'`=\/]/g, function (s) {
            return (
                {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                    "/": "&#x2F;",
                    "`": "&#x60",
                    "=": "&#x3D",
                }[s] || s
            );
        });
    }

    // visible rows
    const visibleRows = useMemo(
        () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredData, page, rowsPerPage]
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Paper sx={{ mb: 3, p: { xs: 1, md: 2 }, borderRadius: 1 }}>
                <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                        <Typography variant="h6">Outlets</Typography>

                        <TextField
                            size="small"
                            placeholder="Search outlets..."
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

                        <FormControl size="small" sx={{ width: { xs: 140, sm: 200 } }}>
                            <Select value={statusFilter} displayEmpty onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="">All status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ width: { xs: 140, sm: 240 } }}>
                            <Select displayEmpty value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
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
                            Add Outlet
                        </Button>
                    </Box>
                </Toolbar>
            </Paper>

            <Paper elevation={1} sx={{ borderRadius: 1, overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: 520 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ background: theme.palette.action.hover }}>
                                <TableCell>Name</TableCell>
                                <TableCell>Code</TableCell>
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
                                        No outlets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleRows.map((o) => (
                                    <TableRow
                                        key={o._id}
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
                                                    {(o.name || "O").charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                    {o.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell>{o.code || "—"}</TableCell>
                                        <TableCell>{o.email || "—"}</TableCell>

                                        <TableCell>
                                            {o.phone ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <PhoneEnabledIcon fontSize="small" /> <span>{o.phone}</span>
                                                </Box>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>

                                        <TableCell>{o.city || "—"}</TableCell>
                                        <TableCell>{o.state || "—"}</TableCell>
                                        <TableCell>{o.country || "—"}</TableCell>

                                        <TableCell>
                                            <Chip label={o.status === "active" ? "Active" : "Inactive"} color={o.status === "active" ? "success" : "default"} size="small" />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => openEdit(o)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDelete(o)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {isEditing ? "Edit Outlet" : "Add Outlet"}
                    <Box />
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="big">
                                <Select
                                    displayEmpty
                                    value={form.brand_id ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setField("brand_id", val);
                                    }}
                                >
                                    <MenuItem value="">Select brand</MenuItem>
                                    {brands.map((b) => (
                                        <MenuItem key={b._id} value={b._id}>
                                            {b.full_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Outlet Name" fullWidth required value={form.name} onChange={(e) => setField("name", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Outlet Code" fullWidth required value={form.code} onChange={(e) => setField("code", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Password" fullWidth value={form.password} onChange={(e) => setField("password", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Grid container spacing={1}>
                                <Grid item xs={4} sm={3} md={3}>
                                    <FormControl fullWidth size="big">
                                        <Select
                                            value={form.country_code?.value ?? form.country_code ?? ""}
                                            onChange={(e) => {
                                                const found = countryCodeOptions.find((c) => c.value === e.target.value) || { value: e.target.value, label: e.target.value };
                                                setField("country_code", found);
                                            }}
                                        >
                                            {countryCodeOptions.map((c) => (
                                                <MenuItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </MenuItem>
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
                            <FormControl fullWidth size="big">
                                <Select
                                    value={form.timezone?.value ?? ""}
                                    onChange={(e) => {
                                        const found = timezones.find((t) => t.value === e.target.value) || { value: e.target.value, label: e.target.value };
                                        setField("timezone", found);
                                    }}
                                >
                                    {timezones.map((t) => (
                                        <MenuItem key={t.value} value={t.value}>
                                            {t.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            {/* <TextField label="Opening Time (HH:mm)" fullWidth value={form.opening_time} onChange={(e) => setField("opening_time", e.target.value)} /> */}
                            <InputMask
                                mask="99:99"
                                value={form.opening_time}
                                onChange={(e) => setField("opening_time", e.target.value)}
                                maskChar="_"
                            >
                                {(inputProps) => (
                                    <TextField
                                        {...inputProps}
                                        label="Opening Time (HH:mm)"
                                        placeholder="HH:mm"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            </InputMask>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            {/* <TextField label="Closing Time (HH:mm)" fullWidth value={form.closing_time} onChange={(e) => setField("closing_time", e.target.value)} /> */}
                            <InputMask
                                mask="99:99"
                                value={form.closing_time}
                                onChange={(e) => setField("closing_time", e.target.value)}
                                maskChar="_"
                            >
                                {(inputProps) => (
                                    <TextField
                                        {...inputProps}
                                        label="Closing Time (HH:mm)"
                                        placeholder="HH:mm"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            </InputMask>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Street Address" fullWidth required value={form.street} onChange={(e) => setField("street", e.target.value)} />
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
                                    value={form.country?.value ?? form.country ?? ""}
                                    onChange={(e) => {
                                        const found = countryOptions.find((c) => c.value === e.target.value) || { value: e.target.value, label: e.target.value };
                                        setField("country", found);
                                    }}
                                >
                                    {countryOptions.map((c) => (
                                        <MenuItem key={c.value} value={c.value}>
                                            {c.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Postal Code" fullWidth required value={form.postal_code} onChange={(e) => setField("postal_code", e.target.value)} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="Website" fullWidth value={form.website} onChange={(e) => setField("website", e.target.value)} />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel control={<Switch checked={Boolean(form.status)} onChange={(e) => setField("status", e.target.checked)} />} label="Active" />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">
                        Cancel
                    </Button>
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
