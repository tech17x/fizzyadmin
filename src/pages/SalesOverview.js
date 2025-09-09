import React, { useState, useContext, useEffect } from 'react';
import {
  Calendar,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Users,
  ChevronDown,
  ChevronRight,
  Eye,
  User
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import SelectInput from '../components/SelectInput';
import DateRangeFilter from './shared/DateRangeFilter.jsx';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function SalesOverview() {
  const { staff, logout } = useContext(AuthContext);

  // Filter states
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // Data states
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Initialize brands and outlets from staff data
  useEffect(() => {
    if (staff?.permissions?.includes('tax_manage')) {
      setOutlets(staff.outlets || []);
      setBrands(staff.brands || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // Convert local date string to ISO string in UTC
  const toLocalISOString = (dateString, endOfDay = false) => {
    const d = new Date(dateString + "T00:00:00");
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  // Fetch sales data from API
  const fetchSalesData = async () => {
    if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

    setLoading(true);
    try {
      const start = toLocalISOString(dateRange.start, false);
      const end = toLocalISOString(dateRange.end, true);

      const response = await axios.get(`${API}/api/reports/sales`, {
        params: {
          brand_id: selectedBrand.value,
          outlet_id: selectedOutlet.value,
          start_date: start,
          end_date: end,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setSalesData(response.data);
        toast.success('Sales data loaded successfully');
      } else {
        toast.error('Failed to load sales data');
      }
    } catch (error) {
      toast.error('Failed to fetch sales data');
      console.error('API Error:', error);

    } finally {
      setLoading(false);
    }
  };

  // Handle brand selection
  const handleBrandSelection = (brand) => {
    setSelectedBrand(brand);
    const filtered = outlets.filter(outlet => outlet.brand_id === brand.value);
    setSelectedOutlet(null);
    setFilteredOutlets(filtered);
    if (filtered.length === 0) {
      toast.error("Selected brand has no outlets.");
    }
  };

  // Handle outlet selection
  const handleOutletSelection = (outlet) => {
    setSelectedOutlet(outlet);
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchSalesData();
  }, [selectedBrand, selectedOutlet, dateRange]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSalesData().finally(() => {
      setIsRefreshing(false);
    });
  };

  const toggleExpanded = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'settle': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFoodTypeColor = (type) => {
    return type === 'veg' ? 'text-green-600' : 'text-red-600';
  };

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return 'Select date range';

    const startDate = new Date(dateRange.start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const endDate = new Date(dateRange.end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${startDate} - ${endDate}`;
  };

  if (!salesData && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
                    <p className="text-sm text-gray-600">Track your business performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Filters to View Data</h3>
              <p className="text-gray-600 mb-6">Choose a brand, outlet, and date range to load sales analytics</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <SelectInput
                  label="Select Brand"
                  selectedOption={selectedBrand}
                  onChange={handleBrandSelection}
                  options={brands.map(b => ({ label: b.full_name, value: b._id }))}
                />
                <SelectInput
                  label="Select Outlet"
                  selectedOption={selectedOutlet}
                  onChange={handleOutletSelection}
                  options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                />
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const summaryCards = [
    {
      title: 'Total Sales',
      value: `$${salesData?.data?.summary?.withTaxSales?.toFixed(2) || '0.00'}`,
      subtitle: `$${salesData?.data?.summary?.withoutTaxSales?.toFixed(2) || '0.00'} without tax`,
      icon: DollarSign,
      color: 'bg-blue-500',
      trend: '+12.5%'
    },
    {
      title: 'Completed Orders',
      value: salesData?.data?.summary?.completedOrders || 0,
      subtitle: `${salesData?.data?.summary?.cancelledOrders || 0} cancelled`,
      icon: ShoppingCart,
      color: 'bg-green-500',
      trend: '+8.2%'
    },
    {
      title: 'Payment Methods',
      value: Object.keys(salesData?.data?.paymentsWithTax || {}).length,
      subtitle: 'Active methods',
      icon: CreditCard,
      color: 'bg-purple-500',
      trend: 'Stable'
    },
    {
      title: 'Refunds',
      value: `$${salesData?.data?.summary?.refundTotal?.toFixed(2) || '0.00'}`,
      subtitle: `${salesData?.data?.summary?.refundedOrders || 0} orders`,
      icon: RefreshCw,
      color: 'bg-orange-500',
      trend: '-2.1%'
    },
    {
      title: 'Tips',
      value: `$${salesData?.data?.summary?.totalTips?.toFixed(2) || '0.00'}`,
      subtitle: 'Total tips earned',
      icon: TrendingUp,
      color: 'bg-teal-500',
      trend: '+5.3%'
    },
    {
      title: 'Order Types',
      value: Object.keys(salesData?.data?.orderTypes || {}).length,
      subtitle: 'Different types',
      icon: Users,
      color: 'bg-indigo-500',
      trend: 'Stable'
    }
  ];

  const pieData = Object.entries(salesData?.data?.paymentsWithTax || {}).map(([method, amount]) => ({
    name: method,
    value: amount,
    percentage: ((amount / Object.values(salesData?.data?.paymentsWithTax || {}).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  }));

  const barData = Object.entries(salesData?.data?.paymentsWithTax || {}).map(([method, withTax]) => ({
    method,
    withTax,
    withoutTax: salesData?.data?.paymentsWithoutTax?.[method] || 0
  }));

  const orderTypeData = Object.entries(salesData?.data?.orderTypes || {}).map(([type, count]) => ({
    type,
    count,
    sales: salesData?.data?.orderTypeSales?.[type]?.withTax || 0,
    salesWithoutTax: salesData?.data?.orderTypeSales?.[type]?.withoutTax || 0
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
                  <p className="text-sm text-gray-600">Track your business performance</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{formatDateRange()}</span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="h-4 w-4" />
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectInput
              label="Brand"
              selectedOption={selectedBrand}
              onChange={handleBrandSelection}
              options={brands.map(b => ({ label: b.full_name, value: b._id }))}
            />
            <SelectInput
              label="Outlet"
              selectedOption={selectedOutlet}
              onChange={handleOutletSelection}
              options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
            />
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            {/* <div className="flex items-end">
              <button
                onClick={fetchSalesData}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Apply Filters'}
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                  <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {/* {card.trend} */}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Trends</h3>
            <p className="text-sm text-gray-600">Daily sales performance over time</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData?.salesTrends || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-up">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Methods</h3>
              <p className="text-sm text-gray-600">Distribution of payment types</p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-up">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Breakdown</h3>
              <p className="text-sm text-gray-600">Payment amounts with and without tax</p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="method"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="withTax" fill="#3B82F6" name="With Tax" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withoutTax" fill="#10B981" name="Without Tax" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Order Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Types Performance</h3>
            <p className="text-sm text-gray-600">Sales breakdown by order categories</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'count') return [value, 'Orders'];
                    return [`$${value.toFixed(2)}`, name === 'sales' ? 'Sales (with tax)' : 'Sales (without tax)'];
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" name="count" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="#3B82F6" name="sales" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {orderTypeData.map((item, index) => (
              <div key={item.type} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{item.type}</h4>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Orders: <span className="font-medium">{item.count}</span></p>
                  <p className="text-xs text-gray-600">Sales: <span className="font-medium">${item.sales.toFixed(2)}</span></p>
                  <p className="text-xs text-gray-600">Without tax: <span className="font-medium">${item.salesWithoutTax.toFixed(2)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {salesData?.orders && salesData.orders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-slide-up">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Orders</h3>
                  <p className="text-sm text-gray-600">Detailed view of all transactions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Total: {salesData.orders.length} orders</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.orders.map((order, index) => (
                    <>
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleExpanded(order._id)}
                              className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {expandedOrder === order._id ?
                                <ChevronDown className="h-4 w-4 text-gray-400" /> :
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              }
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{order.order_id?.split('_')[1] || order._id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.order_id || order._id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {format(new Date(order.createdAt || new Date()), 'MMM dd, yyyy')}
                              <div className="text-xs text-gray-500">
                                {format(new Date(order.createdAt || new Date()), 'HH:mm')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{order.items?.length || 0} items</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            ${order.summary?.total?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${order.summary?.subtotal?.toFixed(2) || '0.00'} + ${order.summary?.tax?.toFixed(2) || '0.00'} tax
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status || 'pending')}`}>
                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedOrder === order._id && order.items && (
                        <tr className="bg-gray-50 animate-slide-up">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="space-y-4">
                              {/* Items */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                                <div className="grid gap-3">
                                  {order.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                                            <span className={`text-xs font-medium ${getFoodTypeColor(item.food_type || 'veg')}`}>
                                              ({item.food_type || 'veg'})
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-600 mt-1">{item.category_name}</p>
                                          {item.activeAddons && item.activeAddons.length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-xs text-gray-500">Add-ons:</p>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {item.activeAddons.map((addon, addonIndex) => (
                                                  <span key={addonIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {addon.name}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right ml-4">
                                          <p className="text-sm font-medium text-gray-900">
                                            ${item.total_price?.toFixed(2) || item.price?.toFixed(2) || '0.00'}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            Qty: {item.quantity || 1}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Payment Info */}
                              {order.paymentInfo && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h4>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <p className="text-xs text-gray-500">Total Paid</p>
                                        <p className="text-sm font-medium text-gray-900">${order.paymentInfo.totalPaid?.toFixed(2) || '0.00'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Return</p>
                                        <p className="text-sm font-medium text-gray-900">${order.paymentInfo.return?.toFixed(2) || '0.00'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Tip</p>
                                        <p className="text-sm font-medium text-gray-900">${order.paymentInfo.tip?.toFixed(2) || '0.00'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Payment Methods</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {order.paymentInfo.payments?.map((payment, paymentIndex) => (
                                            <div key={paymentIndex} className="flex items-center text-xs bg-gray-100 rounded px-2 py-1">
                                              <CreditCard className="h-3 w-3 mr-1" />
                                              {payment.typeName}: ${payment.amount}
                                            </div>
                                          )) || (
                                              <div className="text-xs text-gray-500">No payment details</div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2025 Sales Dashboard. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SalesOverview;