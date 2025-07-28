import React, { useState } from 'react';
import { Download, Tag } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function CategorySales() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const categories = [
    {
      name: 'Main Course',
      totalOrders: 145,
      quantitySold: 234,
      grossSales: 4560.50,
      addonRevenue: 345.75
    },
    {
      name: 'Appetizers',
      totalOrders: 98,
      quantitySold: 156,
      grossSales: 2340.00,
      addonRevenue: 178.50
    },
    {
      name: 'Desserts',
      totalOrders: 76,
      quantitySold: 98,
      grossSales: 1234.25,
      addonRevenue: 89.25
    },
    {
      name: 'Beverages',
      totalOrders: 234,
      quantitySold: 287,
      grossSales: 876.50,
      addonRevenue: 56.75
    }
  ];

  const totalSales = categories.reduce((sum, cat) => sum + cat.grossSales + cat.addonRevenue, 0);

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(categories, 'category-sales');
    } else {
      exportToPDF(categories, 'category-sales');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Category Performance</h3>
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
                  <tr key={category.name}>
                    <td>
                      <div className="flex items-center">
                        <Tag size={16} className="text-gray-400 mr-2" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="font-medium">{category.totalOrders}</td>
                    <td className="font-medium">{category.quantitySold}</td>
                    <td className="font-bold">${(category.grossSales + category.addonRevenue).toFixed(2)}</td>
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
              const revenue = category.grossSales + category.addonRevenue;
              const percentage = (revenue / totalSales) * 100;
              const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
              
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
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
    </div>
  );
}