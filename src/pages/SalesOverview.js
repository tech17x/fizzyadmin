import React, { useContext, useEffect, useState } from 'react';
import { TrendingUp, Users, CreditCard, Package, Download } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import MetricCard from './shared/MetricCard.jsx';
import SalesChart from './shared/SalesChart.jsx';
import { exportToPDF, exportToCSV } from '../utils/exportUtils.js';
import './Reports.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import SelectInput from '../components/SelectInput.js';
import AuthContext from '../context/AuthContext.js';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';


export default function SalesOverview() {
  const API = process.env.REACT_APP_API_URL;
  const { staff, logout } = useContext(AuthContext);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedOrderType, setSelectedOrderType] = useState('all');
  const [metrics, setMetrics] = useState(null);
  const [previousMetrics, setPreviousMetrics] = useState(null);
  const [orderTypes, setOrderTypes] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [salesTrends, setSalesTrends] = useState([]);
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  useEffect(() => {
    if (staff.permissions?.includes('tax_manage')) {
      setOutlets(staff.outlets);
      setBrands(staff.brands);
    } else {
      logout();
    }
  }, [staff, logout]);

  useEffect(() => {
    if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

    const fetchData = async () => {
      try {
        // Normalize start to 00:00 local and end to 23:59:59.999 local
        const startLocal = new Date(dateRange.start);
        startLocal.setHours(0, 0, 0, 0);

        const endLocal = new Date(dateRange.end);
        endLocal.setHours(23, 59, 59, 999);

        // Calculate previous period with same duration
        const diff = endLocal.getTime() - startLocal.getTime();
        const prevStartLocal = new Date(startLocal.getTime() - diff);
        const prevEndLocal = new Date(endLocal.getTime() - diff);

        // Convert local normalized dates to ISO strings (UTC)
        const start = startLocal.toISOString();
        const end = endLocal.toISOString();
        const prevStart = prevStartLocal.toISOString();
        const prevEnd = prevEndLocal.toISOString();

        // Current data
        const currentRes = await axios.get(`${API}/api/reports/sales`, {
          params: {
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
            start_date: start,
            end_date: end,
          },
          withCredentials: true,
        });

        // Previous data
        const previousRes = await axios.get(`${API}/api/reports/sales`, {
          params: {
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
            start_date: prevStart,
            end_date: prevEnd,
          },
          withCredentials: true,
        });

        const { metrics, orderTypes, paymentBreakdown } = currentRes.data.data;
        const salesTrends = currentRes.data.salesTrends;
        setMetrics(metrics);
        setOrderTypes(orderTypes);
        setPaymentBreakdown(paymentBreakdown);
        setSalesTrends(salesTrends);
        setPreviousMetrics(previousRes.data.data.metrics);
      } catch (error) {
        toast.error('Failed to fetch sales data');
        console.error(error);
      }
    };

    fetchData();
  }, [selectedBrand, selectedOutlet, dateRange, API]);

  const handleBrandSelection = (brand) => {
    setSelectedBrand(brand);
    const filtered = outlets.filter(outlet => outlet.brand_id === brand.value);
    setSelectedOutlet(null);
    setFilteredOutlets(filtered);
    if (filtered.length === 0) {
      toast.error("Selected brand has no outlets.");
    }
  };

  const handleOutletSelection = (outlet) => {
    setSelectedOutlet(outlet);
  };

  const handleExport = (format) => {
    const data = {
      metrics,
      orderTypes,
      paymentBreakdown,
      dateRange
    };

    if (format === 'pdf') {
      exportToPDF(data, 'sales-overview');
    } else {
      exportToCSV(data, 'sales-overview');
    }
  };

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, direction: 'up' };
    const diff = current - previous;
    const percent = Math.abs((diff / previous) * 100).toFixed(1);
    return {
      value: Number(percent),
      direction: diff >= 0 ? 'up' : 'down'
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <SelectInput
            label="Select Brand"
            selectedOption={selectedBrand}
            onChange={handleBrandSelection}
            options={brands.map(o => ({ label: o.full_name, value: o._id }))}
          />
          <SelectInput
            label="Outlet"
            selectedOption={selectedOutlet}
            onChange={handleOutletSelection}
            options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />

          {/* <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)} className="select">
            <option value="all">All Staff</option>
            <option value="sarah">Sarah Johnson</option>
            <option value="mike">Mike Chen</option>
            <option value="emily">Emily Davis</option>
          </select> */}

          {/* <select value={selectedOrderType} onChange={(e) => setSelectedOrderType(e.target.value)} className="select">
            <option value="all">All Order Types</option>
            <option value="dinein">Dine In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select> */}

          <div className="ml-auto flex gap-2">
            <button onClick={() => handleExport('csv')} className="button button-success">
              <Download size={16} className="mr-2" /> CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="button button-danger">
              <Download size={16} className="mr-2" /> PDF
            </button>
          </div>
        </div>
      </div>

      {metrics && orderTypes && paymentBreakdown ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Orders"
              value={metrics.totalOrders.toLocaleString()}
              icon={Package}
              color="blue"
              trend={calculateTrend(metrics.totalOrders, previousMetrics?.totalOrders)}
            />
            <MetricCard
              title="Total Sales"
              value={`$${metrics.totalSales.toLocaleString()}`}
              icon={TrendingUp}
              color="green"
              trend={calculateTrend(metrics.totalSales, previousMetrics?.totalSales)}
            />
            <MetricCard
              title="Avg Order Value"
              value={`$${metrics.avgOrderValue}`}
              icon={CreditCard}
              color="purple"
              trend={calculateTrend(metrics.avgOrderValue, previousMetrics?.avgOrderValue)}
            />
            <MetricCard
              title="Top Staff"
              value={metrics.topStaff}
              icon={Users}
              color="orange"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Line Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Order Type: Pie + Values */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Order Type</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <ResponsiveContainer width="100%" height={240} className="md:w-1/2">
                  <PieChart>
                    <Pie
                      data={orderTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {orderTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-4 w-full">
                  {orderTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{
                            backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b',
                          }}
                        />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${type.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{type.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown: Doughnut + Values */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Methods Breakdown</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <ResponsiveContainer width="100%" height={240} className="md:w-1/2">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="amount"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    label
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        index === 0 ? '#2563eb' : index === 1 ? '#059669' : '#7c3aed'
                      } />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                {paymentBreakdown.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor: index === 0 ? '#2563eb' : index === 1 ? '#059669' : '#7c3aed'
                        }}
                      />
                      <span className="font-medium">{payment.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{payment.percentage}% of total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </>
      ) : null}
    </div>
  );
}
