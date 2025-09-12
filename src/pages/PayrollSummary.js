import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  DollarSign,
  Clock,
  TrendingUp,
  Download,
  User,
} from 'lucide-react';
import {
  calculateWorkedHours,
  calculatePayroll,
  formatDuration,
} from '../utils/timeUtils';
import SelectInput from '../components/SelectInput.js';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import AuthContext from '../context/AuthContext.js';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const PayrollSummary = () => {
  const { staff, logout } = useContext(AuthContext);

  // Filters
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Payroll data and UI state
  const [payrollRawData, setPayrollRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Staff hourly rates state keyed by staffId
  // Each value is { regularRate: number, overtimeRate: number }
  const [staffRates, setStaffRates] = useState({});

  // Initialize brands and outlets from staff context or logout if no permission
  useEffect(() => {
    if (staff?.permissions?.includes('tax_manage')) {
      setBrands(staff.brands || []);
      setOutlets(staff.outlets || []);
    } else {
      logout();
    }
  }, [staff, logout]);

  // Filter outlets by selected brand
  useEffect(() => {
    if (selectedBrand) {
      const filtered = outlets.filter(
        (o) => o.brand_id === selectedBrand.value
      );
      setFilteredOutlets(filtered);
      setSelectedOutlet(null);
      if (filtered.length === 0) {
        toast.error('Selected brand has no outlets.');
      }
    } else {
      setFilteredOutlets([]);
      setSelectedOutlet(null);
    }
  }, [selectedBrand, outlets]);

  // Convert date string to ISO with timezone offset correction
  const toLocalISOString = (dateString, endOfDay = false) => {
    const d = new Date(dateString + 'T00:00:00');
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  // Fetch payroll data with filters
  const fetchPayrollData = async () => {
    if (!selectedBrand || !selectedOutlet || !dateRange.start || !dateRange.end)
      return;
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
        setPayrollRawData(response.data.data);

        // Initialize staffRates from fetched data, setting rates based on role or default
        const rates = {};
        response.data.data.forEach((shift) => {
          shift.staffPunchIns.forEach((punchIn) => {
            const id = punchIn.staff?.id || 'unknown';
            if (!rates[id]) {
              // Assume punchIn.staff.roles is an array of role strings or a single string
              // Map roles to hourly rates here, e.g., roleRates map
              const role = punchIn.staff?.role || 'default';
              const roleRates = {
                manager: 25,
                supervisor: 20,
                cashier: 15,
                default: 15,
              };
              const regularRate = roleRates[role.toLowerCase()] || 15;
              const overtimeRate = regularRate * 1.5;
              rates[id] = {
                regularRate,
                overtimeRate,
              };
            }
          });
        });
        setStaffRates(rates);

        toast.success('Payroll data loaded successfully');
      } else {
        setError('Failed to load payroll data');
      }
    } catch (err) {
      setError('Error fetching payroll data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever filters change
  useEffect(() => {
    fetchPayrollData();
  }, [selectedBrand, selectedOutlet, dateRange]);

  // Handler for updating hourly rates
  const handleRateChange = (staffId, type, value) => {
    setStaffRates((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [type]: parseFloat(value) >= 0 ? parseFloat(value) : 0,
      },
    }));
  };

  // Calculate payrollData from raw data and current hourly rates
  const payrollData = payrollRawData.reduce((acc, shift) => {
    shift.staffPunchIns.forEach((punchIn) => {
      const staffName = punchIn.staff?.name || 'Unknown Staff';
      const staffId = punchIn.staff?.id || 'unknown';

      if (!acc[staffId]) {
        acc[staffId] = {
          id: staffId,
          name: staffName,
          email: punchIn.staff?.email || 'N/A',
          phone: punchIn.staff?.phone || 'N/A',
          shifts: [],
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0,
          totalPay: 0,
          regularPay: 0,
          overtimePay: 0,
        };
      }

      const regularRate = staffRates[staffId]?.regularRate ?? 15;
      const overtimeRate = staffRates[staffId]?.overtimeRate ?? regularRate * 1.5;

      const workedHours = calculateWorkedHours(
        punchIn.punch_in,
        punchIn.punch_out,
        punchIn.breaks
      );

      const regularHours = Math.min(workedHours, 8);
      const overtimeHours = Math.max(0, workedHours - 8);

      const regularPay = calculatePayroll(regularHours, regularRate);
      const overtimePay = calculatePayroll(overtimeHours, overtimeRate);

      acc[staffId].shifts.push({
        date: new Date(shift.outletInfo.openTime).toLocaleDateString(),
        hours: workedHours,
        regularHours,
        overtimeHours,
        pay: regularPay + overtimePay,
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

  // Totals for summary cards
  const totalPayroll = staffArray.reduce((sum, staff) => sum + staff.totalPay, 0);
  const totalHours = staffArray.reduce((sum, staff) => sum + staff.totalHours, 0);
  const totalRegularPay = staffArray.reduce((sum, staff) => sum + staff.regularPay, 0);
  const totalOvertimePay = staffArray.reduce((sum, staff) => sum + staff.overtimePay, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Clock className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading payroll data...</span>
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
    <div className="space-y-6">
      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Filters to View Data</h3>
            <p className="text-gray-600 mb-6">Choose brand, outlet, and date range to load payroll data</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <SelectInput
                label="Select Brand"
                selectedOption={selectedBrand}
                onChange={setSelectedBrand}
                options={brands.map((b) => ({ label: b.full_name, value: b._id }))}
              />
              <SelectInput
                label="Select Outlet"
                selectedOption={selectedOutlet}
                onChange={setSelectedOutlet}
                options={filteredOutlets.map((o) => ({ label: o.name, value: o._id }))}
              />
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </div>
      </main>

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
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
                  Regular Hourly Rate ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Hourly Rate ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regular Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-green-600 uppercase tracking-wider">
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
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={staffRates[staff.id]?.regularRate ?? 15}
                      onChange={(e) =>
                        handleRateChange(staff.id, 'regularRate', e.target.value)
                      }
                      className="w-24 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={staffRates[staff.id]?.overtimeRate ?? (staffRates[staff.id]?.regularRate ?? 15) * 1.5}
                      onChange={(e) =>
                        handleRateChange(staff.id, 'overtimeRate', e.target.value)
                      }
                      className="w-24 border rounded px-2 py-1"
                    />
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
