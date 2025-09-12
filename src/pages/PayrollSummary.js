import React from 'react';
import { DollarSign, Clock, TrendingUp, Download, User } from 'lucide-react';
import { calculateWorkedHours, calculatePayroll, formatDuration } from '../utils/timeUtils';

export const PayrollSummary = ({ data }) => {
  const payrollData = data.reduce((acc, shift) => {
    shift.staffPunchIns.forEach((punchIn) => {
      const staffName = punchIn.staff?.name || 'Unknown Staff';
      const staffId = punchIn.staff?.id || 'unknown';
      
      if (!acc[staffId]) {
        acc[staffId] = {
          name: staffName,
          email: punchIn.staff?.email || 'N/A',
          phone: punchIn.staff?.phone || 'N/A',
          shifts: [],
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0,
          totalPay: 0,
          regularPay: 0,
          overtimePay: 0
        };
      }
      
      const workedHours = calculateWorkedHours(
        punchIn.punch_in,
        punchIn.punch_out,
        punchIn.breaks
      );
      
      const regularHours = Math.min(workedHours, 8);
      const overtimeHours = Math.max(0, workedHours - 8);
      const regularPay = calculatePayroll(regularHours, 15);
      const overtimePay = calculatePayroll(overtimeHours, 22.5); // 1.5x overtime
      
      acc[staffId].shifts.push({
        date: new Date(shift.outletInfo.openTime).toLocaleDateString(),
        hours: workedHours,
        regularHours,
        overtimeHours,
        pay: regularPay + overtimePay
      });
      
      acc[staffId].totalHours += workedHours;
      acc[staffId].regularHours += regularHours;
      acc[staffId].overtimeHours += overtimeHours;
      acc[staffId].regularPay += regularPay;
      acc[staffId].overtimePay += overtimePay;
      acc[staffId].totalPay += regularPay + overtimePay;
    });
    
    return acc;
  }, {});

  const staffArray = Object.values(payrollData);
  const totalPayroll = staffArray.reduce((sum, staff) => sum + staff.totalPay, 0);
  const totalHours = staffArray.reduce((sum, staff) => sum + staff.totalHours, 0);
  const totalRegularPay = staffArray.reduce((sum, staff) => sum + staff.regularPay, 0);
  const totalOvertimePay = staffArray.reduce((sum, staff) => sum + staff.overtimePay, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900">${totalPayroll.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regular Pay</p>
              <p className="text-2xl font-bold text-blue-600">${totalRegularPay.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overtime Pay</p>
              <p className="text-2xl font-bold text-orange-600">${totalOvertimePay.toFixed(2)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-purple-600">{formatDuration(totalHours)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <Download className="h-4 w-4" />
          <span>Export Payroll</span>
        </button>
      </div>

      {/* Detailed Payroll Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payroll Details</h3>
          <p className="text-sm text-gray-500">Detailed breakdown by staff member</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regular Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regular Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pay
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffArray.map((staff, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(staff.totalHours)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(staff.regularHours)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(staff.overtimeHours)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${staff.regularPay.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                    ${staff.overtimePay.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${staff.totalPay.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};