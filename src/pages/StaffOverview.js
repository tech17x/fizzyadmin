import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Clock, DollarSign, User, Users, TrendingUp } from 'lucide-react';
import { calculateWorkedHours, calculatePayroll, formatDuration } from '../utils/timeUtils';
import SelectInput from '../components/SelectInput.js';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import AuthContext from '../context/AuthContext.js';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const StaffOverview = () => {
    const { staff, logout } = useContext(AuthContext);

    // Filter states
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    // Data states
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize brands and outlets from staff context, or logout if no permission
    useEffect(() => {
        if (staff?.permissions?.includes('tax_manage')) {
            setBrands(staff.brands || []);
            setOutlets(staff.outlets || []);
        } else {
            logout();
        }
    }, [staff, logout]);

    // Filter outlets when brand changes
    useEffect(() => {
        if (selectedBrand) {
            const filtered = outlets.filter((o) => o.brand_id === selectedBrand.value);
            setFilteredOutlets(filtered);
            setSelectedOutlet(null);
            if (filtered.length === 0) {
                toast.error("Selected brand has no outlets.");
            }
        } else {
            setFilteredOutlets([]);
            setSelectedOutlet(null);
        }
    }, [selectedBrand, outlets]);

    // Convert date string to ISO with UTC correction
    const toLocalISOString = (dateString, endOfDay = false) => {
        const d = new Date(dateString + "T00:00:00");
        if (endOfDay) d.setHours(23, 59, 59, 999);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
    };

    // Fetch staff payroll data with filters as query params
    const fetchStaffData = async () => {
        if (!selectedBrand || !selectedOutlet || !dateRange.start || !dateRange.end) return;
        setLoading(true);
        setError(null);
        try {
            const start = toLocalISOString(dateRange.start, false);
            const end = toLocalISOString(dateRange.end, true);
            const response = await axios.get(`${API}/api/payroll/day-staff-report`, {
                params: {
                    brand_id: selectedBrand.value,
                    outlet_id: selectedOutlet.value,
                    start_date: start,
                    end_date: end,
                },
                withCredentials: true,
            });
            if (response.data.success) {
                setStaffData(response.data.data);
                toast.success('Staff data loaded successfully');
            } else {
                setError('Failed to load staff data');
            }
        } catch (err) {
            setError('Error fetching staff data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto fetch data when filters change
    useEffect(() => {
        fetchStaffData();
    }, [selectedBrand, selectedOutlet, dateRange]);

    // Process staff statistics as before
    const staffStats = staffData.reduce((acc, shift) => {
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
                    totalPayroll: 0,
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Clock className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading staff data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-8">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <>
            {/* Filters */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Filters to View Data</h3>
                        <p className="text-gray-600 mb-6">Choose a brand, outlet, and date range to load staff analytics</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                            <SelectInput
                                label="Select Brand"
                                selectedOption={selectedBrand}
                                onChange={setSelectedBrand}
                                options={brands.map(b => ({ label: b.full_name, value: b._id }))}
                            />
                            <SelectInput
                                label="Select Outlet"
                                selectedOption={selectedOutlet}
                                onChange={setSelectedOutlet}
                                options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                            />
                            <DateRangeFilter value={dateRange} onChange={setDateRange} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Staff Overview Cards and Details */}
            <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                                                <h4 className="text-sm font-semibold text-gray-900 truncate">{staff.name}</h4>
                                                <p className="text-xs text-gray-500 truncate">{staff.email}</p>
                                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-gray-500">Hours:</span>
                                                        <span className="ml-1 font-medium text-gray-900">{formatDuration(staff.totalHours)}</span>
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
                                                        <span className="ml-1 font-medium text-green-600">${staff.totalPayroll.toFixed(2)}</span>
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
        </>
    );
};
