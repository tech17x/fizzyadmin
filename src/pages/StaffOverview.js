import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Clock, DollarSign, Users, TrendingUp, Calendar, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import {
  calculateWorkedHours,
  calculatePayroll,
  formatDuration,
  formatDate,
  formatTime,
} from "../utils/timeUtils";
import FilterDateRange from "../components/FilterDateRange";
import dayjs from "dayjs";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const StaffOverview = () => {
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

  // Data for overview/daily
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tabs
  const [tab, setTab] = useState("overview");

  // ------------------------------
  // Load brands & outlets
  // ------------------------------
  useEffect(() => {
    if (staff?.permissions?.includes("tax_manage")) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // ------------------------------
  // Filter outlets when brand changes
  // ------------------------------
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

  // ------------------------------
  // Fetch staffData for overview/daily
  // ------------------------------
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!selectedBrand || !selectedOutlet) return;
      const [startDate, endDate] = dateRange;
      if (!startDate || !endDate) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API}/api/payroll/day-staff-report`, {
          params: {
            brand_id: selectedBrand,
            outlet_id: selectedOutlet,
            start_date: startDate.toDate().toISOString(),
            end_date: endDate.toDate().toISOString(),
          },
          withCredentials: true,
        });

        if (response.data.success) {
          setStaffData(response.data.data);
          setPayrollRawData(response.data.data); // ✅ also feed payroll data
        } else {
          setError("Failed to load staff data");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching staff data");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [selectedBrand, selectedOutlet, dateRange]);

  // ------------------------------
  // Overview stats
  // ------------------------------
  const staffStats = useMemo(() => {
    return staffData.reduce((acc, shift) => {
      shift.staffPunchIns.forEach((punchIn) => {
        const staffName = punchIn.staff?.name || "Unknown Staff";
        const staffId = punchIn.staff?.id || "unknown";

        if (!acc[staffId]) {
          acc[staffId] = {
            name: staffName,
            email: punchIn.staff?.email || "N/A",
            totalHours: 0,
            totalShifts: 0,
            totalBreaks: 0,
            totalPayroll: 0,
          };
        }

        const workedHours = calculateWorkedHours(
          punchIn.punch_in,
          punchIn.punch_out,
          punchIn.breaks
        );

        acc[staffId].totalHours += workedHours;
        acc[staffId].totalShifts += 1;
        acc[staffId].totalBreaks += punchIn.breaks?.length || 0;
        acc[staffId].totalPayroll += calculatePayroll(workedHours);
      });
      return acc;
    }, {});
  }, [staffData]);

  const staffArrayOverview = Object.values(staffStats);
  const totalStaff = staffArrayOverview.length;
  const totalHoursOverview = staffArrayOverview.reduce((sum, s) => sum + s.totalHours, 0);
  const totalPayrollOverview = staffArrayOverview.reduce((sum, s) => sum + s.totalPayroll, 0);
  const totalShifts = staffArrayOverview.reduce((sum, s) => sum + s.totalShifts, 0);

  // ------------------------------
  // Payroll data (from old code)
  // ------------------------------
  const [payrollRawData, setPayrollRawData] = useState([]);
  const [staffRates, setStaffRates] = useState({});

  const handleRateChange = (staffId, type, value) => {
    setStaffRates((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [type]: parseFloat(value) >= 0 ? parseFloat(value) : 0,
      },
    }));
  };

  const payrollData = payrollRawData.reduce((acc, shift) => {
    shift.staffPunchIns.forEach((punchIn) => {
      const staffName = punchIn.staff?.name || "Unknown Staff";
      const staffId = punchIn.staff?.id || "unknown";

      if (!acc[staffId]) {
        acc[staffId] = {
          id: staffId,
          name: staffName,
          email: punchIn.staff?.email || "N/A",
          phone: punchIn.staff?.phone || "N/A",
          shifts: [],
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0,
          totalPay: 0,
          regularPay: 0,
          overtimePay: 0,
        };
      }

      const regularRate = staffRates[staffId]?.regularRate ?? 15;
      const overtimeRate = staffRates[staffId]?.overtimeRate ?? regularRate * 1.5;

      const workedHours = calculateWorkedHours(
        punchIn.punch_in,
        punchIn.punch_out,
        punchIn.breaks
      );

      const regularHours = Math.min(workedHours, 8);
      const overtimeHours = Math.max(0, workedHours - 8);

      const regularPay = calculatePayroll(regularHours, regularRate);
      const overtimePay = calculatePayroll(overtimeHours, overtimeRate);

      acc[staffId].shifts.push({
        date: new Date(shift.outletInfo.openTime).toLocaleDateString(),
        hours: workedHours,
        regularHours,
        overtimeHours,
        pay: regularPay + overtimePay,
      });

      acc[staffId].totalHours += workedHours;
      acc[staffId].regularHours += regularHours;
      acc[staffId].overtimeHours += overtimeHours;
      acc[staffId].regularPay += regularPay;
      acc[staffId].overtimePay += overtimePay;
      acc[staffId].totalPay += regularPay + overtimePay;
    });

    return acc;
  }, {});

  const staffArrayPayroll = Object.values(payrollData);

  // totals for payroll summary
  const totalPayroll = staffArrayPayroll.reduce((sum, s) => sum + s.totalPay, 0);
  const totalHours = staffArrayPayroll.reduce((sum, s) => sum + s.totalHours, 0);
  const totalRegularPay = staffArrayPayroll.reduce((sum, s) => sum + s.regularPay, 0);
  const totalOvertimePay = staffArrayPayroll.reduce((sum, s) => sum + s.overtimePay, 0);

  // Loading UI
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading staff data...</Typography>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Filter Bar (unchanged) */}
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

        {/* Row 1: Date Range */}
        <Box mb={2}>
          <FilterDateRange
            value={dateRange}
            onChange={(r) => setDateRange(r)}
            calendars={isSm ? 1 : 2}
          />
        </Box>

        {/* Row 2: brand + outlet */}
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
                value
                  ? filteredOutlets.find((o) => o._id === value)?.name
                  : "Select Outlet"
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
        </Stack>

        {/* Summary below filters */}
        <Typography variant="caption" color="text.secondary" mt={2} display="block">
          Showing data for{" "}
          <b>{dateRange[0]?.format("DD/MM/YYYY")}</b> →{" "}
          <b>{dateRange[1]?.format("DD/MM/YYYY")}</b>
          {selectedBrand && `, Brand: ${brands.find((b) => b._id === selectedBrand)?.full_name}`}
          {selectedOutlet && `, Outlet: ${filteredOutlets.find((o) => o._id === selectedOutlet)?.name}`}
        </Typography>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" value="overview" />
        <Tab label="Daily Shifts" value="daily" />
        <Tab label="Payroll Summary" value="payroll" />
      </Tabs>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tab Content */}
      {tab === "overview" && (
        <>
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
              { label: "Total Staff", value: totalStaff, icon: <Users size={18} />, color: "#6366f1" },
              { label: "Total Hours", value: formatDuration(totalHours), icon: <Clock size={18} />, color: "#22c55e" },
              { label: "Total Payroll", value: `$${totalPayroll.toFixed(2)}`, icon: <DollarSign size={18} />, color: "#f97316" },
              { label: "Total Shifts", value: totalShifts, icon: <TrendingUp size={18} />, color: "#a855f7" },
            ].map((stat, i) => (
              <Card
                key={i}
                sx={{
                  borderRadius: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 1,
                    py: 2.5,
                  }}
                >
                  <Avatar sx={{ bgcolor: stat.color, width: 44, height: 44 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h6">{stat.value}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Staff Performance */}
          <Card className="glass" sx={{ borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staff Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Breakdown of each staff member’s hours, shifts, breaks, and payroll.
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {staffArrayOverview.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Staff</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="right">Hours</TableCell>
                        <TableCell align="right">Shifts</TableCell>
                        <TableCell align="right">Breaks</TableCell>
                        <TableCell align="right">Payroll</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffArrayOverview.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar>{s.name.charAt(0)}</Avatar>
                              <Typography>{s.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell align="right">{formatDuration(s.totalHours)}</TableCell>
                          <TableCell align="right">{s.totalShifts}</TableCell>
                          <TableCell align="right">{s.totalBreaks}</TableCell>
                          <TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>
                            ${s.totalPayroll.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box py={6} textAlign="center">
                  <Typography variant="h6" color="text.secondary">
                    No staff data available.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Staff performance data will appear here once you have active employees or select a brand/outlet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "daily" && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Shifts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {staffData.length === 0 ? (
              <Box py={6} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  No shift data available
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Shift details will appear once you select a brand and outlet.
                </Typography>
              </Box>
            ) : (
              staffData.map((shift, index) => {
                const shiftDate = formatDate(shift.outletInfo.openTime);
                const openTime = formatTime(shift.outletInfo.openTime);
                const closeTime = formatTime(shift.outletInfo.closeTime);
                const totalOrders = shift.orders.length;
                const totalRevenue = shift.orders.reduce((sum, o) => sum + o.total, 0);

                return (
                  <Card
                    key={index}
                    sx={{
                      mb: 3,
                      borderRadius: 1,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <CardContent>
                      {/* Shift Header */}
                      <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: "primary.light" }}>
                            <Calendar size={18} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">{shiftDate}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {openTime} - {closeTime}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" gap={3} alignItems="center" mt={{ xs: 2, sm: 0 }}>
                          <Typography variant="body2" color="text.secondary">
                            <ShoppingCart size={14} /> {totalOrders} orders
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            <DollarSign size={14} /> ${totalRevenue.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Staff List */}
                      <Divider sx={{ mb: 2 }} />
                      {shift.staffPunchIns.length > 0 ? (
                        shift.staffPunchIns.map((p, i) => {
                          const worked = calculateWorkedHours(p.punch_in, p.punch_out, p.breaks);
                          const pay = calculatePayroll(worked);

                          return (
                            <Box key={i} mb={2} p={2} bgcolor="background.default" borderRadius={1}>
                              <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                                    <Clock size={16} />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {p.staff?.name || "Unknown Staff"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTime(p.punch_in)} - {formatTime(p.punch_out)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box display="flex" gap={3} textAlign="center" mt={{ xs: 2, sm: 0 }}>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {formatDuration(worked)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Hours
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {p.breaks?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Breaks
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600} color="success.main">
                                      ${pay.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Pay
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Breaks */}
                              {p.breaks?.length > 0 && (
                                <Box mt={1.5} ml={6}>
                                  <Typography variant="caption" fontWeight={600}>
                                    Breaks
                                  </Typography>
                                  <Box display="flex" flexWrap="wrap" gap={2} mt={0.5}>
                                    {p.breaks.map((b, j) => (
                                      <Typography key={j} variant="caption" color="text.secondary">
                                        {formatTime(b.start)} - {formatTime(b.end)}
                                      </Typography>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          );
                        })
                      ) : (
                        <Typography align="center" color="text.secondary">
                          No staff data available for this shift
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {tab === "payroll" && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payroll Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {staffArrayPayroll.length === 0 ? (
              <Typography align="center" color="text.secondary">
                No payroll data available
              </Typography>
            ) : (
              <Box>
                {/* Summary Cards */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Total Payroll
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ${(totalPayroll || 0).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Regular Pay
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="primary">
                        ${(totalRegularPay || 0).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Overtime Pay
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="warning.main">
                        ${(totalOvertimePay || 0).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Total Hours
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="secondary">
                        {formatDuration(totalHours || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Payroll Table */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Staff</TableCell>
                        <TableCell>Total Hours</TableCell>
                        <TableCell>Regular Hours</TableCell>
                        <TableCell>Overtime Hours</TableCell>
                        <TableCell>Regular Rate ($)</TableCell>
                        <TableCell>Overtime Rate ($)</TableCell>
                        <TableCell>Regular Pay</TableCell>
                        <TableCell>Overtime Pay</TableCell>
                        <TableCell>Total Pay</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffArrayPayroll.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar>{s.name.charAt(0)}</Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {s.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {s.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{formatDuration(s.totalHours)}</TableCell>
                          <TableCell>{formatDuration(s.regularHours)}</TableCell>
                          <TableCell>{formatDuration(s.overtimeHours)}</TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={staffRates[s.id]?.regularRate ?? 15}
                              onChange={(e) =>
                                handleRateChange(s.id, "regularRate", e.target.value)
                              }
                              style={{
                                width: "60px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                padding: "2px 6px",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                staffRates[s.id]?.overtimeRate ??
                                (staffRates[s.id]?.regularRate ?? 15) * 1.5
                              }
                              onChange={(e) =>
                                handleRateChange(s.id, "overtimeRate", e.target.value)
                              }
                              style={{
                                width: "60px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                padding: "2px 6px",
                              }}
                            />
                          </TableCell>
                          <TableCell>${(s.regularPay || 0).toFixed(2)}</TableCell>
                          <TableCell sx={{ color: "warning.main" }}>
                            ${(s.overtimePay || 0).toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "success.main" }}>
                            ${(s.totalPay || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

    </Box>
  );
};

export default StaffOverview;
