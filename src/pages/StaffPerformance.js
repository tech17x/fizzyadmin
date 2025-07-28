import React, { useState } from 'react';
import { Download, Users, TrendingUp } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function StaffPerformance() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const staff = [
    {
      name: 'Sarah Johnson',
      ordersHandled: 145,
      totalSales: 5432.50,
      avgOrderValue: 37.46,
      addonsRevenue: 234.75,
      cancelCount: 3,
      refundCount: 1
    },
    {
      name: 'Mike Chen',
      ordersHandled: 132,
      totalSales: 4876.25,
      avgOrderValue: 36.94,
      addonsRevenue: 198.50,
      cancelCount: 5,
      refundCount: 2
    },
    {
      name: 'Emily Davis',
      ordersHandled: 118,
      totalSales: 4234.75,
      avgOrderValue: 35.89,
      addonsRevenue: 167.25,
      cancelCount: 2,
      refundCount: 0
    },
    {
      name: 'James Wilson',
      ordersHandled: 98,
      totalSales: 3654.00,
      avgOrderValue: 37.29,
      addonsRevenue: 145.60,
      cancelCount: 4,
      refundCount: 1
    }
  ];

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(staff, 'staff-performance');
    } else {
      exportToPDF(staff, 'staff-performance');
    }
  };

  const totalSales = staff.reduce((sum, member) => sum + member.totalSales, 0);
  const topPerformer = staff.reduce((top, current) => 
    current.totalSales > top.totalSales ? current : top
  );

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
              <Users />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold">{staff.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon green mr-3">
              <TrendingUp />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold">{topPerformer.name}</p>
              <p className="text-sm text-gray-500">${topPerformer.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon purple mr-3">
              <TrendingUp />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Total Sales</p>
              <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Performance Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Staff Performance Details</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Orders Handled</th>
                <th>Total Sales</th>
                <th>Avg Order Value</th>
                <th>Add-ons Revenue</th>
                <th>Cancellations</th>
                <th>Refunds</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member, index) => {
                const performance = (member.totalSales / totalSales) * 100;
                const isTopPerformer = member.name === topPerformer.name;
                
                return (
                  <tr key={index} className={isTopPerformer ? 'bg-blue-50' : ''}>
                    <td>
                      <div className="flex items-center">
                        <div 
                          className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3"
                          style={{
                            backgroundColor: isTopPerformer ? '#2563eb' : '#9ca3af'
                          }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          {isTopPerformer && (
                            <div className="text-xs text-blue-600 font-medium">Top Performer</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="font-medium">{member.ordersHandled}</td>
                    <td className="font-bold">${member.totalSales.toLocaleString()}</td>
                    <td className="font-medium">${member.avgOrderValue.toFixed(2)}</td>
                    <td className="font-medium">${member.addonsRevenue.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        member.cancelCount === 0 ? 'badge-success' :
                        member.cancelCount <= 2 ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {member.cancelCount}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        member.refundCount === 0 ? 'badge-success' :
                        member.refundCount <= 1 ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {member.refundCount}
                      </span>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${isTopPerformer ? 'progress-blue' : 'progress-gray'}`}
                            style={{ 
                              width: `${performance}%`,
                              backgroundColor: isTopPerformer ? '#3b82f6' : '#9ca3af'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {performance.toFixed(1)}%
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