import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  TrendingUp,
  XOctagon,
  PrinterIcon,
  Users,
  BarChart3,
  FileDown,
  FileText,
  Gift,
  Grid,
  ListChecks,
  Folder,
  Table as TableIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import FilterPanel from "../components/FilterPanel";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SalesOverview = () => {
  const { staff, logout } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("day"),
  ]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState({});
  const [orders, setOrders] = useState([]);
  const [trends, setTrends] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const reportRef = useRef(null);

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

  // Load user brands/outlets
  useEffect(() => {
    if (staff?.permissions?.includes("dashboard_view")) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else logout?.();
  }, [staff, logout]);

  useEffect(() => {
    if (selectedBrand) {
      const filtered = outlets.filter((o) => o.brand_id === selectedBrand);
      setFilteredOutlets(filtered);
      setSelectedOutlet("");
    } else setFilteredOutlets([]);
  }, [selectedBrand, outlets]);

  // Fetch sales data
  useEffect(() => {
    const fetchSales = async () => {
      if (!selectedBrand || !selectedOutlet) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/api/reports/sales`, {
          params: {
            brand_id: selectedBrand,
            outlet_id: selectedOutlet,
            start_date: dateRange[0].toISOString(),
            end_date: dateRange[1].toISOString(),
          },
          withCredentials: true,
        });
        if (res.data?.success) {
          setSalesData(res.data.data || {});
          setOrders(res.data.orders || []);
          setTrends(res.data.salesTrends || []);
        } else setError("Failed to fetch sales data.");
      } catch (err) {
        console.error(err);
        setError("Error fetching sales data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [selectedBrand, selectedOutlet, dateRange]);

  const summary = salesData?.summary || {};
  const payments = salesData?.paymentsWithTax || {};
  const paymentData = Object.entries(payments).map(([k, v]) => ({ name: k, value: v }));
  const orderTypeData = Object.entries(salesData?.orderTypes || {}).map(([k, v]) => ({
    type: k,
    count: v,
    sales: salesData?.orderTypeSales?.[k]?.withTax || 0,
  }));
  const taxData = Object.entries(salesData?.paymentsWithTax || {}).map(([k, v]) => ({
    method: k,
    withTax: v,
    withoutTax: salesData?.paymentsWithoutTax?.[k] || 0,
  }));

  const toggleExpanded = (id) =>
    setExpandedOrder(expandedOrder === id ? null : id);

  // Export handler
  const handleExport = (type) => {
    if (type === "Overview") {
      const csv = [
        ["Metric", "Value"],
        ["Total Sales (With Tax)", summary.withTaxSales],
        ["Total Sales (Without Tax)", summary.withoutTaxSales],
        ["Completed Orders", summary.completedOrders],
        ["Cancelled Orders", summary.cancelledOrders],
      ]
        .map((r) => r.join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sales_overview_${dayjs().format("YYYYMMDD")}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Sales Overview exported");
    } else if (type === "Print") {
      const w = window.open("", "_blank");
      w.document.write("<pre>" + JSON.stringify(salesData, null, 2) + "</pre>");
      w.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      <div className="max-w-[1400px] mx-auto pt-28 pb-20 px-8">
        {/* Header */}
        <PageHeader
          title="Sales Overview & Analytics"
          description="Analyze sales, payments, taxes, and order performance across your outlets. Export data easily and view detailed order insights."
          exportOptions={[
            { label: "Overview CSV", value: "Overview" },
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
        />

        {/* Tabs */}
        <div className="flex gap-8 border-b-2 border-slate-200 mb-10">
          {[
            "overview",
            "orders",
            "customers",
            "staff performance",
            "payment summaries",
            "day-end summaries",
            "cancellations / refunds",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 capitalize text-base font-bold tracking-wide transition-all duration-200 ${tab === t
                  ? "text-[#DF6229] border-b-3 border-[#DF6229]"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#DF6229]/30 border-t-[#DF6229] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium tracking-wide">
              Fetching latest data...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center text-red-600 py-10 text-lg font-semibold">
            {error}
          </div>
        )}

        {/* Overview */}
        {!loading && !error && tab === "overview" && salesData && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { title: "Total Sales", value: `$${summary.withTaxSales || 0}`, icon: <DollarSign size={20} /> },
                { title: "Orders Completed", value: summary.completedOrders || 0, icon: <ShoppingCart size={20} /> },
                { title: "Refunds", value: summary.refundedOrders || 0, icon: <XOctagon size={20} /> },
                { title: "Tips", value: `$${summary.totalTips || 0}`, icon: <TrendingUp size={20} /> },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition">
                  <div className="p-3 bg-gradient-to-br from-[#DF6229] to-[#EFA280] rounded-xl text-white">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Trends */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 mb-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Sales Trends</h3>
              <p className="text-slate-600 mb-6">Daily sales across the selected range.</p>
              {trends.length > 0 ? (
                <div className="w-full h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <RechartTooltip formatter={(v) => `$${v}`} />
                      <Line type="monotone" dataKey="total" stroke="#DF6229" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-slate-400 italic py-10">
                  No sales data found for this range.
                </p>
              )}
            </div>

            {/* Payment Methods & Tax */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Payment Methods */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Methods</h3>
                <p className="text-slate-600 mb-6">
                  Breakdown by payment type.
                </p>
                {paymentData.length ? (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartTooltip formatter={(v) => `$${v}`} />
                        <Bar dataKey="value" fill="#DF6229" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 italic py-10">
                    No payment data found.
                  </p>
                )}
              </div>

              {/* Tax Breakdown */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Tax Breakdown</h3>
                <p className="text-slate-600 mb-6">Compare with-tax and without-tax sales.</p>
                {taxData.length ? (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taxData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis />
                        <RechartTooltip formatter={(v) => `$${v}`} />
                        <Legend />
                        <Bar dataKey="withTax" fill="#DF6229" name="With Tax" />
                        <Bar dataKey="withoutTax" fill="#EFA280" name="Without Tax" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 italic py-10">
                    No tax data found.
                  </p>
                )}
              </div>
            </div>

            {/* Order Type Performance */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 mb-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Types Performance</h3>
              <p className="text-slate-600 mb-6">
                Compare sales and order counts by type.
              </p>
              {orderTypeData.length ? (
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <RechartTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" name="Orders" />
                      <Bar dataKey="sales" fill="#10B981" name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-slate-400 italic py-10">
                  No order type data found.
                </p>
              )}
            </div>

            {/* Orders */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Recent Orders</h3>
              <p className="text-slate-600 mb-6">
                Expand any order to view details, items, and payment info.
              </p>
              {orders.length === 0 ? (
                <p className="text-center text-slate-400 italic py-10">
                  No orders found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b-2 border-slate-200 text-sm font-semibold text-slate-700">
                      <tr>
                        <th className="py-4 px-3">Order ID</th>
                        <th className="py-4 px-3">Customer</th>
                        <th className="py-4 px-3">Status</th>
                        <th className="py-4 px-3">Total</th>
                        <th className="py-4 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <React.Fragment key={i}>
                          <tr
                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                            onClick={() => toggleExpanded(o._id || i)}
                          >
                            <td className="py-4 px-3 font-medium text-slate-800">
                              {o.order_id || o._id}
                            </td>
                            <td className="py-4 px-3 text-slate-600">
                              {o.customer?.name || "N/A"}
                            </td>
                            <td className="py-4 px-3 text-slate-600 capitalize">
                              {o.status || "N/A"}
                            </td>
                            <td className="py-4 px-3 text-emerald-600 font-semibold">
                              ${o.summary?.total?.toFixed(2) || 0}
                            </td>
                            <td className="py-4 px-3 text-slate-500">
                              {dayjs(o.createdAt).format("DD MMM YYYY")}
                            </td>
                          </tr>

                          {expandedOrder === (o._id || i) && (
                            <tr>
                              <td colSpan="5" className="bg-slate-50 p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-slate-800 mb-2">
                                      Order Items
                                    </h4>
                                    {o.items?.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between border-b border-slate-200 py-2"
                                      >
                                        <div>
                                          <p className="font-medium text-slate-700">
                                            {item.name}
                                          </p>
                                          {item.activeAddons?.length > 0 && (
                                            <p className="text-xs text-slate-500">
                                              Add-ons:{" "}
                                              {item.activeAddons
                                                .map((a) => a.name)
                                                .join(", ")}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <p className="font-semibold text-slate-800">
                                            ${item.total_price || item.price || 0}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            Qty: {item.quantity || 1}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-slate-800 mb-2">
                                      Payment Info
                                    </h4>
                                    {o.paymentInfo?.payments?.map((p, pi) => (
                                      <div
                                        key={pi}
                                        className="flex justify-between text-sm border-b border-slate-200 py-2"
                                      >
                                        <span className="text-slate-700">
                                          {p.typeName}
                                        </span>
                                        <span className="text-slate-800 font-semibold">
                                          ${p.amount?.toFixed(2) || 0}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab !== "overview" && !loading && (
          <p className="text-center text-slate-400 italic py-32">
            {tab.charAt(0).toUpperCase() + tab.slice(1)} data coming soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default SalesOverview;
