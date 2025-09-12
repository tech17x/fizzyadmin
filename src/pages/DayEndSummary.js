import React, { useContext, useState, useEffect } from 'react';
import { Download, Calendar, User, DollarSign, RefreshCw } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import SelectInput from '../components/SelectInput.js';
import AuthContext from '../context/AuthContext.js';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Reports.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function DayEndSummary() {
  const { staff, logout } = useContext(AuthContext);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // Data
  const [dayEndReports, setDayEndReports] = useState([]);
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

  // Fetch Day End Summary
  const fetchDayEndSummary = async () => {
    if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

    setLoading(true);
    try {
      const start = toLocalISOString(dateRange.start, false);
      const end = toLocalISOString(dateRange.end, true);

      const response = await axios.get(`${API}/api/reports/dayend-summary`, {
        params: {
          brand_id: selectedBrand.value,
          outlet_id: selectedOutlet.value,
          start_date: start,
          end_date: end
        },
        withCredentials: true
      });

      if (response.data.success) {
        setDayEndReports(response.data.data || []);
        toast.success("Day end summary loaded successfully");
      } else {
        toast.error("Failed to load day end summary");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching day end summary");
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when filters change
  useEffect(() => {
    fetchDayEndSummary();
  }, [selectedBrand, selectedOutlet, dateRange]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDayEndSummary().finally(() => setIsRefreshing(false));
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
    if (!dayEndReports.length) return;
    format === 'csv'
      ? exportToCSV(dayEndReports, 'day-end-summary')
      : exportToPDF(dayEndReports, 'day-end-summary');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading day end summary...</span>
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
              Select Filters to View Day End Summary
            </h3>
            <p className="text-gray-600 mb-6">
              Choose a brand, outlet, and date range to load reports
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

      {/* Reports */}
      {dayEndReports.length === 0 ? (
        <p className="text-center text-gray-500">
          No day end summary data available for selected filters
        </p>
      ) : (
        <div className="space-y-6">
          {dayEndReports.map((report) => (
            <div key={report.dayId} className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between">
                <div className="flex items-center">
                  <Calendar size={20} className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold">Day End Report - {report.date}</h3>
                </div>
                <span className="text-sm text-gray-600">{report.dayId}</span>
              </div>

              <div className="p-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center">
                    <User size={16} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Opened By</p>
                      <p className="font-medium">{report.openedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={16} className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Opening Cash</p>
                      <p className="font-medium">${report.openingCash?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-blue-600">{report.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-xl font-bold text-green-600">${report.totalSales?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3">Payment Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Card Sales</p>
                      <p className="text-xl font-bold text-blue-800">${report.cardSales?.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">
                        {((report.cardSales / report.totalSales) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Cash Sales</p>
                      <p className="text-xl font-bold text-green-800">${report.cashSales?.toLocaleString()}</p>
                      <p className="text-sm text-green-600">
                        {((report.cashSales / report.totalSales) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">UPI Sales</p>
                      <p className="text-xl font-bold text-purple-800">${report.upiSales?.toLocaleString()}</p>
                      <p className="text-sm text-purple-600">
                        {((report.upiSales / report.totalSales) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3">Financial Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Tax</p>
                        <p className="font-medium">${report.totalTax?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Discounts</p>
                        <p className="font-medium text-red-600">-${report.totalDiscounts?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Extra Charges</p>
                        <p className="font-medium text-green-600">+${report.totalExtraCharges?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Closing Cash</p>
                        <p className="font-bold">${report.closingCash?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                {(report.openComment || report.closingComment) && (
                  <div>
                    <h4 className="text-md font-semibold mb-2">Comments</h4>
                    <div className="space-y-3">
                      {report.openComment && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4">
                          <p className="text-gray-700"><strong>Opening:</strong> {report.openComment}</p>
                        </div>
                      )}
                      {report.closingComment && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                          <p className="text-gray-700"><strong>Closing:</strong> {report.closingComment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Export */}
          <div className="flex justify-end gap-2">
            <button onClick={() => handleExport('csv')} className="button button-success">
              <Download size={16} className="mr-2" /> CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="button button-danger">
              <Download size={16} className="mr-2" /> PDF
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="button button-light"
            >
              <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''} mr-2`} /> Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
