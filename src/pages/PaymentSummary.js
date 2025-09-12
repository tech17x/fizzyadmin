import React, { useState, useEffect, useContext } from 'react';
import { Download, CreditCard, RefreshCw } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import SelectInput from '../components/SelectInput.js';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import AuthContext from '../context/AuthContext.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Reports.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function PaymentSummary() {
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
  const [paymentMethods, setPaymentMethods] = useState([]);
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

  // Fetch Payment Summary
  const fetchPaymentSummary = async () => {
    if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

    setLoading(true);
    try {
      const start = toLocalISOString(dateRange.start, false);
      const end = toLocalISOString(dateRange.end, true);

      const response = await axios.get(`${API}/api/reports/payment-summary`, {
        params: {
          brand_id: selectedBrand.value,
          outlet_id: selectedOutlet.value,
          start_date: start,
          end_date: end,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setPaymentMethods(response.data.data?.payments || []);
        toast.success("Payment summary loaded");
      } else {
        toast.error("Failed to load payment summary");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching payment summary");
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when filters change
  useEffect(() => {
    fetchPaymentSummary();
  }, [selectedBrand, selectedOutlet, dateRange]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPaymentSummary().finally(() => setIsRefreshing(false));
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

  // Totals
  const totalAmount = paymentMethods.reduce((sum, m) => sum + (m.totalAmount || 0), 0);
  const totalTransactions = paymentMethods.reduce((sum, m) => sum + (m.transactions || 0), 0);

  // Export
  const handleExport = (format) => {
    if (!paymentMethods.length) return;
    format === 'csv'
      ? exportToCSV(paymentMethods, 'payment-summary')
      : exportToPDF(paymentMethods, 'payment-summary');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading payment summary...</span>
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
              Choose a brand, outlet, and date range to load payment analytics
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

      {/* Data */}
      {paymentMethods.length === 0 ? (
        <p className="text-center text-gray-500">
          No payment summary data available for selected filters
        </p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="metric-card-icon blue mr-3">
                  <CreditCard />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Methods</p>
                  <p className="text-2xl font-bold">{paymentMethods.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="metric-card-icon green mr-3">
                  <CreditCard />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="metric-card-icon purple mr-3">
                  <CreditCard />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payment Methods Breakdown</h3>
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
                      <th>Payment Type</th>
                      <th>Transactions</th>
                      <th>Total Amount</th>
                      <th>Share %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.map((m, i) => (
                      <tr key={i}>
                        <td>{m.type}</td>
                        <td>{m.transactions}</td>
                        <td>${m.totalAmount.toLocaleString()}</td>
                        <td>{m.sharePercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breakdown */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Distribution</h3>
              <div className="space-y-4">
                {paymentMethods.map((m, i) => {
                  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
                  return (
                    <div key={m.type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{m.type}</span>
                        <span className="text-sm text-gray-600">{m.sharePercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${m.sharePercentage}%`,
                            backgroundColor: colors[i % colors.length],
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{m.transactions} transactions</span>
                        <span>${m.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="flex justify-end gap-2">
            <button onClick={() => handleExport('csv')} className="button button-success">
              <Download size={16} className="mr-2" /> CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="button button-danger">
              <Download size={16} className="mr-2" /> PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
