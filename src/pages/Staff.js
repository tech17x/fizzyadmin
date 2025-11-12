// src/pages/Staff.jsx
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
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Stack,
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
import { toast } from "react-toastify";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import useFilteredData from "../hooks/filterData";
import { countryOptions, countryCodeOptions } from "../constants/countryOptions";

const API = process.env.REACT_APP_API_URL || "";

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

export default function Staff() {
  const { staff: currentStaff, logout, updateStaff } = useContext(AuthContext);

  // loading + data
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);

  // table / search / filters / pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // second screen / form flow
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  const [showSecondScreenSection, setShowSecondScreenSection] = useState("PROFILE"); // PROFILE | USER | BRAND | OUTLET
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // roles & permissions
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedPermissions, setCheckedPermissions] = useState({});

  // form state
  const emptyStaffForm = {
    _id: null,
    image: "",
    name: "",
    email: "",
    phone: "",
    country_code: countryCodeOptions[1]?.value || (countryCodeOptions[0] && countryCodeOptions[0].value) || "",
    password: "",
    pos_login_pin: "",
    status: true,
    role: "",
    permissions: [],
    brands: [],
    outlets: [],
  };
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [phone, setPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodeOptions[1] || countryCodeOptions[0]);

  // initialize from context
  useEffect(() => {
    if (!currentStaff) return;
    if (!currentStaff.permissions?.includes("staff_manage")) {
      logout();
      return;
    }
    // use brands/outlets from currentStaff
    setBrands(currentStaff.brands || []);
    setOutlets(currentStaff.outlets || []);
    setLoading(false);
  }, [currentStaff, logout]);

  // fetch authorized staff list
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API}/api/staff/staff/authorized`, { withCredentials: true });
      if (resp.data?.success) {
        setStaffList(resp.data.data || []);
      } else {
        console.error("Error fetching staff:", resp.data?.message);
      }
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // filter hook (reuses your hook)
  const filteredData = useFilteredData({
    data: staffList,
    searchTerm: search,
    searchKeys: ["name", "email", "phone", "role.name", "outlets.name", "brands.full_name"],
    filters: statusFilter === "all" ? {} : { status: statusFilter },
  });

  // pagination
  useEffect(() => setPage(0), [search, statusFilter, rowsPerPage]);
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const visibleRows = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // --- Second screen openers ---
  const openAddNew = async () => {
    setIsEditing(false);
    setStaffForm(emptyStaffForm);
    setPhone("");
    setSelectedCountryCode(countryCodeOptions[1] || countryCodeOptions[0]);
    await loadRolesAndPermissions(); // populate roles/permissions
    setShowSecondScreen(true);
    setShowSecondScreenSection("PROFILE");
  };

  const openEdit = async (s) => {
    setIsEditing(true);
    // populate staff form
    setStaffForm({
      _id: s._id || null,
      image: s.image || "",
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      country_code: s.country_code || (countryCodeOptions[1]?.value || ""),
      password: "",
      pos_login_pin: s.pos_login_pin || "",
      status: s.status === "active",
      role: s.role?._id || "",
      permissions: s.permissions || [],
      brands: (s.brands || []).map(b => (b._id ? b._id : b)),
      outlets: (s.outlets || []).map(o => (o._id ? o._id : o)),
    });
    setPhone(s.phone || "");
    setSelectedCountryCode(countryCodeOptions.find(opt => opt.value === s.country_code) || countryCodeOptions[1] || countryCodeOptions[0]);

    await loadRolesAndPermissions(s);
    setShowSecondScreen(true);
    setShowSecondScreenSection("PROFILE");
  };

  // load roles & permissions (and set selectedRole + checkedPermissions when editing)
  const loadRolesAndPermissions = async (editingStaff) => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API}/api/utils/roles-permissions`, { withCredentials: true });
      if (resp.data?.success) {
        const r = resp.data.data.roles || [];
        const p = resp.data.data.permissions || [];
        setRoles(r);
        setPermissions(p);

        if (editingStaff) {
          const filterRole = r.find(role => role._id === editingStaff.role?._id);
          if (filterRole) {
            setSelectedRole({ label: filterRole.name, value: filterRole._id });
            // set checked permissions (role defaults + staff.custom perms)
            const newChecked = {};
            // role defaults
            (filterRole.default_permissions || []).forEach(pm => { newChecked[pm] = true; });
            // staff explicit permissions
            (editingStaff.permissions || []).forEach(pm => { newChecked[pm] = true; });
            setCheckedPermissions(newChecked);
          } else {
            setSelectedRole(null);
            setCheckedPermissions({});
          }
        } else {
          // default role (if exists use index 4 like original, else first)
          const defaultRole = r[4] || r[0] || null;
          if (defaultRole) {
            const sel = { label: defaultRole.name, value: defaultRole._id };
            setSelectedRole(sel);
            const newChecked = {};
            (defaultRole.default_permissions || []).forEach(pm => { newChecked[pm] = true; });
            setCheckedPermissions(newChecked);
          } else {
            setSelectedRole(null);
            setCheckedPermissions({});
          }
        }
      } else {
        setRoles([]);
        setPermissions([]);
        console.error("Error loading roles & permissions:", resp.data?.message);
      }
    } catch (err) {
      console.error("Roles/Permissions API error:", err.response?.data || err.message);
      setRoles([]);
      setPermissions([]);
      setCheckedPermissions({});
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  // input helpers
  const setField = (key, value) => setStaffForm(s => ({ ...s, [key]: value }));

  const handlePermissionToggle = (permName) => {
    setCheckedPermissions(prev => ({ ...prev, [permName]: !prev[permName] }));
  };

  const handleBrandSelection = (brandId) => {
    const isAlready = staffForm.brands.includes(brandId);
    if (!isAlready) {
      const relatedOutlets = outlets.filter(o => o.brand_id === brandId);
      if (relatedOutlets.length === 0) {
        toast.info("No outlets found for the selected brand.");
      }
      setStaffForm(prev => ({ ...prev, brands: [...(prev.brands || []), brandId] }));
    } else {
      // remove brand and related outlets
      setStaffForm(prev => {
        const updatedOutlets = prev.outlets.filter(outletId => {
          const outlet = outlets.find(o => o._id === outletId);
          return outlet && outlet.brand_id !== brandId;
        });
        return {
          ...prev,
          brands: prev.brands.filter(id => id !== brandId),
          outlets: updatedOutlets,
        };
      });
    }
  };

  const handleOutletSelection = (outletId) => {
    setStaffForm(prev => {
      const isAlready = prev.outlets.includes(outletId);
      return {
        ...prev,
        outlets: isAlready ? prev.outlets.filter(id => id !== outletId) : [...prev.outlets, outletId],
      };
    });
  };

  const handleStatusToggle = () => {
    setStaffForm(prev => ({ ...prev, status: !prev.status }));
  };

  // Validation & uniqueness checks (same logic)
  const isDuplicateFieldForBrands = (field) => {
    return staffList.some(existing => {
      if (existing._id === staffForm._id) return false; // skip self
      const existingBrandIds = existing.brands?.map(b => b._id) || [];
      const currentBrandIds = staffForm.brands || [];
      const hasCommonBrand = existingBrandIds.some(id => currentBrandIds.includes(id));
      if (!hasCommonBrand) return false;

      const existingField = String(existing[field] || "").trim().toLowerCase();
      const currentField = String(staffForm[field] || "").trim().toLowerCase();
      return existingField === currentField && currentField !== "";
    });
  };

  // Save staff (create / update)
  const handleSaveStaff = async () => {
    setSaving(true);
    // validations
    const errors = [];
    if (!staffForm.name?.trim()) errors.push("Name is required.");
    if (!staffForm.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffForm.email)) errors.push("Valid email is required.");
    if (!staffForm.phone?.trim()) errors.push("Valid phone number is required.");
    if (!selectedRole?.value) errors.push("Role is required.");

    const selectedPermissions = Object.keys(checkedPermissions).filter(k => checkedPermissions[k]);
    if (!selectedPermissions.length) errors.push("Permissions must contain at least one item.");
    if (!Array.isArray(staffForm.brands) || staffForm.brands.length === 0) errors.push("At least one brand is required.");
    if (!Array.isArray(staffForm.outlets)) errors.push("Outlets must be an array.");

    if (!isEditing) {
      if (!staffForm.password?.trim()) errors.push("Password is required for new staff.");
      else if ((staffForm.password || "").length < 6) errors.push("Password must be at least 6 characters.");
    } else if (staffForm.password && staffForm.password.length > 0 && staffForm.password.length < 6) {
      errors.push("Password must be at least 6 characters.");
    }

    if (staffForm.pos_login_pin && !/^\d{4}$/.test(staffForm.pos_login_pin)) errors.push("POS login PIN must be a 4-digit number.");

    if (staffForm.name && isDuplicateFieldForBrands("name")) errors.push("Name already exists for this brand.");
    if (staffForm.email && isDuplicateFieldForBrands("email")) errors.push("Email already exists for this brand.");
    if (staffForm.phone && isDuplicateFieldForBrands("phone")) errors.push("Phone already exists for this brand.");

    if (errors.length) {
      errors.forEach(e => toast.error(e));
      setSaving(false);
      return;
    }

    const payload = {
      image: staffForm.image,
      name: staffForm.name,
      email: staffForm.email,
      phone: staffForm.phone,
      country_code: staffForm.country_code,
      role: selectedRole.value,
      permissions: selectedPermissions,
      brands: staffForm.brands,
      outlets: staffForm.outlets,
      status: isEditing ? (staffForm.status ? "active" : "inactive") : "active",
      owner_id: currentStaff.owner_id,
    };
    if (staffForm.password) payload.password = staffForm.password;
    if (staffForm.pos_login_pin) payload.pos_login_pin = staffForm.pos_login_pin;

    try {
      // prevent changing logged-in user's status
      if (isEditing && staffForm._id === currentStaff._id && !staffForm.status) {
        toast.error("You cannot change logged in user status.");
        setSaving(false);
        return;
      }

      if (isEditing) {
        const resp = await axios.put(`${API}/api/staff/update/${staffForm._id}`, payload, { withCredentials: true });
        const updated = resp.data.staff;
        setStaffList(prev => prev.map(s => (s._id === updated._id ? updated : s)));
        // if currentStaff list is stored in context, update it there too
        updateStaff?.({ ...currentStaff, staff: staffList });
        toast.success("Staff updated successfully!");
      } else {
        const resp = await axios.post(`${API}/api/staff/create`, payload, { withCredentials: true });
        setStaffList(prev => [...prev, resp.data.staff]);
        updateStaff?.({ ...currentStaff, staff: [...(currentStaff.staff || []), resp.data.staff] });
        toast.success("Staff created successfully!");
      }
      setShowSecondScreen(false);
    } catch (err) {
      console.error("Error saving staff:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "An error occurred while saving staff.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete staff "${s.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/api/staff/delete/${s._id}`, { withCredentials: true });
      const updated = staffList.filter(item => item._id !== s._id);
      setStaffList(updated);
      updateStaff?.({ ...currentStaff, staff: updated });
      toast.success("Staff deleted");
    } catch (err) {
      console.error("Delete staff error:", err);
      toast.error(err.response?.data?.message || "Failed to delete staff");
    }
  };

  // refresh (re-sync from context)
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setStaffList(prev => currentStaff?.staff || prev);
      setBrands(currentStaff?.brands || brands);
      setOutlets(currentStaff?.outlets || outlets);
      setLoading(false);
      toast.success("Refreshed");
    }, 250);
  };

  // exports & print (basic CSV / XLSX fallback)
  const rowsForExport = (rows) =>
    rows.map(r => [
      r._id,
      r.name,
      r.email,
      r.phone,
      r.role?.name || "",
      r.status,
    ]);

  const filenameBase = `staff-${new Date().toISOString().slice(0, 10)}`;

  const exportToCSV = (filename = `${filenameBase}.csv`) => {
    const rows = [["ID", "Name", "Email", "Phone", "Role", "Status"], ...rowsForExport(filteredData)];
    const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
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
      const XLSX = await import("xlsx").then(m => m.default || m);
      const rows = [["ID", "Name", "Email", "Phone", "Role", "Status"], ...rowsForExport(filteredData)];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Staff");
      XLSX.writeFile(wb, filename);
      toast.success("XLSX exported");
    } catch (err) {
      console.warn("XLSX failed, fallback CSV", err);
      exportToCSV(filename.replace(/\.xlsx?$/, ".csv"));
    }
  };

  const exportToPrint = (filename = filenameBase) => {
    const htmlRows = filteredData.map(r => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td>${escapeHtml(r.role?.name || "")}</td>
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
        <h2>Staff</h2>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead>
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

  // --- Render ---
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {!showSecondScreen ? (
        <>
          <Paper sx={{ mb: 3, p: { xs: 1, md: 2 }, borderRadius: 1 }}>
            <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                <Typography variant="h6">Staff</Typography>

                <TextField
                  size="small"
                  placeholder="Search staff..."
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

                <Button variant="contained" startIcon={<AddIcon />} onClick={openAddNew}>
                  Add Staff
                </Button>
              </Box>
            </Toolbar>
          </Paper>

          <Paper elevation={1} sx={{ borderRadius: 1, overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: "action.hover" }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        No staff found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((s) => (
                      <TableRow
                        key={s._id}
                        hover
                        sx={{
                          "&:hover": {
                            boxShadow: `0 1px 3px rgba(0,0,0,0.06)`,
                            borderLeft: `4px solid`,
                            borderColor: "primary.main",
                            backgroundColor: "action.selected",
                          },
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}>
                              {(s.name || "U").charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {new Date(s.createdAt || s.created_at || Date.now()).toLocaleString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>{s.email || "—"}</TableCell>

                        <TableCell>
                          {s.phone ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <PhoneEnabledIcon fontSize="small" /> <span>{s.phone}</span>
                            </Box>
                          ) : "—"}
                        </TableCell>

                        <TableCell>{s.role?.name || "—"}</TableCell>

                        <TableCell>
                          <Chip label={s.status === "active" ? "Active" : "Inactive"} color={s.status === "active" ? "success" : "default"} size="small" />
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(s)}><DeleteIcon fontSize="small" /></IconButton>
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
        </>
      ) : (
        // Second screen (full page) - keep your original flow but with MUI
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="h6">{isEditing ? "Edit Staff" : "Add Staff"}</Typography>

            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Button variant={showSecondScreenSection === "PROFILE" ? "contained" : "outlined"} onClick={() => setShowSecondScreenSection("PROFILE")}>Profile</Button>

              {/* When selectedRole is Admin & editing, hide other sections */}
              {!(selectedRole?.label === "Admin" && isEditing) && (
                <>
                  <Button variant={showSecondScreenSection === "USER" ? "contained" : "outlined"} onClick={() => setShowSecondScreenSection("USER")}>User Permissions</Button>
                  <Button variant={showSecondScreenSection === "BRAND" ? "contained" : "outlined"} onClick={() => setShowSecondScreenSection("BRAND")}>Brand Permissions</Button>
                  <Button
                    variant={showSecondScreenSection === "OUTLET" ? "contained" : "outlined"}
                    onClick={() => setShowSecondScreenSection("OUTLET")}
                    disabled={!((staffForm.brands || []).length > 0 && outlets.filter((item) => (staffForm.brands || []).includes(item.brand_id)).length > 0)}
                  >
                    Outlet Permissions
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {showSecondScreenSection === "PROFILE" && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Avatar
                    src={staffForm.image}
                    alt={staffForm.name || "avatar"}
                    sx={{ width: 120, height: 120, fontSize: 36 }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"; }}
                  />
                  <TextField label="Image URL" fullWidth size="small" value={staffForm.image} onChange={(e) => setField("image", e.target.value)} />
                </Box>
              </Grid>

              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Name" fullWidth required value={staffForm.name} onChange={(e) => setField("name", e.target.value)} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="Email" type="email" fullWidth required value={staffForm.email} onChange={(e) => setField("email", e.target.value)} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Grid container spacing={1}>
                      <Grid item xs={4} sm={3} md={3}>
                        <FormControl fullWidth size="big">
                          <Select
                            value={selectedCountryCode?.value || staffForm.country_code || ""}
                            onChange={(e) => {
                              const found = countryCodeOptions.find(c => String(c.value) === String(e.target.value)) || { value: e.target.value, label: e.target.value };
                              setSelectedCountryCode(found);
                              setField("country_code", found.value || found);
                            }}
                          >
                            {countryCodeOptions.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={8} sm={9} md={9}>
                        <TextField
                          label="Phone"
                          fullWidth
                          required
                          value={staffForm.phone}
                          onChange={(e) => { const v = e.target.value.replace(/[^\d+()-\s]/g, ""); setPhone(v); setField("phone", v); }}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneEnabledIcon /></InputAdornment>) }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="Password" type="password" fullWidth value={staffForm.password} onChange={(e) => setField("password", e.target.value)} placeholder={isEditing ? "Leave blank to keep current" : ""} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField label="POS PIN (4 digits)" fullWidth value={staffForm.pos_login_pin} onChange={(e) => setField("pos_login_pin", e.target.value.replace(/[^\d]/g, "").slice(0, 4))} />
                  </Grid>

                  {isEditing && (
                    <Grid item xs={12}>
                      <FormControlLabel control={<Switch checked={staffForm.status} onChange={handleStatusToggle} />} label="Active Status" />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}

          {showSecondScreenSection === "USER" && (
            <Box>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <Select
                  value={selectedRole?.value || ""}
                  onChange={(e) => {
                    const roleObj = roles.find(r => r._id === e.target.value);
                    if (roleObj) {
                      setSelectedRole({ label: roleObj.name, value: roleObj._id });
                      // set default permissions for the selected role
                      const newChecked = {};
                      (roleObj.default_permissions || []).forEach(pm => { newChecked[pm] = true; });
                      setCheckedPermissions(newChecked);
                    } else {
                      setSelectedRole(null);
                      setCheckedPermissions({});
                    }
                  }}
                >
                  {roles.map(r => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Permissions</Typography>
              <Box sx={{ maxHeight: 320, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}>
                {Array.from(new Set(permissions.map(p => p.category))).map(category => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ display: "block", mb: 1, color: "text.secondary" }}>{category}</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {permissions.filter(p => p.category === category).map(perm => (
                        <FormControlLabel
                          key={perm._id}
                          control={<Switch checked={!!checkedPermissions[perm.name]} onChange={() => handlePermissionToggle(perm.name)} disabled={selectedRole?.label === "Admin"} />}
                          label={perm.name}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {showSecondScreenSection === "BRAND" && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Brand Permissions</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {brands.map((b) => {
                    const checked = (staffForm.brands || []).includes(b._id);
                    return (
                      <FormControlLabel
                        key={b._id}
                        control={<Switch checked={checked} onChange={() => handleBrandSelection(b._id)} />}
                        label={b.full_name || b.short_name || b.name}
                      />
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          )}

          {showSecondScreenSection === "OUTLET" && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Outlet Permissions</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {outlets.filter(o => (staffForm.brands || []).includes(o.brand_id)).map(o => {
                    const checked = (staffForm.outlets || []).includes(o._id);
                    return (
                      <FormControlLabel
                        key={o._id}
                        control={<Switch checked={checked} onChange={() => handleOutletSelection(o._id)} />}
                        label={`${o.name} (${o.brand_name || ""})`}
                      />
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={handleSaveStaff} startIcon={isEditing ? <EditIcon /> : <AddIcon />} disabled={saving}>
              {isEditing ? "Update" : "Save"}
            </Button>

            <Button variant="outlined" onClick={() => { setShowSecondScreen(false); setShowSecondScreenSection("PROFILE"); }}>
              Close
            </Button>

            {saving && <CircularProgress size={20} sx={{ alignSelf: "center", ml: 1 }} />}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
