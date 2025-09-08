import React, { useEffect, useState, useContext } from 'react';
import { Eye, Download } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import SelectInput from '../components/SelectInput.js';
import OrderDetailModal from './shared/OrderDetailModal.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import AuthContext from '../context/AuthContext.js';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Reports.css';

export default function DetailedOrders() {
  const API = process.env.REACT_APP_API_URL;
  const { staff, logout } = useContext(AuthContext);

  // Filter state
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Data/load state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial filter seeding from context
  useEffect(() => {
    if (staff.permissions?.includes('tax_manage')) {
      setOutlets(staff.outlets);
      setBrands(staff.brands);
    } else {
      logout();
    }
  }, [staff, logout]);

  // Outlet options update on brand
  const handleBrandSelection = (brand) => {
    setSelectedBrand(brand);
    const filtered = outlets.filter(o => o.brand_id === brand.value);
    setSelectedOutlet(null);
    setFilteredOutlets(filtered);
    if (filtered.length === 0) toast.error("Selected brand has no outlets.");
  };
  const handleOutletSelection = (outlet) => setSelectedOutlet(outlet);

  // Fetch orders reactively
  useEffect(() => {
    if (!selectedBrand || !selectedOutlet || !dateRange.start || !dateRange.end) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        // Normalize date range to ISO string local times
        const startLocal = new Date(dateRange.start); startLocal.setHours(0, 0, 0, 0);
        const endLocal = new Date(dateRange.end); endLocal.setHours(23, 59, 59, 999);
        const ordersRes = await axios.get(`${API}/api/reports/orders`, {
          params: {
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
            start_date: startLocal.toISOString(),
            end_date: endLocal.toISOString(),
          },
          withCredentials: true
        });
        setOrders(ordersRes.data.orders || []);
      } catch (error) {
        toast.error('Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [selectedBrand, selectedOutlet, dateRange, API]);

  // Filter orders on search text
  const filteredOrders = orders.filter(order => {
    const text = searchTerm.toLowerCase();
    return (
      (order.order_id && order.order_id.toLowerCase().includes(text)) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(text)) ||
      (order.terminalStaff?.name && order.terminalStaff.name.toLowerCase().includes(text)) ||
      (order.items?.some(item => item.name.toLowerCase().includes(text)))
    );
  });

  const getStatusBadge = status => (
    {
      settle: 'badge badge-success',
      cancel: 'badge badge-danger',
      refund: 'badge badge-warning',
    }[status] || 'badge'
  );

  // Handles CSV/PDF export
  const handleExport = (format) => {
    const exportData = filteredOrders.map(order => ({
      OrderID: order.order_id,
      Date: order.orderDayAt,
      Customer: order.customer?.name,
      Staff: order.terminalStaff?.name || '',
      OrderType: order.orderType?.name || '',
      Status: order.status,
      Paid: order.paymentInfo?.totalPaid,
      PaymentMethods: order.paymentInfo?.payments?.map(p => p.typeName).join(', ')
    }));
    if (format === 'csv') exportToCSV(exportData, 'detailed-orders');
    else exportToPDF(exportData, 'detailed-orders');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters section */}
      <div className="card p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Detailed Order Info</h1>
        <div className="flex flex-wrap items-center gap-4">
          <SelectInput
            label="Select Brand"
            selectedOption={selectedBrand}
            onChange={handleBrandSelection}
            options={brands.map(o => ({ label: o.full_name, value: o._id }))}
          />
          <SelectInput
            label="Outlet"
            selectedOption={selectedOutlet}
            onChange={handleOutletSelection}
            options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
          />
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <input
            type="text"
            placeholder="Search orders..."
            className="input input-bordered flex-grow max-w-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="ml-auto flex gap-2">
            <button onClick={() => handleExport('csv')} className="button button-success">
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="button button-danger">
              <Download size={16} className="mr-2" />
              Export PDF
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
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td colSpan={9} className="text-center p-8">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8">No orders found.</td>
                </tr>
              ) : filteredOrders.map(order => (
                <tr key={order.order_id}>
                  <td className="font-medium">{order.order_id}</td>
                  <td>
                    <div>{order.orderDayAt && new Date(order.orderDayAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{order.orderDayAt && new Date(order.orderDayAt).toLocaleTimeString()}</div>
                  </td>
                  <td>{order.orderType?.name || 'N/A'}</td>
                  <td>{order.terminalStaff?.name || 'N/A'}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>
                    <span className={getStatusBadge(order.status)}>{order.status}</span>
                  </td>
                  <td className="font-medium">
                    {order.paymentInfo?.totalPaid
                      ? `₹${order.paymentInfo.totalPaid.toFixed(2)}`
                      : '₹0.00'}
                  </td>
                  <td>
                    {order.paymentInfo?.payments?.length
                      ? order.paymentInfo.payments.map(p => p.typeName).join(', ')
                      : 'N/A'}
                  </td>
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
