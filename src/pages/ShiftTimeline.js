import React from 'react';
import { Clock, Coffee, User, Calendar } from 'lucide-react';
import { formatTime, formatDate, calculateWorkedHours, formatDuration } from '../utils/timeUtils';

export const ShiftTimeline = ({ data }) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => a.outletInfo.openTime - b.outletInfo.openTime);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-full">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shift Timeline</h3>
            <p className="text-sm text-gray-500">Chronological view of all shifts and staff activities</p>
          </div>
        </div>

        <div className="space-y-8">
          {sortedData.map((shift, index) => {
            const shiftDate = formatDate(shift.outletInfo.openTime);
            const openTime = formatTime(shift.outletInfo.openTime);
            const closeTime = formatTime(shift.outletInfo.closeTime);

            return (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                {/* Timeline line */}
                {index < sortedData.length - 1 && (
                  <div className="absolute left-1.5 top-6 w-0.5 h-full bg-gray-200"></div>
                )}

                <div className="ml-8">
                  {/* Shift Header */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{shiftDate}</h4>
                        <p className="text-sm text-gray-500">
                          Store Hours: {openTime} - {closeTime}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 text-xs text-gray-500">
                        {shift.orders.length} orders • ${shift.orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)} revenue
                      </div>
                    </div>
                  </div>

                  {/* Staff Activities */}
                  <div className="space-y-3">
                    {shift.staffPunchIns.map((punchIn, staffIndex) => {
                      const workedHours = calculateWorkedHours(
                        punchIn.punch_in,
                        punchIn.punch_out,
                        punchIn.breaks
                      );

                      return (
                        <div key={staffIndex} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">
                                    {punchIn.staff?.name || 'Unknown Staff'}
                                  </h5>
                                  <p className="text-xs text-gray-500">
                                    {formatTime(punchIn.punch_in)} - {formatTime(punchIn.punch_out)}
                                  </p>
                                </div>
                                <div className="text-sm text-gray-600 mt-1 sm:mt-0">
                                  {formatDuration(workedHours)} worked
                                </div>
                              </div>

                              {/* Break Timeline */}
                              {punchIn.breaks && punchIn.breaks.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Coffee className="h-3 w-3 text-orange-500" />
                                    <span className="text-xs font-medium text-gray-700">
                                      Breaks ({punchIn.breaks.length})
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {punchIn.breaks.map((breakItem, breakIndex) => {
                                      const breakDuration = (breakItem.end - breakItem.start) / (1000 * 60);
                                      return (
                                        <div key={breakIndex} className="text-xs text-gray-500 flex items-center justify-between bg-orange-50 px-2 py-1 rounded">
                                          <span>
                                            {formatTime(breakItem.start)} - {formatTime(breakItem.end)}
                                          </span>
                                          <span className="text-orange-600 font-medium">
                                            {Math.round(breakDuration)}min
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {shift.staffPunchIns.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No staff activity recorded for this shift
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};