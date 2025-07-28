import React, { useState } from 'react';
import { Download, CreditCard } from 'lucide-react';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import './Reports.css';

export default function PaymentSummary() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const paymentMethods = [
    {
      type: 'Credit Card',
      transactions: 245,
      totalAmount: 12580.50,
      sharePercentage: 54.2
    },
    {
      type: 'Cash',
      transactions: 189,
      totalAmount: 7650.25,
      sharePercentage: 33.0
    },
    {
      type: 'UPI',
      transactions: 67,
      totalAmount: 2450.75,
      sharePercentage: 10.6
    },
    {
      type: 'Debit Card',
      transactions: 23,
      totalAmount: 510.00,
      sharePercentage: 2.2
    }
  ];

  const totalAmount = paymentMethods.reduce((sum, method) => sum + method.totalAmount, 0);
  const totalTransactions = paymentMethods.reduce((sum, method) => sum + method.transactions, 0);

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(paymentMethods, 'payment-summary');
    } else {
      exportToPDF(paymentMethods, 'payment-summary');
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon blue mr-3">
              <CreditCard />
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Methods</p>
              <p className="text-2xl font-bold">{paymentMethods.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon green mr-3">
              <CreditCard />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="metric-card-icon purple mr-3">
              <CreditCard />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Payment Methods Breakdown</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Payment Type</th>
                  <th>Transactions</th>
                  <th>Total Amount</th>
                  <th>Share %</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((method, index) => (
                  <tr key={index}>
                    <td>
                      <div className="flex items-center">
                        <CreditCard size={16} className="text-gray-400 mr-2" />
                        <span className="font-medium">{method.type}</span>
                      </div>
                    </td>
                    <td className="font-medium">{method.transactions.toLocaleString()}</td>
                    <td className="font-bold">${method.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className="text-sm font-medium">
                        {method.sharePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Distribution</h3>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => {
              const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
              
              return (
                <div key={method.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{method.type}</span>
                    <span className="text-sm text-gray-600">{method.sharePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ 
                        width: `${method.sharePercentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{method.transactions} transactions</span>
                    <span>${method.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total</span>
              <div className="text-right">
                <div className="font-bold text-xl">
                  ${totalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {totalTransactions.toLocaleString()} transactions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}