import React, { useContext, useState, useEffect } from 'react';
import { Download, Plus, RefreshCw } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';
import SelectInput from '../components/SelectInput.js';
import AuthContext from '../context/AuthContext.js';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AddonSales() {
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
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Init brands/outlets
  useEffect(() => {
    if (staff?.permissions?.includes('tax_manage')) {
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

  // Fetch Addon Sales
  const fetchAddonSales = async () => {
    if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

    setLoading(true);
    try {
      const start = toLocalISOString(dateRange.start, false);
      const end = toLocalISOString(dateRange.end, true);

      const response = await axios.get(`${API}/api/reports/addon-sales`, {
        params: {
          brand_id: selectedBrand.value,
          outlet_id: selectedOutlet.value,
          start_date: start,
          end_date: end,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setAddons(response.data.data || []);
        toast.success("Addon sales loaded successfully");
      } else {
        toast.error("Failed to load addon sales");
      }
    } catch (error) {
      toast.error("Failed to fetch addon sales");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when filters change
  useEffect(() => {
    fetchAddonSales();
  }, [selectedBrand, selectedOutlet, dateRange, fetchAddonSales]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAddonSales().finally(() => setIsRefreshing(false));
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
  const totalAddonRevenue = addons.reduce((sum, a) => sum + (a.totalSales || 0), 0);
  const totalQuantityUsed = addons.reduce((sum, a) => sum + (a.quantitySold || 0), 0);


  // Export
  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(addons, 'addon-sales');
    } else {
      exportToPDF(addons, 'addon-sales');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading addon sales...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Filters to View Data</h3>
            <p className="text-gray-600 mb-6">Choose a brand, outlet, and date range to load addon analytics</p>

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
      {addons.length === 0 ? (
        <p className="text-center text-gray-500">No addon sales available for selected filters</p>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="metric-card-icon blue mr-3"><Plus /></div>
                <div>
                  <p className="text-sm text-gray-600">Total Add-ons</p>
                  <p className="text-2xl font-bold">{addons.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="metric-card-icon green mr-3"><Plus /></div>
                <div>
                  <p className="text-sm text-gray-600">Total Quantity Used</p>
                  <p className="text-2xl font-bold">{totalQuantityUsed}</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="metric-card-icon purple mr-3"><Plus /></div>
                <div>
                  <p className="text-sm text-gray-600">Total Add-on Revenue</p>
                  <p className="text-2xl font-bold">${totalAddonRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add-on Performance</h3>
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
                    <th>Add-on</th>
                    <th>Associated Item</th>
                    <th>Qty Used</th>
                    <th>Avg Price</th>
                    <th>Total Revenue</th>
                    <th>Revenue %</th>
                  </tr>
                </thead>
                <tbody>
                  {addons.map((addon, index) => {
                    const revenuePercentage = totalAddonRevenue
                      ? (addon.totalSales / totalAddonRevenue) * 100
                      : 0;

                    return (
                      <tr key={index}>
                        <td>
                          <div className="flex items-center">
                            <Plus size={16} className="text-gray-400 mr-2" />
                            <span className="font-medium">{addon.name}</span>
                          </div>
                        </td>
                        <td>{addon.parentItem}</td> {/* API sends parentItem, not associatedItem */}
                        <td className="font-medium">{addon.quantitySold}</td> {/* API sends quantitySold */}
                        <td className="font-medium">
                          ${addon.quantitySold ? (addon.totalSales / addon.quantitySold).toFixed(2) : "0.00"}
                        </td> {/* avgPrice derived */}
                        <td className="font-bold">${addon.totalSales.toFixed(2)}</td> {/* API sends totalSales */}
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div
                                className="progress-fill progress-blue"
                                style={{ width: `${revenuePercentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {revenuePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
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
        </div>
      )}
    </div>
  );
}
