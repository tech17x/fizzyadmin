import React, { useState } from 'react';
import { Download, Package } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function ItemwiseSales() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');

  const items = [
    {
      name: 'Margherita Pizza',
      category: 'Main Course',
      quantitySold: 45,
      grossSales: 832.50,
      addonRevenue: 67.50,
      foodType: 'veg'
    },
    {
      name: 'Chicken Tikka',
      category: 'Appetizers',
      quantitySold: 32,
      grossSales: 576.00,
      addonRevenue: 45.00,
      foodType: 'non-veg'
    },
    {
      name: 'Caesar Salad',
      category: 'Salads',
      quantitySold: 28,
      grossSales: 350.00,
      addonRevenue: 28.00,
      foodType: 'veg'
    }
  ];

  const filteredItems = items.filter(item => {
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    const foodTypeMatch = foodTypeFilter === 'all' || item.foodType === foodTypeFilter;
    return categoryMatch && foodTypeMatch;
  });

  const categories = [...new Set(items.map(item => item.category))];

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(filteredItems, 'itemwise-sales');
    } else {
      exportToPDF(filteredItems, 'itemwise-sales');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={foodTypeFilter}
            onChange={(e) => setFoodTypeFilter(e.target.value)}
            className="select"
          >
            <option value="all">All Food Types</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="button button-success"
            >
              <Download size={16} className="mr-2" />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="button button-danger"
            >
              <Download size={16} className="mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon blue mr-3">
              <Package />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{filteredItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon green mr-3">
              <Package />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Quantity Sold</p>
              <p className="text-2xl font-bold">
                {filteredItems.reduce((sum, item) => sum + item.quantitySold, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon purple mr-3">
              <Package />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${filteredItems.reduce((sum, item) => sum + item.grossSales + item.addonRevenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
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
              {filteredItems.map((item, index) => (
                <tr key={index}>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={`badge ${
                      item.foodType === 'veg' 
                        ? 'badge-success' 
                        : 'badge-danger'
                    }`}>
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