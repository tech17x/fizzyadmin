import React from 'react';
import { X } from 'lucide-react';

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl p-6 bg-white rounded shadow-lg max-h-[80vh] overflow-auto">
        <div className="modal-header flex justify-between items-center mb-6">
          <h2 className="modal-title text-xl font-bold">Order Details - {order.order_id || order.id}</h2>
          <button onClick={onClose} aria-label="Close" className="modal-close p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Date & Time</label>
            <p className="text-gray-900">
              {order.orderDayAt ? new Date(order.orderDayAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Order Type</label>
            <p className="text-gray-900">{order.orderType?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Staff</label>
            <p className="text-gray-900">{order.terminalStaff?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Customer</label>
            <p className="text-gray-900">{order.customer?.name || 'N/A'}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
          {order.items && order.items.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              {order.items.map((item) => (
                <div key={item._id || item.name} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-none">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    )}
                  </div>
                  <span className="font-medium">₹{item.total_price?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No items found</p>
          )}
        </div>

        {/* Add-ons (if any) */}
        {order.items && order.items.some(i => i.activeAddons && i.activeAddons.length > 0) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Add-ons</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {order.items.flatMap(item => item.activeAddons.map(addon => (
                <div key={addon._id || addon.name} className="flex justify-between items-center">
                  <span className="font-medium">{addon.name}</span>
                  <span className="font-medium">₹{addon.price?.toFixed(2) || '0.00'}</span>
                </div>
              )))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.summary?.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{order.summary?.tax?.toFixed(2) || '0.00'}</span>
            </div>
            {order.summary?.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{order.summary.discount.toFixed(2)}</span>
              </div>
            )}
            <hr className="border-gray-300" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{order.summary?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>Payment Methods</span>
              <span className="font-medium">
                {order.paymentInfo?.payments?.length
                  ? order.paymentInfo.payments.map(p => p.typeName).join(', ')
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid</span>
              <span className="font-medium">₹{order.paymentInfo?.totalPaid?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className={`badge ${order.status === 'settle' ? 'badge-success' :
                  order.status === 'cancel' ? 'badge-danger' :
                    'badge-warning'
                }`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
