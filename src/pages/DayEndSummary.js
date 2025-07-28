import React, { useState } from 'react';
import { Download, Calendar, User, DollarSign } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function DayEndSummary() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const dayEndReports = [
    {
      dayId: 'DAY-001',
      date: '2025-01-15',
      openedBy: 'Sarah Johnson',
      openingCash: 500.00,
      totalOrders: 145,
      totalSales: 5432.50,
      cardSales: 3245.75,
      cashSales: 1876.25,
      upiSales: 310.50,
      totalTax: 489.25,
      totalDiscounts: 125.50,
      totalExtraCharges: 45.00,
      closingCash: 2376.25,
      comment: 'Normal business day, no issues reported'
    },
    {
      dayId: 'DAY-002',
      date: '2025-01-14',
      openedBy: 'Mike Chen',
      openingCash: 500.00,
      totalOrders: 132,
      totalSales: 4876.25,
      cardSales: 2934.50,
      cashSales: 1641.75,
      upiSales: 300.00,
      totalTax: 438.86,
      totalDiscounts: 98.75,
      totalExtraCharges: 32.50,
      closingCash: 2141.75,
      comment: 'Busy evening, ran low on some ingredients'
    }
  ];

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(dayEndReports, 'day-end-summary');
    } else {
      exportToPDF(dayEndReports, 'day-end-summary');
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

      {/* Day End Reports */}
      {dayEndReports.map((report, index) => (
        <div key={report.dayId} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar size={20} className="text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold">Day End Report - {report.date}</h3>
              </div>
              <span className="text-sm text-gray-600">{report.dayId}</span>
            </div>
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
                  <p className="font-medium">${report.openingCash.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-blue-600">{report.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-xl font-bold text-green-600">${report.totalSales.toLocaleString()}</p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">Payment Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Card Sales</p>
                  <p className="text-xl font-bold text-blue-800">${report.cardSales.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">
                    {((report.cardSales / report.totalSales) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Cash Sales</p>
                  <p className="text-xl font-bold text-green-800">${report.cashSales.toLocaleString()}</p>
                  <p className="text-sm text-green-600">
                    {((report.cashSales / report.totalSales) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">UPI Sales</p>
                  <p className="text-xl font-bold text-purple-800">${report.upiSales.toLocaleString()}</p>
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
                    <p className="font-medium">${report.totalTax.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Discounts</p>
                    <p className="font-medium text-red-600">-${report.totalDiscounts.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Extra Charges</p>
                    <p className="font-medium text-green-600">+${report.totalExtraCharges.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Closing Cash</p>
                    <p className="font-bold">${report.closingCash.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            {report.comment && (
              <div>
                <h4 className="text-md font-semibold mb-2">Comments</h4>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-gray-700">{report.comment}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}