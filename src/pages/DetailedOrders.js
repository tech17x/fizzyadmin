import React, { useState } from 'react';
import { Eye, Download, Filter } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import OrderDetailModal from './shared/OrderDetailModal.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function DetailedOrders() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data
  const orders = [
    {
      id: 'ORD-001',
      date: '2025-01-15',
      time: '14:30',
      orderType: 'Dine In',
      staff: 'Sarah Johnson',
      customer: 'John Doe',
      status: 'settle',
      totalPaid: 45.50,
      paymentMethods: ['Card']
    },
    {
      id: 'ORD-002',
      date: '2025-01-15',
      time: '15:15',
      orderType: 'Takeaway',
      staff: 'Mike Chen',
      customer: 'Jane Smith',
      status: 'settle',
      totalPaid: 28.75,
      paymentMethods: ['Cash']
    },
    {
      id: 'ORD-003',
      date: '2025-01-15',
      time: '16:00',
      orderType: 'Delivery',
      staff: 'Emily Davis',
      customer: 'Bob Wilson',
      status: 'cancel',
      totalPaid: 0,
      paymentMethods: []
    }
  ];

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const getStatusBadge = (status) => {
    const styles = {
      settle: 'badge badge-success',
      cancel: 'badge badge-danger',
      refund: 'badge badge-warning'
    };
    return styles[status] || 'badge';
  };

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(filteredOrders, 'detailed-orders');
    } else {
      exportToPDF(filteredOrders, 'detailed-orders');
    }
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
            <option value="settle">Settled</option>
            <option value="cancel">Cancelled</option>
            <option value="refund">Refunded</option>
          </select>

          <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg">
            <Filter size={16} className="mr-2 text-gray-500" />
            <span className="text-sm text-gray-600">{filteredOrders.length} orders found</span>
          </div>

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

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Order Type</th>
                <th>Staff</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Paid</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">{order.id}</td>
                  <td>
                    <div>{order.date}</div>
                    <div className="text-sm text-gray-500">{order.time}</div>
                  </td>
                  <td>{order.orderType}</td>
                  <td>{order.staff}</td>
                  <td>{order.customer}</td>
                  <td>
                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="font-medium">${order.totalPaid.toFixed(2)}</td>
                  <td>{order.paymentMethods.join(', ') || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="button button-primary"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}