import React from 'react';
import { X } from 'lucide-react';

export default function OrderDetailModal({ order, onClose }) {
  // Mock detailed order data
  const orderDetails = {
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 18.50, total: 37.00 },
      { name: 'Caesar Salad', quantity: 1, price: 12.50, total: 12.50 }
    ],
    addons: [
      { name: 'Extra Cheese', price: 2.50 },
      { name: 'Olives', price: 1.50 }
    ],
    summary: {
      subtotal: 49.50,
      tax: 4.46,
      discount: 0,
      total: 53.96
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Order Details - {order.id}</h2>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Date & Time</label>
              <p className="text-gray-900">{order.date} at {order.time}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Order Type</label>
              <p className="text-gray-900">{order.orderType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Staff</label>
              <p className="text-gray-900">{order.staff}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Customer</label>
              <p className="text-gray-900">{order.customer}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          {orderDetails.addons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Add-ons</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {orderDetails.addons.map((addon, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="font-medium">{addon.name}</span>
                    <span className="font-medium">${addon.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${orderDetails.summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${orderDetails.summary.tax.toFixed(2)}</span>
              </div>
              {orderDetails.summary.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${orderDetails.summary.discount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-gray-300" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${orderDetails.summary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-medium">{order.paymentMethods.join(', ') || 'N/A'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Amount Paid</span>
                <span className="font-medium">${order.totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Status</span>
                <span className={`badge ${
                  order.status === 'settle' ? 'badge-success' :
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
    </div>
  );
}