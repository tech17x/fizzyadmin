import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import dayjs from "dayjs";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import { FileDown, Users, Clock, DollarSign, Briefcase } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Utility formatters
const formatDate = (t) => (t ? dayjs(t).format("ddd, MMM D, YYYY") : "—");
const formatTime = (t) => (t ? dayjs(t).format("hh:mm A") : "—");
const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;
const formatHours = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const PayrollPage = () => {
  const { staff } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/payroll/day-staff-report`, {
          withCredentials: true,
        });
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        toast.error("Error fetching payroll data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Flattened calculations
  const allPunches = data.flatMap((d) => d.staffPunchIns);
  const allOrders = data.flatMap((d) => d.orders);
  const totalPayroll = allOrders.reduce((sum, o) => sum + o.total, 0);
  const totalHours = allPunches.reduce(
    (sum, p) => sum + (p.punch_out - p.punch_in),
    0
  );
  const totalShifts = allPunches.length;
  const staffList = Object.values(
    allPunches.reduce((acc, p) => {
      const key = p.staff.id;
      if (!acc[key])
        acc[key] = {
          name: p.staff.name,
          email: p.staff.email,
          hours: 0,
          shifts: 0,
          breaks: 0,
          payroll: 0,
        };
      acc[key].hours += p.punch_out - p.punch_in;
      acc[key].shifts += 1;
      acc[key].breaks += (p.breaks || []).length;
      acc[key].payroll += allOrders
        .filter((o) => o.staff.id === key)
        .reduce((sum, o) => sum + o.total, 0);
      return acc;
    }, {})
  );

  const handleExport = (type) => {
    const blob = new Blob([JSON.stringify({ type, data }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_payroll.json`;
    a.click();
    toast.success(`${type} report exported`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FAFAFA] text-gray-800">
      {/* Header */}
      <header className="max-w-7xl mx-auto pt-24 pb-8 px-6 border-b border-gray-100 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-gray-900">
            Payroll Overview
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">
            Track your staff’s hours, shifts, and payroll performance across outlets. 
            Review summaries, daily breakdowns, and export professional payroll reports.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center gap-2 text-sm bg-[#DF6229] text-white px-4 py-2 rounded-md shadow-sm hover:opacity-90 transition"
          >
            <FileDown size={16} />
            Export
          </button>
          {exportOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-md shadow-md py-1 w-44">
              {["Overview", "Daily", "Summary", "All"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleExport(t)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF2EB]"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 border-b border-gray-100 flex gap-6 text-sm font-medium">
        {[
          { key: "overview", label: "Overview" },
          { key: "daily", label: "Daily Shifts" },
          { key: "summary", label: "Payroll Summary" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 capitalize transition-all ${
              tab === key
                ? "text-[#DF6229] border-b-2 border-[#DF6229]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 py-14">
        {loading ? (
          <p className="text-center text-gray-400 py-20">Loading payroll data...</p>
        ) : (
          <>
            {tab === "overview" && (
              <>
                {/* Top KPIs */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[
                    { icon: <Users />, label: "Total Staff", value: staffList.length },
                    { icon: <Clock />, label: "Total Hours", value: formatHours(totalHours) },
                    { icon: <DollarSign />, label: "Total Payroll", value: formatMoney(totalPayroll) },
                    { icon: <Briefcase />, label: "Total Shifts", value: totalShifts },
                  ].map((k, i) => (
                    <div
                      key={i}
                      className="p-6 bg-white/80 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3 mb-2 text-gray-800">
                        <div className="p-2 rounded-full bg-[#FFF1EC] text-[#DF6229]">
                          {k.icon}
                        </div>
                        <p className="text-sm text-gray-500">{k.label}</p>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">{k.value}</h3>
                    </div>
                  ))}
                </div>

                {/* Staff Breakdown */}
                <h3 className="text-xl font-semibold mb-3">Staff Performance</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Breakdown of each staff member’s hours, shifts, breaks, and payroll.
                </p>
                <div className="overflow-x-auto bg-white/80 rounded-xl shadow-sm">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-[#FFE8E1]/50">
                      <tr>
                        {["Staff", "Email", "Hours", "Shifts", "Breaks", "Payroll"].map(
                          (h) => (
                            <th key={h} className="px-6 py-3 font-semibold">
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((s, i) => (
                        <tr key={i} className="border-t border-gray-100 hover:bg-[#FFF9F7]">
                          <td className="px-6 py-3 font-medium">{s.name}</td>
                          <td className="px-6 py-3">{s.email}</td>
                          <td className="px-6 py-3">{formatHours(s.hours)}</td>
                          <td className="px-6 py-3">{s.shifts}</td>
                          <td className="px-6 py-3">{s.breaks}</td>
                          <td className="px-6 py-3 text-[#DF6229] font-semibold">
                            {formatMoney(s.payroll)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "daily" && (
              <>
                <h3 className="text-xl font-semibold mb-3">Daily Shifts</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Each outlet session with shift details, orders, and payouts.
                </p>
                <div className="space-y-8">
                  {data.map((session, i) => (
                    <div key={i} className="bg-white/80 rounded-2xl shadow-sm p-8">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold">
                          {formatDate(session.outletInfo.openTime)}{" "}
                          <span className="text-gray-400 text-sm">
                            {formatTime(session.outletInfo.openTime)} -{" "}
                            {formatTime(session.outletInfo.closeTime)}
                          </span>
                        </h4>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {session.orders.length} orders
                          </p>
                          <p className="text-lg font-semibold text-[#DF6229]">
                            {formatMoney(
                              session.orders.reduce((s, o) => s + o.total, 0)
                            )}
                          </p>
                        </div>
                      </div>

                      {session.staffPunchIns.map((p, j) => (
                        <div
                          key={j}
                          className="flex flex-wrap justify-between items-center border-t border-gray-100 py-4 text-sm"
                        >
                          <div>
                            <p className="font-medium">{p.staff.name}</p>
                            <p className="text-gray-500">{p.staff.email}</p>
                          </div>
                          <div className="text-gray-600">
                            {formatTime(p.punch_in)} - {formatTime(p.punch_out)} (
                            {formatHours(p.punch_out - p.punch_in)})
                          </div>
                          <div className="text-right font-medium text-[#DF6229]">
                            {formatMoney(
                              session.orders
                                .filter((o) => o.staff.id === p.staff.id)
                                .reduce((s, o) => s + o.total, 0)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "summary" && (
              <>
                <h3 className="text-xl font-semibold mb-3">Payroll Summary</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Overview of payroll distribution, regular and overtime pay.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[
                    { label: "Total Payroll", value: formatMoney(totalPayroll) },
                    { label: "Regular Pay", value: "$322.96" },
                    { label: "Overtime Pay", value: "$110.80" },
                    { label: "Total Hours", value: formatHours(totalHours) },
                  ].map((i, idx) => (
                    <div
                      key={idx}
                      className="bg-white/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition"
                    >
                      <p className="text-sm text-gray-500">{i.label}</p>
                      <h3 className="text-xl font-semibold text-[#DF6229]">
                        {i.value}
                      </h3>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto bg-white/80 rounded-xl shadow-sm">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-[#FFE8E1]/50">
                      <tr>
                        {[
                          "Staff",
                          "Email",
                          "Total Hours",
                          "Regular Hours",
                          "Overtime Hours",
                          "Regular Rate ($)",
                          "Overtime Rate ($)",
                          "Regular Pay",
                          "Overtime Pay",
                          "Total Pay",
                        ].map((h) => (
                          <th key={h} className="px-6 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((s, i) => {
                        const hours = s.hours;
                        const regularHours = Math.min(hours, 14.5 * 3600000);
                        const overtimeHours = Math.max(hours - regularHours, 0);
                        const regularRate = 15;
                        const overtimeRate = 22.5;
                        const regularPay =
                          (regularHours / 3600000) * regularRate;
                        const overtimePay =
                          (overtimeHours / 3600000) * overtimeRate;
                        const totalPay = regularPay + overtimePay;
                        return (
                          <tr
                            key={i}
                            className="border-t border-gray-100 hover:bg-[#FFF9F7]"
                          >
                            <td className="px-6 py-3 font-medium">{s.name}</td>
                            <td className="px-6 py-3">{s.email}</td>
                            <td className="px-6 py-3">
                              {formatHours(s.hours)}
                            </td>
                            <td className="px-6 py-3">
                              {formatHours(regularHours)}
                            </td>
                            <td className="px-6 py-3">
                              {formatHours(overtimeHours)}
                            </td>
                            <td className="px-6 py-3">$15</td>
                            <td className="px-6 py-3">$22.5</td>
                            <td className="px-6 py-3">{formatMoney(regularPay)}</td>
                            <td className="px-6 py-3">{formatMoney(overtimePay)}</td>
                            <td className="px-6 py-3 text-[#DF6229] font-semibold">
                              {formatMoney(totalPay)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PayrollPage;
