import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Clock, Coffee, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { formatTime, formatDate, calculateWorkedHours, formatDuration, calculatePayroll } from '../utils/timeUtils';
import SelectInput from '../components/SelectInput.js';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import AuthContext from '../context/AuthContext.js';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const DailyShifts = () => {
  const { staff, logout } = useContext(AuthContext);

  // Filter states (adjust if needed or pass as props)
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
  const [shiftData, setShiftData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize brands and outlets from staff context or logout if no permission
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

  const toLocalISOString = (dateString, endOfDay = false) => {
    const d = new Date(dateString + "T00:00:00");
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  // Fetch data with filters
  const fetchShiftData = async () => {
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
        setShiftData(response.data.data);
        toast.success("Shift data loaded successfully");
      } else {
        setError("Failed to load shift data");
      }
    } catch (err) {
      setError("Error fetching shift data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, [selectedBrand, selectedOutlet, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Clock className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading shift data...</span>
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
            <p className="text-gray-600 mb-6">Choose brand, outlet, and date range to load shift data</p>
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

      {/* Render Shifts */}
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {shiftData.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No shift data available for selected filters</p>
        ) : (
          shiftData.map((shift, index) => {
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
          })
        )}
      </div>
    </>
  );
};
