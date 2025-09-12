import React from 'react';
import { Clock, Coffee, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { formatTime, formatDate, calculateWorkedHours, formatDuration, calculatePayroll } from '../utils/timeUtils';

export const DailyShifts = ({ data }) => {
  return (
    <div className="space-y-6">
      {data.map((shift, index) => {
        const shiftDate = formatDate(shift.outletInfo.openTime);
        const openTime = formatTime(shift.outletInfo.openTime);
        const closeTime = formatTime(shift.outletInfo.closeTime);
        
        const totalOrders = shift.orders.length;
        const totalRevenue = shift.orders.reduce((sum, order) => sum + order.total, 0);
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Shift Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{shiftDate}</h3>
                    <p className="text-sm text-gray-500">
                      {openTime} - {closeTime}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{totalOrders} orders</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">${totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Cash Information */}
              <div className="mt-3 flex items-center space-x-6 text-xs text-gray-500">
                <span>Opening Cash: ${shift.outletInfo.openingCash}</span>
                <span>Closing Cash: ${shift.outletInfo.closingCash}</span>
              </div>
            </div>

            {/* Staff Information */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Staff on Duty</h4>
              {shift.staffPunchIns.length > 0 ? (
                <div className="space-y-4">
                  {shift.staffPunchIns.map((punchIn, staffIndex) => {
                    const workedHours = calculateWorkedHours(
                      punchIn.punch_in,
                      punchIn.punch_out,
                      punchIn.breaks
                    );
                    const payroll = calculatePayroll(workedHours);
                    
                    return (
                      <div key={staffIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">
                                {punchIn.staff?.name || 'Unknown Staff'}
                              </h5>
                              <p className="text-xs text-gray-500">
                                {formatTime(punchIn.punch_in)} - {formatTime(punchIn.punch_out)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center space-x-4 text-xs">
                            <div className="text-center">
                              <p className="font-medium text-gray-900">{formatDuration(workedHours)}</p>
                              <p className="text-gray-500">Hours</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-gray-900">{punchIn.breaks?.length || 0}</p>
                              <p className="text-gray-500">Breaks</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-green-600">${payroll.toFixed(2)}</p>
                              <p className="text-gray-500">Pay</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Break Details */}
                        {punchIn.breaks && punchIn.breaks.length > 0 && (
                          <div className="mt-3 pl-9">
                            <div className="flex items-center space-x-2 mb-2">
                              <Coffee className="h-3 w-3 text-orange-500" />
                              <span className="text-xs font-medium text-gray-700">Breaks</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {punchIn.breaks.map((breakItem, breakIndex) => (
                                <div key={breakIndex} className="text-xs text-gray-500">
                                  {formatTime(breakItem.start)} - {formatTime(breakItem.end)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No staff data available for this shift</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};