import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Clock, Coffee, User, Calendar } from 'lucide-react';
import {
  formatTime,
  formatDate,
  calculateWorkedHours,
  formatDuration,
} from '../utils/timeUtils';
import SelectInput from '../components/SelectInput.js';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import AuthContext from '../context/AuthContext.js';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const ShiftTimeline = () => {
  const { staff, logout } = useContext(AuthContext);

  // Filters state
  const [brands, setBrands] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Data and UI states
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
        toast.error('Selected brand has no outlets.');
      }
    } else {
      setFilteredOutlets([]);
      setSelectedOutlet(null);
    }
  }, [selectedBrand, outlets]);

  // Helper for ISO with timezone correction
  const toLocalISOString = (dateString, endOfDay = false) => {
    const d = new Date(dateString + 'T00:00:00');
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  };

  // Fetch shift data with filters
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
        toast.success('Shift data loaded successfully');
      } else {
        setError('Failed to load shift data');
      }
    } catch (err) {
      setError('Error fetching shift data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change
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

  // Sort fetched data by openTime
  const sortedData = [...shiftData].sort(
    (a, b) => a.outletInfo.openTime - b.outletInfo.openTime
  );

  return (
    <>
      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Filters to View Data
            </h3>
            <p className="text-gray-600 mb-6">
              Choose brand, outlet, and date range to load shift timeline
            </p>
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

      {/* Shift Timeline */}
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Shift Timeline</h3>
              <p className="text-sm text-gray-500">
                Chronological view of all shifts and staff activities
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {sortedData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No shift data available for selected filters
              </div>
            ) : (
              sortedData.map((shift, index) => {
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
                            {shift.orders.length} orders • $
                            {shift.orders
                              .reduce((sum, order) => sum + order.total, 0)
                              .toFixed(2)}{' '}
                            revenue
                          </div>
                        </div>
                      </div>

                      {/* Staff Activities */}
                      <div className="space-y-3">
                        {shift.staffPunchIns.length > 0 ? (
                          shift.staffPunchIns.map((punchIn, staffIndex) => {
                            const workedHours = calculateWorkedHours(
                              punchIn.punch_in,
                              punchIn.punch_out,
                              punchIn.breaks
                            );

                            return (
                              <div
                                key={staffIndex}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                              >
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
                                          {formatTime(punchIn.punch_in)} -{' '}
                                          {formatTime(punchIn.punch_out)}
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
                                            const breakDuration =
                                              (breakItem.end - breakItem.start) / (1000 * 60);
                                            return (
                                              <div
                                                key={breakIndex}
                                                className="text-xs text-gray-500 flex items-center justify-between bg-orange-50 px-2 py-1 rounded"
                                              >
                                                <span>
                                                  {formatTime(breakItem.start)} -{' '}
                                                  {formatTime(breakItem.end)}
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
                          })
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No staff activity recorded for this shift
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
