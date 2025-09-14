import React, { useState, useContext, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import SelectInput from '../components/SelectInput';
import DateRangeFilter from './shared/DateRangeFilter.jsx';
import {
    Calendar,
    RefreshCw,
    Users,
    ChevronDown,
    ChevronRight,
    Eye,
    CreditCard,
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-yellow-100 text-yellow-700',
    'bg-pink-100 text-pink-700',
];

function NewVsRepeatCustomers() {
    const { staff, logout } = useContext(AuthContext);

    // Filters
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    // Data & UI states
    const [newVsRepeatData, setNewVsRepeatData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedCustomers, setExpandedCustomers] = useState({});
    const [expandedOrders, setExpandedOrders] = useState({});

    // Initialize brands/outlets
    useEffect(() => {
        if (staff?.permissions?.includes('tax_manage')) {
            setOutlets(staff.outlets || []);
            setBrands(staff.brands || []);
        } else {
            logout();
        }
    }, [staff, logout]);

    // Convert local date string to ISO string in UTC
    const toLocalISOString = (dateString, endOfDay = false) => {
        const d = new Date(dateString + 'T00:00:00');
        if (endOfDay) d.setHours(23, 59, 59, 999);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
    };

    // Fetch new vs repeat customers data on filter change
    useEffect(() => {
        if (selectedBrand && selectedOutlet && dateRange.start && dateRange.end) {
            fetchNewVsRepeatCustomers();
        }
    }, [selectedBrand, selectedOutlet, dateRange]);

    const fetchNewVsRepeatCustomers = async () => {
        setLoading(true);
        try {
            const start = toLocalISOString(dateRange.start, false);
            const end = toLocalISOString(dateRange.end, true);

            const response = await axios.get(`${API}/api/reports/new-vs-repeat-customers`, {
                params: {
                    brand_id: selectedBrand.value,
                    outlet_id: selectedOutlet.value,
                    start_date: start,
                    end_date: end,
                },
                withCredentials: true,
            });

            if (response.data.success) {
                setNewVsRepeatData(response.data.data);
                toast.success('New vs Repeat customers data loaded successfully');
            } else {
                toast.error('Failed to load new vs repeat customers data');
            }
        } catch (error) {
            toast.error('Failed to fetch new vs repeat customers data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Format date range display
    const formatDateRange = (start, end) => {
        if (!start || !end) return 'Select date range';
        const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startDate} - ${endDate}`;
    };

    // Toggle expand customer orders
    const toggleCustomerDetails = (customerId) => {
        setExpandedCustomers((prev) => ({
            ...prev,
            [customerId]: !prev[customerId],
        }));
    };

    // Toggle expand single order details
    const toggleOrderDetails = (orderId) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return format(new Date(dateStr), 'MMM dd, yyyy');
    };

    // Get status badge styles
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'settle': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'refund': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get payment method icon (simple emoji fallback)
    const getPaymentMethodIcon = (methodName) => {
        if (!methodName) return '💳';
        const name = methodName.toLowerCase();
        if (name.includes('card')) return '💳';
        if (name.includes('cash')) return '💵';
        if (name.includes('upi')) return '📲';
        return '💸';
    };

    // Handle brand selection change
    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter((o) => o.brand_id === brand.value);
        setFilteredOutlets(filtered);
        setSelectedOutlet(null);
        if (filtered.length === 0) {
            toast.error('Selected brand has no outlets.');
        }
    };

    // Handle outlet selection change
    const handleOutletSelection = (outlet) => {
        setSelectedOutlet(outlet);
    };

    // Build summary cards for display
    const summaryCards = [
        {
            title: 'New Customers',
            value: newVsRepeatData?.newCustomersCount || 0,
            description: 'Customers with first order in period',
            color: 'blue',
            icon: '👤',
        },
        {
            title: 'Repeat Customers',
            value: newVsRepeatData?.repeatCustomersCount || 0,
            description: 'Customers with prior orders',
            color: 'green',
            icon: '👥',
        },
        {
            title: 'Total Customers',
            value: newVsRepeatData?.totalCustomers || 0,
            description: 'All customers ordered in period',
            color: 'gray',
            icon: '📊',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Analytics Report</h1>
                            <p className="text-gray-600">Comprehensive overview of customer activity and order statistics</p>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:text-right">
                            <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
                                <span className="text-sm text-gray-500">📅</span>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatDateRange(dateRange.start, dateRange.end)}
                                    </div>
                                    <div className="text-xs text-gray-500">{newVsRepeatData?.timezone?.label || 'Unknown Timezone'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                    <SelectInput
                        label="Brand"
                        selectedOption={selectedBrand}
                        onChange={handleBrandSelection}
                        options={brands.map((b) => ({ label: b.full_name, value: b._id }))}
                    />
                    <SelectInput
                        label="Outlet"
                        selectedOption={selectedOutlet}
                        onChange={handleOutletSelection}
                        options={filteredOutlets.map((o) => ({ label: o.name, value: o._id }))}
                    />
                    <DateRangeFilter value={dateRange} onChange={setDateRange} />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                    {summaryCards.map((card, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-xl border border-gray-200 text-center cursor-default ${card.color === 'blue'
                                ? 'bg-blue-50 text-blue-900'
                                : card.color === 'green'
                                    ? 'bg-green-50 text-green-900'
                                    : 'bg-gray-50 text-gray-900'
                                }`}
                        >
                            <div className="text-5xl">{card.icon}</div>
                            <h3 className="text-2xl font-bold my-2">{card.value}</h3>
                            <p className="text-sm opacity-90">{card.title}</p>
                            <p className="text-xs opacity-70">{card.description}</p>
                        </div>
                    ))}
                </div>

                {/* Repeat Customers */}
                <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8 max-w-7xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Repeat Customers</h3>
                    {newVsRepeatData?.repeatCustomers?.length > 0 ? (
                        newVsRepeatData.repeatCustomers.map((customer, idx) => {
                            const isExpanded = !!expandedCustomers[customer.customerId];
                            const totalSpent = customer.orders
                                .filter((o) => o.status === 'settle')
                                .reduce((sum, o) => sum + o.total, 0);

                            return (
                                <div
                                    key={customer.customerId}
                                    className={`border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {customer.customerInfo.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {customer.customerInfo.name || 'Unknown Customer'}
                                                </h4>
                                                <div className="flex space-x-4 text-sm text-gray-500">
                                                    <span>ID: {customer.customerId}</span>
                                                    {customer.customerInfo.email && <span>📧 {customer.customerInfo.email}</span>}
                                                    {customer.customerInfo.phone && <span>📞 {customer.customerInfo.phone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</div>
                                            <div className="text-sm text-gray-500">Total Spent</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-blue-50 text-blue-800 rounded-lg p-3 text-center">
                                            <div className="text-sm mb-1 font-semibold">Total Orders</div>
                                            <div className="text-xl font-bold">{customer.orderCount}</div>
                                        </div>
                                        <div className="bg-green-50 text-green-800 rounded-lg p-3 text-center">
                                            <div className="text-sm mb-1 font-semibold">Period Orders</div>
                                            <div className="text-xl font-bold">{customer.orders.length}</div>
                                        </div>
                                        <div className="bg-purple-50 text-purple-800 rounded-lg p-3 text-center">
                                            <div className="text-sm mb-1 font-semibold">First Order</div>
                                            <div className="text-sm font-medium">{formatDate(customer.firstOrderDate)}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-gray-500">
                                            {customer.orders.length} order{customer.orders.length !== 1 ? 's' : ''} in this period
                                        </span>
                                        <button
                                            onClick={() => toggleCustomerDetails(customer.customerId)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            {isExpanded ? 'Hide Orders' : 'View Orders'}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="space-y-4">
                                            {customer.orders.map((order) => {
                                                const isOrderExpanded = !!expandedOrders[order.order_id];
                                                return (
                                                    <div
                                                        key={order.order_id}
                                                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                                    >
                                                        <div className="flex justify-between mb-2">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="font-mono text-gray-600">#{order.order_id.split('_')[1]}</span>
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)
                                                                        }`}
                                                                >
                                                                    {order.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleOrderDetails(order.order_id)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            >
                                                                {isOrderExpanded ? 'Hide Details' : 'View Details'}
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                            <div>
                                                                <div className="text-xs text-gray-500">Order Total</div>
                                                                <div className="font-semibold">${order.total.toFixed(2)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">Items</div>
                                                                <div className="font-semibold">{order.itemCount}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">Date</div>
                                                                <div className="font-semibold text-sm">{formatDate(order.createdAt)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">Payment</div>
                                                                <div className="flex space-x-1">
                                                                    {order.paymentInfo?.payments?.map((p, i) => (
                                                                        <span key={i} title={p.typeName}>
                                                                            {getPaymentMethodIcon(p.typeName)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isOrderExpanded && order.paymentInfo && (
                                                            <div>
                                                                <div className="text-sm font-medium mb-2">Payment Details</div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white border border-gray-200 rounded-lg p-3">
                                                                    <div>
                                                                        <span className="text-gray-600">Total Paid:</span>{' '}
                                                                        <span className="font-semibold">${order.paymentInfo.totalPaid.toFixed(2)}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Customer Paid:</span>{' '}
                                                                        <span className="font-semibold">${order.paymentInfo.customerPaid.toFixed(2)}</span>
                                                                    </div>
                                                                    {order.paymentInfo.return > 0 && (
                                                                        <div className="text-orange-600">
                                                                            <span className="text-gray-600">Return:</span>{' '}
                                                                            <span className="font-semibold">${order.paymentInfo.return.toFixed(2)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="mt-3">
                                                                    <div className="text-sm font-medium mb-2">Payment Methods</div>
                                                                    {order.paymentInfo.payments.map((p, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="flex justify-between items-center border border-gray-200 rounded-lg p-2 mb-2"
                                                                        >
                                                                            <span>{getPaymentMethodIcon(p.typeName)}</span>
                                                                            <span>{p.typeName}</span>
                                                                            <span className="font-semibold">${p.amount.toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-600">No repeat customers found in this period.</p>
                    )}
                </section>

                {/* New Customers */}
                <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8 max-w-7xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">New Customers</h3>
                    {newVsRepeatData?.newCustomers?.length > 0 ? (
                        newVsRepeatData.newCustomers.map((customer) => {
                            const isExpanded = !!expandedCustomers[customer.customerId];
                            const totalSpent = customer.orders
                                .filter((o) => o.status === 'settle')
                                .reduce((sum, o) => sum + o.total, 0);

                            return (
                                <div
                                    key={customer.customerId}
                                    className="border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {customer.customerInfo.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {customer.customerInfo.name || "Unknown Customer"}
                                                </h4>
                                                <div className="flex space-x-4 text-sm text-gray-500">
                                                    <span>ID: {customer.customerId}</span>
                                                    {customer.customerInfo.email && <span>📧 {customer.customerInfo.email}</span>}
                                                    {customer.customerInfo.phone && <span>📞 {customer.customerInfo.phone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</div>
                                            <div className="text-sm text-gray-500">Total Spent</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-green-50 text-green-800 rounded-lg p-3 text-center">
                                            <div className="text-sm mb-1 font-semibold">Total Orders</div>
                                            <div className="text-xl font-bold">{customer.orderCount}</div>
                                        </div>
                                        <div className="bg-teal-50 text-teal-800 rounded-lg p-3 text-center">
                                            <div className="text-sm mb-1 font-semibold">Period Orders</div>
                                            <div className="text-xl font-bold">{customer.orders.length}</div>
                                        </div>
                                        <div className="bg-purple-50 text-purple-800 rounded-lg p-3 text-center">
                                            <div className="text-sm mb-1 font-semibold">First Order</div>
                                            <div className="text-sm font-medium">{formatDate(customer.firstOrderDate)}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-gray-500">
                                            {customer.orders.length} order{customer.orders.length !== 1 ? "s" : ""} in this period
                                        </span>
                                        <button
                                            onClick={() => toggleCustomerDetails(customer.customerId)}
                                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                                        >
                                            {isExpanded ? "Hide Orders" : "View Orders"}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="space-y-4">
                                            {customer.orders.map((order) => {
                                                const isOrderExpanded = !!expandedOrders[order.order_id];
                                                return (
                                                    <div
                                                        key={order.order_id}
                                                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                                    >
                                                        <div className="flex justify-between mb-2">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="font-mono text-gray-600">#{order.order_id.split("_")[1]}</span>
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                                                        order.status
                                                                    )}`}
                                                                >
                                                                    {order.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleOrderDetails(order.order_id)}
                                                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                            >
                                                                {isOrderExpanded ? "Hide Details" : "View Details"}
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                            <div>
                                                                <div className="text-xs text-gray-500">Order Total</div>
                                                                <div className="font-semibold">${order.total.toFixed(2)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">Items</div>
                                                                <div className="font-semibold">{order.itemCount}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">Date</div>
                                                                <div className="font-semibold text-sm">{formatDate(order.createdAt)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">Payment</div>
                                                                <div className="flex space-x-1">
                                                                    {order.paymentInfo?.payments?.map((p, i) => (
                                                                        <span key={i} title={p.typeName}>
                                                                            {getPaymentMethodIcon(p.typeName)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isOrderExpanded && order.paymentInfo && (
                                                            <div>
                                                                <div className="text-sm font-medium mb-2">Payment Details</div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white border border-gray-200 rounded-lg p-3">
                                                                    <div>
                                                                        <span className="text-gray-600">Total Paid:</span>{" "}
                                                                        <span className="font-semibold">${order.paymentInfo.totalPaid.toFixed(2)}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Customer Paid:</span>{" "}
                                                                        <span className="font-semibold">${order.paymentInfo.customerPaid.toFixed(2)}</span>
                                                                    </div>
                                                                    {order.paymentInfo.return > 0 && (
                                                                        <div className="text-orange-600">
                                                                            <span className="text-gray-600">Return:</span>{" "}
                                                                            <span className="font-semibold">${order.paymentInfo.return.toFixed(2)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="mt-3">
                                                                    <div className="text-sm font-medium mb-2">Payment Methods</div>
                                                                    {order.paymentInfo.payments.map((p, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="flex justify-between items-center border border-gray-200 rounded-lg p-2 mb-2"
                                                                        >
                                                                            <span>{getPaymentMethodIcon(p.typeName)}</span>
                                                                            <span>{p.typeName}</span>
                                                                            <span className="font-semibold">${p.amount.toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-600">No new customers found in this period.</p>
                    )}
                </section>

            </div>
        </div>
    );
}

export default NewVsRepeatCustomers;
