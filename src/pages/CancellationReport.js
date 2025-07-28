import React, { useState } from 'react';
import { Download, XCircle, AlertTriangle } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function CancellationReport() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');

  const cancellations = [
    {
      orderId: 'ORD-003',
      date: '2025-01-15',
      time: '16:00',
      status: 'cancel',
      staff: 'Emily Davis',
      reason: 'Customer changed mind',
      refundAmount: 0,
      paymentType: 'N/A',
      paymentMethod: 'N/A',
      originalTotal: 34.50
    },
    {
      orderId: 'ORD-012',
      date: '2025-01-15',
      time: '14:30',
      status: 'refund',
      staff: 'Sarah Johnson',
      reason: 'Food quality issue',
      refundAmount: 28.75,
      paymentType: 'Full Refund',
      paymentMethod: 'Credit Card',
      originalTotal: 28.75
    },
    {
      orderId: 'ORD-018',
      date: '2025-01-14',
      time: '19:15',
      status: 'refund',
      staff: 'Mike Chen',
      reason: 'Wrong order delivered',
      refundAmount: 15.50,
      paymentType: 'Partial Refund',
      paymentMethod: 'Cash',
      originalTotal: 31.00
    }
  ];

  const filteredCancellations = cancellations.filter(item => 
    statusFilter === 'all' || item.status === statusFilter
  );

  const totalCancellations = filteredCancellations.filter(item => item.status === 'cancel').length;
  const totalRefunds = filteredCancellations.filter(item => item.status === 'refund').length;
  const totalRefundAmount = filteredCancellations
    .filter(item => item.status === 'refund')
    .reduce((sum, item) => sum + item.refundAmount, 0);

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(filteredCancellations, 'cancellation-report');
    } else {
      exportToPDF(filteredCancellations, 'cancellation-report');
    }
  };

  const getStatusBadge = (status) => {
    return status === 'cancel' 
      ? 'badge badge-danger' 
      : 'badge badge-warning';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="all">All Status</option>
            <option value="cancel">Cancelled</option>
            <option value="refund">Refunded</option>
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
            <div className="metric-card-icon" style={{ backgroundColor: '#dc2626', padding: '12px', borderRadius: '50%' }}>
              <XCircle color="white" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Cancellations</p>
              <p className="text-2xl font-bold text-red-600">{totalCancellations}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon" style={{ backgroundColor: '#d97706', padding: '12px', borderRadius: '50%' }}>
              <AlertTriangle color="white" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-yellow-600">{totalRefunds}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon" style={{ backgroundColor: '#7c3aed', padding: '12px', borderRadius: '50%' }}>
              <AlertTriangle color="white" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Refund Amount</p>
              <p className="text-2xl font-bold text-purple-600">${totalRefundAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellations Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Cancellation & Refund Details</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Staff</th>
                <th>Reason</th>
                <th>Original Total</th>
                <th>Refund Amount</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {filteredCancellations.map((item, index) => (
                <tr key={index}>
                  <td className="font-medium">{item.orderId}</td>
                  <td>
                    <div>{item.date}</div>
                    <div className="text-sm text-gray-500">{item.time}</div>
                  </td>
                  <td>
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.staff}</td>
                  <td className="max-w-xs truncate">{item.reason}</td>
                  <td className="font-medium">${item.originalTotal.toFixed(2)}</td>
                  <td className="font-bold">
                    {item.status === 'refund' ? `$${item.refundAmount.toFixed(2)}` : 'N/A'}
                  </td>
                  <td>{item.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Cancellation Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Top Cancellation Reasons</h4>
            <div className="space-y-2">
              {['Customer changed mind', 'Food quality issue', 'Wrong order delivered', 'Long wait time'].map((reason, index) => (
                <div key={reason} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm">{reason}</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 5) + 1}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Financial Impact</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Lost Revenue (Cancellations)</span>
                <span className="font-medium">$34.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Refunded Amount</span>
                <span className="font-medium text-red-600">$44.25</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Impact</span>
                <span className="font-bold text-red-600">$78.75</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}