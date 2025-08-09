import axios from "axios";
import { useContext, useEffect, useState, useMemo } from "react";
import AuthContext from "../context/AuthContext";
import SelectInput from "../components/SelectInput";
import { toast } from "react-toastify";
import DateRangeFilter from "./shared/DateRangeFilter";
import {
    Clock,
    Users,
    Calculator,
    FileText,
    DollarSign,
    Calendar,
    Download,
    Filter,
    Search,
    ChevronDown,
    User,
    Building,
    TrendingUp
} from 'lucide-react';

// Default hourly rates by role
const defaultHourlyRates = {
    'Admin': 25,
    'Manager': 20,
    'Staff': 15
};


export default function Payroll() {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [payrollData, setPayrollData] = useState([]);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [hourlyRates, setHourlyRates] = useState(defaultHourlyRates);

    useEffect(() => {
        if (staff.permissions?.includes('tax_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    useEffect(() => {
        if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/api/payroll`, {
                    params: {
                        brand_id: selectedBrand.value,
                        outlet_id: selectedOutlet.value,
                        // Send plain YYYY-MM-DD (no new Date(), no toISOString())
                        start_date: dateRange.start,
                        end_date: dateRange.end
                    },
                    withCredentials: true,
                });

                if (res.data.success) {
                    setPayrollData(res.data.data);
                } else {
                    toast.error("No payroll data found");
                }
            } catch (error) {
                toast.error('Failed to fetch payroll data');
                console.error(error);
            }
        };

        fetchData();
    }, [selectedBrand, selectedOutlet, dateRange, API]);

    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter(outlet => outlet.brand_id === brand.value);
        setSelectedOutlet(null);
        setFilteredOutlets(filtered);
        if (filtered.length === 0) {
            toast.error("Selected brand has no outlets.");
        }
    };

    const handleOutletSelection = (outlet) => {
        setSelectedOutlet(outlet);
    };



    // Process payroll data
    const processedData = useMemo(() => {
        const staffHours = {};
        const staffInfo = {};

        payrollData.forEach(day => {
            day.punchIns.forEach(punch => {
                const staffId = punch.user_id;
                const staff = day.staffInfo.find(s => s.staff_id === staffId);

                if (!staff) return;

                const hoursWorked = (punch.punch_out - punch.punch_in) / (1000 * 60 * 60);
                const date = new Date(punch.punch_in).toDateString();

                if (!staffHours[staffId]) {
                    staffHours[staffId] = [];
                    staffInfo[staffId] = staff;
                }

                staffHours[staffId].push({
                    date,
                    hoursWorked: Math.round(hoursWorked * 100) / 100,
                    punchIn: new Date(punch.punch_in),
                    punchOut: new Date(punch.punch_out),
                    shift_id: punch.shift_id
                });
            });
        });

        return { staffHours, staffInfo };
    }, [payrollData]);


    const filteredStaffData = useMemo(() => {
        const { staffHours, staffInfo } = processedData;
        let filtered = Object.keys(staffHours);

        if (selectedStaff !== 'all') {
            filtered = filtered.filter(id => id === selectedStaff);
        }

        if (searchTerm) {
            filtered = filtered.filter(id =>
                staffInfo[id]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staffInfo[id]?.role_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered.map(staffId => {
            const totalHours = staffHours[staffId].reduce((sum, shift) => sum + shift.hoursWorked, 0);
            const hourlyRate = hourlyRates[staffInfo[staffId]?.role_name] || 15;
            const totalPay = totalHours * hourlyRate;

            return {
                staffId,
                info: staffInfo[staffId],
                shifts: staffHours[staffId],
                totalHours: Math.round(totalHours * 100) / 100,
                hourlyRate,
                totalPay: Math.round(totalPay * 100) / 100
            };
        });
    }, [processedData, selectedStaff, searchTerm, hourlyRates]);

    const dashboardStats = useMemo(() => {
        const totalEmployees = Object.keys(processedData.staffInfo).length;
        const totalHours = filteredStaffData.reduce((sum, staff) => sum + staff.totalHours, 0);
        const totalPayroll = filteredStaffData.reduce((sum, staff) => sum + staff.totalPay, 0);
        const avgHoursPerEmployee = totalEmployees > 0 ? totalHours / totalEmployees : 0;

        return {
            totalEmployees,
            totalHours: Math.round(totalHours * 100) / 100,
            totalPayroll: Math.round(totalPayroll * 100) / 100,
            avgHoursPerEmployee: Math.round(avgHoursPerEmployee * 100) / 100
        };
    }, [filteredStaffData, processedData]);

    const Navigation = () => (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                        <Building className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">PayrollPro</h1>
                    </div>
                    <div className="hidden md:flex space-x-1">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                            { id: 'timesheets', label: 'Timesheets', icon: Clock },
                            { id: 'staff', label: 'Staff Management', icon: Users },
                            { id: 'payroll', label: 'Payroll', icon: Calculator },
                            { id: 'reports', label: 'Reports', icon: FileText }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );

    const DashboardView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Payroll Dashboard</h2>
                <div className="flex items-center space-x-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Employees</p>
                            <p className="text-2xl font-bold text-blue-900">{dashboardStats.totalEmployees}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-emerald-600 rounded-lg">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-emerald-600">Total Hours</p>
                            <p className="text-2xl font-bold text-emerald-900">{dashboardStats.totalHours}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-600 rounded-lg">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-orange-600">Total Payroll</p>
                            <p className="text-2xl font-bold text-orange-900">${dashboardStats.totalPayroll}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-600 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">Avg Hours/Employee</p>
                            <p className="text-2xl font-bold text-purple-900">{dashboardStats.avgHoursPerEmployee}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {filteredStaffData.slice(0, 5).map((staff) => (
                            <div key={staff.staffId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{staff.info?.name}</p>
                                        <p className="text-sm text-gray-500">{staff.info?.role_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{staff.totalHours}h</p>
                                    <p className="text-sm text-gray-500">${staff.totalPay}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const TimesheetsView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Timesheets</h2>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Staff</option>
                        {Object.entries(processedData.staffInfo).map(([id, staff]) => (
                            <option key={id} value={id}>{staff.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Hours
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hourly Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Pay
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStaffData.map((staff) => (
                                <tr key={staff.staffId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{staff.info?.name}</div>
                                                <div className="text-sm text-gray-500">ID: {staff.staffId.slice(-8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${staff.info?.role_name === 'Admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : staff.info?.role_name === 'Manager'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {staff.info?.role_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {staff.totalHours}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${staff.hourlyRate}/hr
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${staff.totalPay}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const StaffManagementView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Staff Management</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Users className="h-4 w-4" />
                    <span>Add Staff</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Rates by Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(hourlyRates).map(([role, rate]) => (
                        <div key={role} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">{role}</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={rate}
                                    onChange={(e) => setHourlyRates(prev => ({
                                        ...prev,
                                        [role]: parseFloat(e.target.value) || 0
                                    }))}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Staff Directory</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {Object.entries(processedData.staffInfo).map(([id, staff]) => (
                        <div key={id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{staff.name}</h4>
                                    <p className="text-sm text-gray-500">{staff.role_name}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hourly Rate:</span>
                                    <span className="font-medium">${hourlyRates[staff.role_name] || 15}/hr</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Staff ID:</span>
                                    <span className="font-medium font-mono">{id.slice(-8)}</span>
                                </div>
                            </div>
                            <button className="mt-3 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                                Edit Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const PayrollView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Payroll Processing</h2>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        <Calculator className="h-4 w-4" />
                        <span>Process Payroll</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Payroll Summary</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hours
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gross Pay
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStaffData.map((staff) => (
                                        <tr key={staff.staffId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{staff.info?.name}</div>
                                                        <div className="text-sm text-gray-500">{staff.info?.role_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {staff.totalHours}h
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${staff.hourlyRate}/hr
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${staff.totalPay}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Period</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Totals</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Hours:</span>
                                <span className="font-medium">{dashboardStats.totalHours}h</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gross Pay:</span>
                                <span className="font-medium">${dashboardStats.totalPayroll}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Taxes (Est.):</span>
                                <span className="font-medium">${Math.round(dashboardStats.totalPayroll * 0.25 * 100) / 100}</span>
                            </div>
                            <hr className="border-gray-200" />
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold text-gray-900">Net Pay:</span>
                                <span className="font-bold text-gray-900">${Math.round(dashboardStats.totalPayroll * 0.75 * 100) / 100}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ReportsView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <FileText className="h-4 w-4" />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hours by Role</h3>
                    <div className="space-y-4">
                        {Object.entries(hourlyRates).map(([role, rate]) => {
                            const roleStaff = filteredStaffData.filter(s => s.info?.role_name === role);
                            const totalHours = roleStaff.reduce((sum, staff) => sum + staff.totalHours, 0);
                            const totalPay = roleStaff.reduce((sum, staff) => sum + staff.totalPay, 0);

                            return (
                                <div key={role} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{role}</p>
                                        <p className="text-sm text-gray-500">{roleStaff.length} employees</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{Math.round(totalHours * 100) / 100}h</p>
                                        <p className="text-sm text-gray-500">${Math.round(totalPay * 100) / 100}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                    <div className="space-y-4">
                        {filteredStaffData
                            .sort((a, b) => b.totalHours - a.totalHours)
                            .slice(0, 5)
                            .map((staff, index) => (
                                <div key={staff.staffId} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{staff.info?.name}</p>
                                            <p className="text-sm text-gray-500">{staff.info?.role_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{staff.totalHours}h</p>
                                        <p className="text-sm text-gray-500">${staff.totalPay}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="h-6 w-6 text-blue-600 mb-2" />
                        <p className="font-medium text-gray-900">Timesheet Report</p>
                        <p className="text-sm text-gray-500">Export detailed timesheet data</p>
                    </button>
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Calculator className="h-6 w-6 text-emerald-600 mb-2" />
                        <p className="font-medium text-gray-900">Payroll Summary</p>
                        <p className="text-sm text-gray-500">Generate payroll report</p>
                    </button>
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
                        <p className="font-medium text-gray-900">Analytics Report</p>
                        <p className="text-sm text-gray-500">View performance metrics</p>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderActiveView = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardView />;
            case 'timesheets':
                return <TimesheetsView />;
            case 'staff':
                return <StaffManagementView />;
            case 'payroll':
                return <PayrollView />;
            case 'reports':
                return <ReportsView />;
            default:
                return <DashboardView />;
        }
    };



    return (
        <>
            <h1>Payroll</h1>
            <div>
                <SelectInput
                    label="Select Brand"
                    selectedOption={selectedBrand}
                    onChange={handleBrandSelection}
                    options={brands.map(o => ({ label: o.full_name, value: o._id }))}
                />
                <SelectInput
                    label="Outlet"
                    selectedOption={selectedOutlet}
                    onChange={handleOutletSelection}
                    options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                />
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            <div>
                <h2>Results</h2>
                {payrollData.length === 0 && <p>No records</p>}
                {payrollData.map((item, idx) => (
                    <div key={idx}>
                        <strong>{item.date}</strong> – {item.outlet?.name}
                    </div>
                ))}
            </div>

            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {renderActiveView()}
                </main>
            </div>
        </>
    );
}
