import React, { useContext, useState, useEffect } from 'react';
import { Download, Tag, RefreshCw } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';
import SelectInput from '../components/SelectInput.js';
import AuthContext from '../context/AuthContext.js';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CategorySales() {
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

  // Data state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize brands and outlets
  useEffect(() => {
    if (staff?.permissions?.includes('tax_manage')) {
      setOutlets(staff.outlets || []);
      setBrands(staff.brands || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // Convert date string to ISO with UTC correction
  const toLocalISOString = (dateString, endOfDay = false) => {
    const d = new Date(dateString + "T00:00:00");
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  // Fetch category sales from API
  const fetchCategorySales = async () => {
    if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

    setLoading(true);
    try {
      const start = toLocalISOString(dateRange.start, false);
      const end = toLocalISOString(dateRange.end, true);

      const response = await axios.get(`${API}/api/reports/categorywise-sales`, {
        params: {
          brand_id: selectedBrand.value,
          outlet_id: selectedOutlet.value,
          start_date: start,
          end_date: end,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setCategories(response.data.data || []);
        toast.success('Category sales loaded successfully');
      } else {
        toast.error('Failed to load category sales');
      }
    } catch (error) {
      toast.error('Failed to fetch category sales');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCategorySales().finally(() => setIsRefreshing(false));
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

  // Auto fetch on filter change
  useEffect(() => {
    fetchCategorySales();
  }, [selectedBrand, selectedOutlet, dateRange]);

  // Calculate total sales
  const totalSales = categories.reduce((sum, cat) => sum + (cat.grossSales || 0) + (cat.addonRevenue || 0), 0);

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(categories, 'category-sales');
    } else {
      exportToPDF(categories, 'category-sales');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading category sales...</span>
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

      {/* Data */}
      {categories.length === 0 ? (
        <p className="text-center text-gray-500">No data available for selected filters</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Category Performance</h3>
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
                    <th>Category</th>
                    <th>Orders</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.category}>
                      <td>
                        <div className="flex items-center">
                          <Tag size={16} className="text-gray-400 mr-2" />
                          <span className="font-medium">{category.category}</span>
                        </div>
                      </td>
                      <td className="font-medium">{category.totalOrders}</td>
                      <td className="font-medium">{category.quantitySold}</td>
                      <td className="font-bold">
                        ${category.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Distribution</h3>
            <div className="space-y-4">
              {categories.map((category, index) => {
                const revenue = category.totalRevenue; // simpler & matches API
                const percentage = (revenue / totalSales) * 100;
                const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      ${revenue.toLocaleString()}
                    </div>
                  </div>
                );
              })}

            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Revenue</span>
                <span className="font-bold text-xl">
                  ${totalSales.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
