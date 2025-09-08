import React, { useState, useEffect, useContext } from 'react';
import { Download, Package } from 'lucide-react';
import SelectInput from '../components/SelectInput';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import DateRangeFilter from './shared/DateRangeFilter.jsx';

export default function ItemwiseSales() {
  const { staff, logout } = useContext(AuthContext);
  const API = process.env.REACT_APP_API_URL;

  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');

  useEffect(() => {
    if (staff?.permissions.includes('tax_manage')) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  useEffect(() => {
    if (!selectedBrand) {
      setFilteredOutlets([]);
      setSelectedOutlet(null);
      return;
    }
    // Filter outlets by selected brand
    setFilteredOutlets(outlets.filter(o => o.brand_id === selectedBrand.value));
    setSelectedOutlet(null);
  }, [selectedBrand, outlets]);

  useEffect(() => {
    if (!selectedBrand || !selectedOutlet || !dateRange.start || !dateRange.end) return;

    const fetchData = async () => {
      try {
        const params = {
          brand_id: selectedBrand.value,
          outlet_id: selectedOutlet.value,
          start_date: new Date(dateRange.start).toISOString(),
          end_date: new Date(dateRange.end).toISOString(),
        };

        const res = await axios.get(`${API}/api/reports/itemwise-sales`, { params, withCredentials: true });
        if (res.data && res.data.success) {
          setItems(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load itemwise sales', err);
      }
    };

    fetchData();
  }, [selectedBrand, selectedOutlet, dateRange, API]);

  const categories = [...new Set(items.map(i => i.category))].sort();

  const filteredItems = items.filter(item =>
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    (foodTypeFilter === 'all' || item.foodType === foodTypeFilter)
  );

  const handleExport = format => {
    if (format === 'csv') exportToCSV(filteredItems, 'itemwise-sales');
    else exportToPDF(filteredItems, 'itemwise-sales');
  };

  return (
    <div className="p-6 space-y-6">

      {/* Use your provided filter UI here */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <SelectInput
            label="Select Brand"
            selectedOption={selectedBrand}
            onChange={setSelectedBrand}
            options={brands.map(b => ({ label: b.full_name, value: b._id }))}
          />
          <SelectInput
            label="Select Outlet"
            selectedOption={selectedOutlet}
            onChange={setSelectedOutlet}
            options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />

          {/* Optional: Add more filters if needed */}
          {/* <select disabled>
              ... your other filters
          </select> */}

          <div className="ml-auto flex gap-2">
            <button onClick={() => handleExport('csv')} className="button button-success">
              <Download size={16} className="mr-2" />
              CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="button button-danger">
              <Download size={16} className="mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Category & Food Type filters */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="select">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={foodTypeFilter} onChange={e => setFoodTypeFilter(e.target.value)} className="select">
          <option value="all">All Food Types</option>
          <option value="veg">Vegetarian</option>
          <option value="non-veg">Non-Vegetarian</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card p-6 flex items-center gap-4">
          <Package className="metric-icon blue" />
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold">{filteredItems.length}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <Package className="metric-icon green" />
          <div>
            <p className="text-sm text-gray-600">Total Quantity Sold</p>
            <p className="text-2xl font-bold">{filteredItems.reduce((sum, i) => sum + (i.quantitySold || 0), 0)}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <Package className="metric-icon purple" />
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">${filteredItems.reduce((sum, i) => sum + (i.grossSales || 0) + (i.addonRevenue || 0), 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden mt-6">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Quantity Sold</th>
                <th>Gross Sales</th>
                <th>Add-on Revenue</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={item.foodType === 'veg' ? 'badge badge-success' : 'badge badge-danger'}>
                      {item.foodType === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="font-medium">{item.quantitySold}</td>
                  <td className="font-medium">${item.grossSales.toFixed(2)}</td>
                  <td className="font-medium">${item.addonRevenue.toFixed(2)}</td>
                  <td className="font-bold">${(item.grossSales + item.addonRevenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
