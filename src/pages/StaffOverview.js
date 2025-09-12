import React from 'react';
import { Clock, DollarSign, Coffee, TrendingUp, User, Users } from 'lucide-react';
import { calculateWorkedHours, calculatePayroll, formatDuration } from '../utils/timeUtils';

export const StaffOverview = ({ data }) => {
    // Calculate staff statistics
    const staffStats = data.reduce((acc, shift) => {
        shift.staffPunchIns.forEach((punchIn) => {
            const staffName = punchIn.staff?.name || 'Unknown Staff';
            const staffId = punchIn.staff?.id || 'unknown';

            if (!acc[staffId]) {
                acc[staffId] = {
                    name: staffName,
                    email: punchIn.staff?.email || 'N/A',
                    phone: punchIn.staff?.phone || 'N/A',
                    totalHours: 0,
                    totalShifts: 0,
                    totalBreaks: 0,
                    totalPayroll: 0
                };
            }

            const workedHours = calculateWorkedHours(
                punchIn.punch_in,
                punchIn.punch_out,
                punchIn.breaks
            );

            acc[staffId].totalHours += workedHours;
            acc[staffId].totalShifts += 1;
            acc[staffId].totalBreaks += punchIn.breaks?.length || 0;
            acc[staffId].totalPayroll += calculatePayroll(workedHours);
        });

        return acc;
    }, {});

    const staffArray = Object.values(staffStats);
    const totalStaff = staffArray.length;
    const totalHours = staffArray.reduce((sum, staff) => sum + staff.totalHours, 0);
    const totalPayroll = staffArray.reduce((sum, staff) => sum + staff.totalPayroll, 0);
    const totalShifts = staffArray.reduce((sum, staff) => sum + staff.totalShifts, 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Staff</p>
                            <p className="text-3xl font-bold text-gray-900">{totalStaff}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Hours</p>
                            <p className="text-3xl font-bold text-gray-900">{formatDuration(totalHours)}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <Clock className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                            <p className="text-3xl font-bold text-gray-900">${totalPayroll.toFixed(2)}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Shifts</p>
                            <p className="text-3xl font-bold text-gray-900">{totalShifts}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Staff Performance</h3>
                    <p className="text-sm text-gray-500">Overview of each staff member's hours and earnings</p>
                </div>
                <div className="p-6">
                    {staffArray.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {staffArray.map((staff, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                {staff.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">{staff.email}</p>
                                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-500">Hours:</span>
                                                    <span className="ml-1 font-medium text-gray-900">
                                                        {formatDuration(staff.totalHours)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Shifts:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{staff.totalShifts}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Breaks:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{staff.totalBreaks}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Pay:</span>
                                                    <span className="ml-1 font-medium text-green-600">
                                                        ${staff.totalPayroll.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No staff data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};