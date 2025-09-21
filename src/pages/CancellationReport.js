import React, { useState, useEffect, useContext } from 'react';
import { Download, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import SelectInput from '../components/SelectInput.js';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import AuthContext from '../context/AuthContext.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Reports.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CancellationReport() {
  const { staff, logout } = useContext(AuthContext);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // Data
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Init brands/outlets
  useEffect(() => {
    if (staff?.permissions?.includes('staff_manage')) {
      setOutlets(staff.outlets || []);
      setBrands(staff.brands || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // Convert date to ISO (start and end of day)
  const toLocalISOString = (dateString, endOfDay = false) => {
    const d = new Date(dateString + "T00:00:00");
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  // Fetch cancel/refund summary
  const fetchCancelRefundSummary = async () => {
    if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

    setLoading(true);
    try {
      const start = toLocalISOString(dateRange.start, false);
      const end = toLocalISOString(dateRange.end, true);

      const response = await axios.get(`${API}/api/reports/cancel-refund-summary`, {
        params: {
          brand_id: selectedBrand.value,
          outlet_id: selectedOutlet.value,
          start_date: start,
          end_date: end,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setSummary(response.data.data.summary);
        setOrders(response.data.data.orders || []);
        toast.success("Cancel/Refund summary loaded");
      } else {
        toast.error("Failed to load cancel/refund summary");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching cancel/refund summary");
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when filters change
  useEffect(() => {
    fetchCancelRefundSummary();
  }, [selectedBrand, selectedOutlet, dateRange, fetchCancelRefundSummary]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCancelRefundSummary().finally(() => setIsRefreshing(false));
  };

  // Brand selection
  const handleBrandSelection = (brand) => {
    setSelectedBrand(brand);
    const filtered = outlets.filter(o => o.brand_id === brand.value);
    setSelectedOutlet(null);
    setFilteredOutlets(filtered);
    if (filtered.length === 0) toast.error("Selected brand has no outlets.");
  };

  // Outlet selection
  const handleOutletSelection = (outlet) => setSelectedOutlet(outlet);

  // Export
  const handleExport = (format) => {
    if (!orders.length) return;
    format === 'csv'
      ? exportToCSV(orders, 'cancel-refund-report')
      : exportToPDF(orders, 'cancel-refund-report');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading cancel/refund summary...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Filters to View Data
            </h3>
            <p className="text-gray-600 mb-6">
              Choose a brand, outlet, and date range to load cancel/refund analytics
            </p>

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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="metric-card-icon" style={{ backgroundColor: '#dc2626', padding: '12px', borderRadius: '50%' }}>
                <XCircle color="white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Cancellations</p>
                <p className="text-2xl font-bold text-red-600">{summary.cancelledOrders}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="metric-card-icon" style={{ backgroundColor: '#d97706', padding: '12px', borderRadius: '50%' }}>
                <AlertTriangle color="white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.refundedOrders}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="metric-card-icon" style={{ backgroundColor: '#7c3aed', padding: '12px', borderRadius: '50%' }}>
                <AlertTriangle color="white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Refund Amount</p>
                <p className="text-2xl font-bold text-purple-600">${summary.refundAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {orders.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cancellation & Refund Details</h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Staff</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={i}>
                    <td>{o.order_id}</td>
                    <td>{new Date(o.orderDayAt).toLocaleString()}</td>
                    <td>{o.status}</td>
                    <td>{o.staff_id?.name || "Unassigned"}</td>
                    <td>${o.summary?.total?.toFixed(2) || "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <p className="text-center text-gray-500">
          No cancel/refund data available for selected filters
        </p>
      )}

      {/* Analysis Section */}
      {orders.length > 0 && summary && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Cancellation Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Cancellation Reasons */}
            <div>
              <h4 className="font-medium mb-3">Top Cancellation Reasons</h4>
              <div className="space-y-2">
                {Object.entries(
                  orders.reduce((acc, order) => {
                    if (order.status === "cancel") {
                      const reason = order.cancelReason || "Not specified";
                      acc[reason] = (acc[reason] || 0) + 1;
                    }
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([reason, count], idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm">{reason}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Financial Impact */}
            <div>
              <h4 className="font-medium mb-3">Financial Impact</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lost Revenue (Cancellations)</span>
                  <span className="font-medium">
                    ${summary.cancelledAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refunded Amount</span>
                  <span className="font-medium text-red-600">
                    ${summary.refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Impact</span>
                  <span className="font-bold text-red-600">
                    ${summary.totalLoss.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex justify-end gap-2">
        <button onClick={() => handleExport('csv')} className="button button-success">
          <Download size={16} className="mr-2" /> CSV
        </button>
        <button onClick={() => handleExport('pdf')} className="button button-danger">
          <Download size={16} className="mr-2" /> PDF
        </button>
      </div>
    </div>
  );
}
