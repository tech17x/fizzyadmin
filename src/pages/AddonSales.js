import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function AddonSales() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const addons = [
    {
      name: 'Extra Cheese',
      associatedItem: 'Margherita Pizza',
      quantityUsed: 34,
      totalRevenue: 85.00,
      avgPrice: 2.50
    },
    {
      name: 'Bacon',
      associatedItem: 'Caesar Salad',
      quantityUsed: 18,
      totalRevenue: 54.00,
      avgPrice: 3.00
    },
    {
      name: 'Avocado',
      associatedItem: 'Chicken Sandwich',
      quantityUsed: 22,
      totalRevenue: 66.00,
      avgPrice: 3.00
    },
    {
      name: 'Extra Sauce',
      associatedItem: 'Multiple Items',
      quantityUsed: 45,
      totalRevenue: 45.00,
      avgPrice: 1.00
    }
  ];

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(addons, 'addon-sales');
    } else {
      exportToPDF(addons, 'addon-sales');
    }
  };

  const totalAddonRevenue = addons.reduce((sum, addon) => sum + addon.totalRevenue, 0);
  const totalQuantityUsed = addons.reduce((sum, addon) => sum + addon.quantityUsed, 0);

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon blue mr-3">
              <Plus />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Add-ons</p>
              <p className="text-2xl font-bold">{addons.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon green mr-3">
              <Plus />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Quantity Used</p>
              <p className="text-2xl font-bold">{totalQuantityUsed}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon purple mr-3">
              <Plus />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Add-on Revenue</p>
              <p className="text-2xl font-bold">${totalAddonRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add-ons Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Add-on Performance</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Add-on Name</th>
                <th>Associated Item</th>
                <th>Quantity Used</th>
                <th>Avg Price</th>
                <th>Total Revenue</th>
                <th>Revenue %</th>
              </tr>
            </thead>
            <tbody>
              {addons.map((addon, index) => {
                const revenuePercentage = (addon.totalRevenue / totalAddonRevenue) * 100;
                return (
                  <tr key={index}>
                    <td>
                      <div className="flex items-center">
                        <Plus size={16} className="text-gray-400 mr-2" />
                        <span className="font-medium">{addon.name}</span>
                      </div>
                    </td>
                    <td>{addon.associatedItem}</td>
                    <td className="font-medium">{addon.quantityUsed}</td>
                    <td className="font-medium">${addon.avgPrice.toFixed(2)}</td>
                    <td className="font-bold">${addon.totalRevenue.toFixed(2)}</td>
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
    </div>
  );
}