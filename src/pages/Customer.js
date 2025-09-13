
import { useCallback, useContext, useEffect, useState } from 'react';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import './Tax.css';
import './Discount.css';
import '../components/TableStyles.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import InputField from '../components/InputField';
import Checkbox from '../components/Checkbox';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import SMSPortal from '../components/SMSPortal';
import TopBar from '../components/TopBar';
import HeadingText from '../components/HeadingText';
import AuthContext from '../context/AuthContext';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { countryOptions, countryCodeOptions } from '../constants/countryOptions';

const Customer = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [data, setData] = useState([]);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [filteredOutlets, setFilteredOutlets] = useState([]);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [dataId, setDataId] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [anniversary, setAnniversary] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [status, setStatus] = useState(false);
    const [orderHistory, setOrderHistory] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedFile, setSelectedFile] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('Select file');

    const [showBrandSelectionForBulkInsertion, setShowBrandSelectionForBulkInsertion] = useState(false)
    const [bulkData, setBulkData] = useState([]);

    const [showSMSModel, setShowSMSModel] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [phone, setPhone] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodeOptions[1]);

    const [selectedCountry, setSelectedCountry] = useState(countryOptions[1]);

    const [orderSummaryPopup, setOrderSummaryPopup] = useState(false);
    const [orderStats, setOrderStats] = useState(null);

    useEffect(() => {
        if (staff.permissions?.includes('customers_view')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    // ✅ Fetch staff floors
    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/customers/accessible`, {
                withCredentials: true,
            });
            setData(response.data.customers || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch floors.");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchCustomerOrders = async (customer) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/api/customers/${customer._id}/orders`, {
                withCredentials: true,
            });
            const orders = response.data.orders || [];
            const stats = processOrderStats(orders);
            setOrderStats(stats);
            setSelectedCustomer(customer);
            setOrderSummaryPopup(true); // Show summary popup
        } catch (error) {
            toast.error("Failed to fetch order history.");
        } finally {
            setLoading(false);
        }
    };

    const processOrderStats = (orders) => {
        if (!Array.isArray(orders) || orders.length === 0) {
            return {
                totalOrders: 0,
                totalRevenue: 0,
                lastVisitedOn: "NA",
                averageOrderValue: 0,
                ordersPerMonth: "NA",
                mostLovedItem: "NA",
                recentOrders: [], // <--- Always return an array!
            };
        }

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.summary?.total || order.paymentInfo?.orderTotal || 0), 0);

        // Last Visited
        const lastOrder = orders.slice().sort((a, b) => new Date(b.orderDayAt) - new Date(a.orderDayAt))[0];
        const lastVisitedOn = lastOrder ? new Date(lastOrder.orderDayAt).toLocaleString() : "NA";

        // Average Order Value
        const averageOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;

        // Orders per month
        const sorted = orders.slice().sort((a, b) => new Date(a.orderDayAt) - new Date(b.orderDayAt));
        const firstOrderDate = sorted[0] ? new Date(sorted[0].orderDayAt) : null;
        const lastOrderDate = sorted[sorted.length - 1] ? new Date(sorted[sorted.length - 1].orderDayAt) : null;
        let months = 1;
        if (firstOrderDate && lastOrderDate) {
            months = Math.max(1, ((lastOrderDate - firstOrderDate) / (1000 * 60 * 60 * 24 * 30)));
        }
        const ordersPerMonth = (totalOrders / months).toFixed(1);

        // Most Loved Item
        const itemFrequency = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                itemFrequency[item.name] = (itemFrequency[item.name] || 0) + item.quantity;
            });
        });
        const mostLovedItem = Object.entries(itemFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "NA";

        // Recent Orders
        const recentOrders = orders.slice().sort((a, b) => new Date(b.orderDayAt) - new Date(a.orderDayAt)).slice(0, 5).map(order => ({
            order_id: order.order_id,
            date: new Date(order.orderDayAt).toLocaleString(),
            status: order.status,
            total: order.summary?.total || order.paymentInfo?.orderTotal || 0,
            itemsSummary: (order.items || []).map(i => `${i.name} x${i.quantity}`).join(", "),
            outletName: order.outlet_id?.name || "NA"
        }));

        return {
            totalOrders,
            totalRevenue: totalRevenue.toFixed(2),
            lastVisitedOn,
            averageOrderValue,
            ordersPerMonth,
            mostLovedItem,
            recentOrders
        };
    };


    const handleAddData = () => {
        setLoading(true);
        setIsEditing(false);
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setName('');
        setEmail('');
        setPhone('');
        setDob('');
        setAnniversary('');
        setStreet('');
        setCity('');
        setState('');
        setZip('');
        setSelectedCountryCode(countryCodeOptions[1])
        setSelectedCountry(countryCodeOptions[1]);
        setStatus(true);
        setOrderHistory([]);
        setShowPopup(true);
        setLoading(false);
    }

    const handleEdit = async (data) => {
        console.log(data)
        setLoading(true);
        setIsEditing(true);
        setDataId(data._id);

        const selectedBrand = brands.find(brand => brand._id === (data.brand_id?._id || data.brand_id));
        // Step 1: Handle Brand First

        if (selectedBrand) {
            handleBrandSelection({ label: selectedBrand.full_name, value: selectedBrand._id });
        }

        // Step 2: Now select Outlet
        const selectedOutlet = outlets.find(outlet => outlet._id === data.outlet_id?._id);
        if (selectedOutlet) {
            handleOutletSelection({
                label: selectedOutlet.name,
                value: selectedOutlet._id,
            });
        } else {
            handleOutletSelection(null);
        }
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setDob(data.dob);
        setAnniversary(data.anniversary_date);
        setStreet(data.address.street);
        setCity(data.address.city);
        setState(data.address.state);
        setZip(data.address.zip);
        setSelectedCountryCode(countryCodeOptions.find(i => i.value === data.country_code));
        setSelectedCountry(countryOptions.find(i => i.value === data?.address?.country.toLowerCase()));
        setStatus(data.status === "active" ? true : false);
        setOrderHistory(data.order_history);
        setShowPopup(true);
        setLoading(false);
    }


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
        if (outlet) {
            setSelectedOutlet(outlet);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            "brand_id": selectedBrand?.value,
            "outlet_id": selectedOutlet?.value,
            "name": name,
            "email": email,
            "country_code": selectedCountryCode.value,
            "phone": phone,
            "dob": dob,
            "anniversary_date": anniversary,
            "address": {
                "street": street,
                "city": city,
                "state": state,
                "zip": zip,
                "country": selectedCountry.value
            },
            "order_history": orderHistory,
            "status": status ? "active" : "inactive"
        }

        if (!selectedBrand || !name) {
            toast.error("Please fill all required fields.");
            setLoading(false);
            return;
        }

        const isDuplicate = (field) => {
            return data?.some((type) => {
                return (
                    type.brand_id._id === selectedBrand?.value &&
                    type[field]?.trim().toLowerCase() === phone?.trim().toLowerCase() &&
                    type._id !== dataId // exclude self if editing
                );
            });
        };

        if (isDuplicate('phone')) {
            toast.error("Phone already exists in this brand.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                // Assuming you're keeping track of the selected tax to edit
                const response = await axios.put(`${API}/api/customers/update/${dataId}`, payload, { withCredentials: true });
                toast.success("Data updated successfully");
                const updated = response.data.customer;
                setData((prev) =>
                    prev.map((customer) => (customer._id === dataId ? updated : customer))
                );
            } else {
                const response = await axios.post(`${API}/api/customers/create`, payload, { withCredentials: true });
                setData((prev) => [...prev, response.data.customer]);
                toast.success("Data added successfully!")
            }
            setShowPopup(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadCustomerSample = () => {
        const sampleCustomerData = [
            ["Sr No", "Name", "Email", "Phone", "Country Code"],
            [1, "John Doe", "john.doe@example.com", "1234567890", "+1"],
            [2, "Jane Smith", "jane.smith@example.com", "9876543210", "+1"],
            [3, "Robert Johnson", "robert.johnson@example.com", "4561237890", "+44"],
            [4, "Emily Davis", "emily.davis@example.com", "7890123456", "+91"],
            [5, "Michael Brown", "michael.brown@example.com", "6547891230", "+61"]
        ];

        const csvContent = sampleCustomerData
            .map((row) => row.map((val) => `"${val}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "customer-sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const handleCustomerFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file.");
            return;
        }

        setSelectedFile(file);
        setSelectedFileName(file.name);
    };

    const handleCustomerUploadClick = async () => {
        if (!selectedFile) {
            toast.warn("Please select a CSV file before uploading.");
            return;
        }

        setSelectedBrand(null);
        setSelectedOutlet(null);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const rows = text
                .split("\n")
                .slice(1)
                .map((line) => line.replace(/"/g, "").split(","))
                .filter((row) => row.length >= 4); // Name, Email, Phone

            if (!rows.length) {
                toast.error("CSV format is invalid or missing required fields.");
                return;
            }

            const parsedCustomers = rows.map((row) => {

                return {
                    name: row[1]?.trim() || "",
                    email: row[2]?.trim() || "",
                    phone: row[3]?.trim() || "", // Default to empty if phone is missing or invalid
                    country_code: row[4]?.trim() || "+1",
                    dob: "",                // Empty by default
                    anniversary_date: "",   // Empty by default
                    address: {},            // Empty by default
                    status: "active",       // Default active
                };
            });

            setBulkData(parsedCustomers);
            setShowBrandSelectionForBulkInsertion(true);
        };
        reader.readAsText(selectedFile);
    };


    const uploadCustomers = async () => {
        if (!selectedBrand) {
            toast.error('Select a brand first');
            return;
        }
        console.log(bulkData);
        try {
            const response = await axios.post(`${API}/api/customers/upsert`, {
                addedCustomers: bulkData,
                brand_id: selectedBrand?.value,
                outlet_id: selectedOutlet?.value,
            }, {
                withCredentials: true
            });

            const data = response.data;

            if (response.status === 200) {
                const { success = [], failed = [] } = data;

                if (success.length > 0) {
                    toast.success(`${success.length} customers uploaded successfully!`);
                }
                if (failed.length > 0) {
                    toast.error(`${failed.length} customers failed to upload!`);

                    // Correct mapping for error and email
                    failed.forEach((item) => {
                        toast.error(`Failed: ${item?.error || 'Unknown reason'} (${item?.data?.email || 'No email'})`);
                    });
                }

                setData((prev) => [...prev, ...success.map(item => item.customer)]);
                setSelectedBrand(null);
                setSelectedOutlet(null);
                setBulkData([]);
                setSelectedFile("");
                setSelectedFileName('Select File');
                setShowBrandSelectionForBulkInsertion(false);
            } else {
                toast.error(data.message || "Upload failed!");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while uploading customers.");
        }
    };


    const hideSMSModel = () => {
        setShowSMSModel(false);
    }

    const handleShowSMSModel = (data) => {
        setSelectedCustomer(data);
        setShowSMSModel(true);
    }

   return (
    <>
        {loading && <Loader />}
        {showPopup ? (
            <div className="card">
                {/* ...popup form code */}
            </div>
        ) : showBrandSelectionForBulkInsertion ? (
            <div className="card">
                {/* ...bulk insertion code */}
            </div>
        ) : showSMSModel ? (
            <SMSPortal hideSMSModel={hideSMSModel} customer={selectedCustomer} />
        ) : orderSummaryPopup ? (
            <div className="order-summary-popup card">
                {/* ...order summary code */}
            </div>
        ) : (
            <div className="space-y-6 animate-fade-in">
                <TopBar
                    title="Customer Management"
                    searchText={search}
                    setSearchText={setSearch}
                    selectedFilter={filterStatus}
                    setSelectedFilter={setFilterStatus}
                />
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Customer Database</h2>
                            <p className="text-gray-600 mt-1">Manage customer information and history</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button 
                                onClick={() => handleAddData()}
                                className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Customer
                            </button>
                            <button 
                                onClick={() => handleDownloadCustomerSample()}
                                className="bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                            >
                                Download Format
                            </button>
                            <div className="file-upload">
                                <label htmlFor="fileInput" className="custom-file-label">
                                    <span className="file-name">{selectedFileName}</span>
                                    <span className="browse-btn">Select CSV</span>
                                </label>
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden-file-input"
                                    onChange={handleCustomerFileChange}
                                />
                                <button 
                                    onClick={handleCustomerUploadClick}
                                    className="bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                >
                                    Upload CSV
                                </button>
                            </div> {/* ✅ file-upload closed properly */}
                        </div> {/* ✅ flex container closed */}
                    </div> {/* ✅ header container closed */}

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr No</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Birthdate</th>
                                    <th>Outlet Name</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.email}</td>
                                        <td>{item.dob || "NA"}</td>
                                        <td>{item?.outlet_id?.name || "NA"}</td>
                                        <td><div className={`status ${item.status}`}>{item.status}</div></td>
                                        <td>
                                            <div className="tax-action-btns">
                                                <button onClick={() => handleEdit(item)}>
                                                    <svg width="14" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        {/* ...icon path */}
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> {/* ✅ table-container closed */}
                </div> {/* ✅ main card closed */}
            </div>
        )}
    </>
);}


export default Customer;
