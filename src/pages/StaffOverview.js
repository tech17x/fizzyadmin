import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  FileDown,
  Printer,
  CalendarDays,
  Search,
  PrinterIcon,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import {
  calculateWorkedHours,
  calculatePayroll,
  formatDuration,
  formatDate,
  formatTime,
} from "../utils/timeUtils";
import FilterPanel from "../components/FilterPanel";
import PageHeader from "../components/PageHeader";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function toCSV(rows = [], fields = []) {
  if (!rows || rows.length === 0) return "";
  const esc = (v) =>
    `"${String(v ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const header = fields.map((f) => esc(f)).join(",");
  const lines = rows.map((r) =>
    fields
      .map((f) => {
        if (f.includes(".")) {
          const parts = f.split(".");
          let val = r;
          for (const p of parts) {
            val = val?.[p];
            if (val === undefined) break;
          }
          return esc(val);
        }
        return esc(r[f]);
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

const StaffOverview = () => {
  const { staff, logout } = useContext(AuthContext);

  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [tab, setTab] = useState("overview");
  const [staffData, setStaffData] = useState([]);
  const [payrollRawData, setPayrollRawData] = useState([]);
  const [staffRates, setStaffRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const quickRanges = [
    { label: "Today", range: [dayjs().startOf("day"), dayjs().endOf("day")] },
    { label: "This Week", range: [dayjs().startOf("week"), dayjs().endOf("week")] },
    {
      label: "Last Week",
      range: [
        dayjs().subtract(1, "week").startOf("week"),
        dayjs().subtract(1, "week").endOf("week"),
      ],
    },
    { label: "This Month", range: [dayjs().startOf("month"), dayjs().endOf("month")] },
    {
      label: "Last Month",
      range: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    { label: "Last 3 Months", range: [dayjs().subtract(3, "month").startOf("month"), dayjs()] },
    { label: "Last 6 Months", range: [dayjs().subtract(6, "month").startOf("month"), dayjs()] },
  ];

  useEffect(() => {
    if (staff?.permissions?.includes("tax_manage")) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout?.();
    }
  }, [staff, logout]);

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

        if (response.data?.success) {
          setStaffData(response.data.data);
          setPayrollRawData(response.data.data);
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

  const handleRateChange = (staffId, type, value) => {
    setStaffRates((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [type]: parseFloat(value) >= 0 ? parseFloat(value) : 0,
      },
    }));
  };

  const staffStats = useMemo(() => {
    return staffData.reduce((acc, shift) => {
      (shift.staffPunchIns || []).forEach((punchIn) => {
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

  const payrollData = useMemo(() => {
    const acc = {};
    (payrollRawData || []).forEach((shift) => {
      (shift.staffPunchIns || []).forEach((punchIn) => {
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
          date: shift.outletInfo?.openTime ? new Date(shift.outletInfo.openTime).toLocaleDateString() : "",
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
    });
    return Object.values(acc);
  }, [payrollRawData, staffRates]);

  const totalPayroll = payrollData.reduce((sum, s) => sum + s.totalPay, 0);
  const totalHours = payrollData.reduce((sum, s) => sum + s.totalHours, 0);
  const totalRegularPay = payrollData.reduce((sum, s) => sum + s.regularPay, 0);
  const totalOvertimePay = payrollData.reduce((sum, s) => sum + s.overtimePay, 0);

  const downloadBlob = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime || "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = (type) => {
    if (type === "Overview") {
      const rows = staffArrayOverview.map((s) => ({
        Staff: s.name,
        Email: s.email,
        Hours: formatDuration(s.totalHours),
        Shifts: s.totalShifts,
        Breaks: s.totalBreaks,
        Payroll: s.totalPayroll.toFixed(2),
      }));
      const csv = toCSV(rows, ["Staff", "Email", "Hours", "Shifts", "Breaks", "Payroll"]);
      downloadBlob(csv, `payroll_overview_${dayjs().format("YYYYMMDD")}.csv`);
      toast.success("Overview CSV exported");
    } else if (type === "Payroll") {
      const rows = payrollData.map((p) => ({
        Staff: p.name,
        Email: p.email,
        "Total Hours": formatDuration(p.totalHours),
        "Regular Hours": formatDuration(p.regularHours),
        "Overtime Hours": formatDuration(p.overtimeHours),
        "Regular Rate": (staffRates[p.id]?.regularRate ?? 15).toFixed(2),
        "Overtime Rate": (staffRates[p.id]?.overtimeRate ?? (staffRates[p.id]?.regularRate ?? 15) * 1.5).toFixed(2),
        "Regular Pay": p.regularPay.toFixed(2),
        "Overtime Pay": p.overtimePay.toFixed(2),
        "Total Pay": p.totalPay.toFixed(2),
      }));
      const csv = toCSV(rows, [
        "Staff",
        "Email",
        "Total Hours",
        "Regular Hours",
        "Overtime Hours",
        "Regular Rate",
        "Overtime Rate",
        "Regular Pay",
        "Overtime Pay",
        "Total Pay",
      ]);
      downloadBlob(csv, `payroll_summary_${dayjs().format("YYYYMMDD")}.csv`);
      toast.success("Payroll CSV exported");
    } else if (type === "Orders") {
      const orders = [];
      (staffData || []).forEach((shift) => {
        (shift.orders || []).forEach((o) =>
          orders.push({
            order_id: o.order_id,
            status: o.status,
            total: o.total,
            subtotal: o.subtotal,
            staff: o.staff?.name || "",
            orderType: o.orderType || "",
            createdAt: o.createdAt || "",
          })
        );
      });
      const csv = toCSV(orders, ["order_id", "status", "total", "subtotal", "staff", "orderType", "createdAt"]);
      downloadBlob(csv, `orders_${dayjs().format("YYYYMMDD")}.csv`);
      toast.success("Orders CSV exported");
    } else if (type === "Print") {
      const printWindow = window.open("", "_blank", "width=900,height=650");
      if (!printWindow) {
        toast.error("Unable to open print window");
        return;
      }
      const html = `
        <html>
          <head>
            <title>Payroll Report - ${dayjs().format("YYYY-MM-DD")}</title>
            <style>
              body{font-family: Inter, Arial, sans-serif; color:#111;}
              table{width:100%; border-collapse: collapse; margin-top:16px;}
              th,td{padding:8px 10px; border:1px solid #ddd; text-align:left;}
              th{background:#f7f7f7;}
              h1{font-size:18px;}
            </style>
          </head>
          <body>
            <h1>Payroll Summary (${dayjs().format("DD MMM YYYY")})</h1>
            <p>Total Staff: ${totalStaff} • Total Hours: ${formatDuration(totalHours)} • Total Payroll: $${totalPayroll.toFixed(2)}</p>

            <h2 style="margin-top:16px">Staff Payroll</h2>
            <table>
              <thead>
                <tr>
                  <th>Staff</th><th>Email</th><th>Total Hours</th><th>Total Pay</th>
                </tr>
              </thead>
              <tbody>
                ${payrollData.map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.email}</td>
                    <td>${formatDuration(p.totalHours)}</td>
                    <td>$${(p.totalPay || 0).toFixed(2)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-slate-600 text-lg font-medium">Loading staff data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      <div className="max-w-[1400px] mx-auto pt-28 pb-20 px-8">

        <PageHeader
          title="Payroll & Staff Analytics"
          description="Comprehensive staff performance tracking with payroll insights. Monitor hours, analyze shifts, and export detailed reports for bookkeeping."
          exportOptions={[
            { label: "Overview CSV", value: "Overview" },
            { label: "Payroll CSV", value: "Payroll" },
            { label: "Orders CSV", value: "Orders" },
            { label: "Print Report", value: "Print", icon: <PrinterIcon size={16} /> },
          ]}
          onExport={handleExport}
        />

        <FilterPanel
          brands={brands}
          outlets={outlets}
          filteredOutlets={filteredOutlets}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedOutlet={selectedOutlet}
          setSelectedOutlet={setSelectedOutlet}
          dateRange={dateRange}
          setDateRange={setDateRange}
          quickRanges={quickRanges}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="max-w-[1400px] mx-auto mb-10 flex gap-8 border-b-2 border-slate-200">
          {["overview", "daily", "payroll"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 capitalize text-base font-bold tracking-wide transition-all duration-200 ${tab === t
                ? "text-emerald-600 border-b-3 border-emerald-600 -mb-0.5"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
        

        <div>
          {error && <div className="text-red-600 mb-6 text-lg font-medium">{error}</div>}

          {staffData.length === 0 && !loading ? (
            <div className="text-center py-24 text-slate-400 text-lg italic">No data available for this selection.</div>
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                      { label: "Total Staff", icon: <Users size={22} />, value: totalStaff, color: "from-blue-500 to-blue-600" },
                      { label: "Total Orders", icon: <TrendingUp size={22} />, value: (staffData || []).reduce((acc, s) => acc + (s.orders?.length || 0), 0), color: "from-violet-500 to-violet-600" },
                      { label: "Total Hours", icon: <Clock size={22} />, value: formatDuration(totalHours), color: "from-amber-500 to-amber-600" },
                      { label: "Total Payroll", icon: <DollarSign size={22} />, value: `$${totalPayroll.toFixed(2)}`, color: "from-emerald-500 to-emerald-600" },
                    ].map((s, i) => (
                      <div key={i} className="p-7 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>{s.icon}</div>
                          <p className="text-sm font-semibold text-slate-600 tracking-wide uppercase">{s.label}</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900">{s.value}</h3>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <h3 className="text-2xl font-bold mb-3 text-slate-900">Staff Performance</h3>
                    <p className="text-base text-slate-600 mb-6">Detailed breakdown of each staff member's hours, shifts, breaks, and payroll.</p>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b-2 border-slate-200">
                          <tr>
                            <th className="py-4 pr-8">Staff</th>
                            <th className="py-4 pr-8">Email</th>
                            <th className="py-4 pr-8">Hours</th>
                            <th className="py-4 pr-8">Shifts</th>
                            <th className="py-4 pr-8">Breaks</th>
                            <th className="py-4 pr-8">Payroll</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staffArrayOverview.map((s, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-5 pr-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-base font-bold text-white shadow-md">{(s.name || "U").charAt(0)}</div>
                                  <div>
                                    <div className="text-base font-semibold text-slate-900">{s.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 pr-8 text-base text-slate-600">{s.email}</td>
                              <td className="py-5 pr-8 text-base font-medium text-slate-800">{formatDuration(s.totalHours)}</td>
                              <td className="py-5 pr-8 text-base font-medium text-slate-800">{s.totalShifts}</td>
                              <td className="py-5 pr-8 text-base font-medium text-slate-800">{s.totalBreaks}</td>
                              <td className="py-5 pr-8 text-base font-bold text-emerald-600">${s.totalPayroll.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {tab === "daily" && (
                <div className="space-y-6">
                  {(staffData || []).map((shift, idx) => {
                    const shiftDate = shift.outletInfo?.openTime ? formatDate(shift.outletInfo.openTime) : "—";
                    const openTime = shift.outletInfo?.openTime ? formatTime(shift.outletInfo.openTime) : "—";
                    const closeTime = shift.outletInfo?.closeTime ? formatTime(shift.outletInfo.closeTime) : "—";
                    const totalOrders = shift.orders?.length || 0;
                    const totalRevenue = (shift.orders || []).reduce((s, o) => s + (o.total || 0), 0);

                    return (
                      <div key={idx} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        <div className="flex justify-between items-start gap-6 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                              <CalendarDays size={24} />
                            </div>
                            <div>
                              <div className="text-base font-semibold text-slate-600">{shiftDate}</div>
                              <div className="text-base text-slate-700 font-medium">{openTime} - {closeTime}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base text-slate-600 mb-1">{totalOrders} orders</div>
                            <div className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="border-t-2 border-slate-200 pt-6 space-y-4">
                          {(shift.staffPunchIns || []).map((p, i) => {
                            const worked = calculateWorkedHours(p.punch_in, p.punch_out, p.breaks);
                            const pay = calculatePayroll(worked);
                            return (
                              <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-200"><Clock size={20} className="text-slate-600" /></div>
                                  <div>
                                    <div className="text-base font-semibold text-slate-900">{p.staff?.name || "Unknown Staff"}</div>
                                    <div className="text-sm text-slate-600 font-medium">{formatTime(p.punch_in)} - {formatTime(p.punch_out)}</div>
                                  </div>
                                </div>
                                <div className="flex gap-8 text-base text-slate-700">
                                  <div>
                                    <div className="font-bold text-slate-900">{formatDuration(worked)}</div>
                                    <div className="text-sm text-slate-500">Hours</div>
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">{p.breaks?.length || 0}</div>
                                    <div className="text-sm text-slate-500">Breaks</div>
                                  </div>
                                  <div>
                                    <div className="font-bold text-emerald-600">${pay.toFixed(2)}</div>
                                    <div className="text-sm text-slate-500">Pay</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "payroll" && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                      <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Total Payroll</div>
                      <div className="text-3xl font-bold text-emerald-600">${(totalPayroll || 0).toFixed(2)}</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                      <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Regular Pay</div>
                      <div className="text-3xl font-bold text-blue-600">${(totalRegularPay || 0).toFixed(2)}</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                      <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Overtime Pay</div>
                      <div className="text-3xl font-bold text-amber-600">${(totalOvertimePay || 0).toFixed(2)}</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                      <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Total Hours</div>
                      <div className="text-3xl font-bold text-slate-900">{formatDuration(totalHours || 0)}</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b-2 border-slate-200">
                        <tr>
                          <th className="py-4 pr-8 text-left">Staff</th>
                          <th className="py-4 pr-8 text-left">Total Hours</th>
                          <th className="py-4 pr-8 text-left">Regular Hours</th>
                          <th className="py-4 pr-8 text-left">Overtime Hours</th>
                          <th className="py-4 pr-8 text-left">Regular Rate ($)</th>
                          <th className="py-4 pr-8 text-left">Overtime Rate ($)</th>
                          <th className="py-4 pr-8 text-left">Regular Pay</th>
                          <th className="py-4 pr-8 text-left">Overtime Pay</th>
                          <th className="py-4 pr-8 text-left">Total Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollData.map((s, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-5 pr-8">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-base font-bold text-white shadow-md">{(s.name || "U").charAt(0)}</div>
                                <div>
                                  <div className="text-base font-semibold text-slate-900">{s.name}</div>
                                  <div className="text-sm text-slate-500">{s.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 pr-8 text-base font-medium text-slate-800">{formatDuration(s.totalHours)}</td>
                            <td className="py-5 pr-8 text-base font-medium text-slate-800">{formatDuration(s.regularHours)}</td>
                            <td className="py-5 pr-8 text-base font-medium text-slate-800">{formatDuration(s.overtimeHours)}</td>
                            <td className="py-5 pr-8">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={staffRates[s.id]?.regularRate ?? 15}
                                onChange={(e) => handleRateChange(s.id, "regularRate", e.target.value)}
                                className="w-24 border-2 border-slate-300 rounded-lg px-3 py-2 text-base font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                              />
                            </td>
                            <td className="py-5 pr-8">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={staffRates[s.id]?.overtimeRate ?? ((staffRates[s.id]?.regularRate ?? 15) * 1.5)}
                                onChange={(e) => handleRateChange(s.id, "overtimeRate", e.target.value)}
                                className="w-24 border-2 border-slate-300 rounded-lg px-3 py-2 text-base font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                              />
                            </td>
                            <td className="py-5 pr-8 text-base font-semibold text-blue-600">${(s.regularPay || 0).toFixed(2)}</td>
                            <td className="py-5 pr-8 text-base font-semibold text-amber-600">${(s.overtimePay || 0).toFixed(2)}</td>
                            <td className="py-5 pr-8 text-base font-bold text-emerald-600">${(s.totalPay || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffOverview;
