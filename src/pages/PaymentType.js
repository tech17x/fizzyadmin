import { useCallback, useContext, useEffect, useState } from 'react';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import SelectInput from '../components/SelectInput';
import { toast } from 'react-toastify';
import axios from 'axios';
import useFilteredData from '../hooks/filterData';
import Loader from '../components/Loader';
import TopBar from '../components/TopBar';
import AuthContext from '../context/AuthContext';
import { CreditCard, Building, Store, Plus, DollarSign, Wallet, Smartphone } from 'lucide-react';

const PaymentType = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);

    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    const [paymentInfo, setPaymentInfo] = useState({
        _id: '',
        name: '',
        status: 'active',
        brand_id: '',
        outlet_id: ''
    });

    useEffect(() => {
        if (staff.permissions?.includes('payment_type_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    const fetchPaymentTypes = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/payment-type/accessible`, {
                withCredentials: true,
            });
            setPaymentTypes(res.data?.paymentTypes || []);
        } catch (err) {
            console.error("Error fetching payment types:", err);
            toast.error(err?.response?.data?.message || "Failed to fetch payment types");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchPaymentTypes();
    }, [fetchPaymentTypes]);

    const handleAdd = () => {
        setIsEditing(false);
        setPaymentInfo({
            _id: '',
            name: '',
            status: 'active',
            brand_id: '',
            outlet_id: '',
        });
        setFilteredOutlets([]);
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setShowPopup(true);
    };

    const handleEdit = (type) => {
        setIsEditing(true);
        const brand = brands.find(b => b._id === type.brand_id?._id);
        const outletOptions = outlets.filter(outlet => outlet.brand_id === brand?._id);
        const outlet = outlets.find(outlet => outlet._id === type.outlet_id?._id);

        setPaymentInfo({
            _id: type._id,
            name: type.name,
            status: type.status,
            brand_id: type.brand_id?._id || '',
            outlet_id: type.outlet_id?._id || ''
        });
        setSelectedBrand({label: brand.full_name, value : brand._id});
        setFilteredOutlets(outletOptions);
        setSelectedOutlet(outlet ? { label: outlet.name, value: outlet._id } : null);
        setShowPopup(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter(outlet => outlet.brand_id === brand.value);
        setFilteredOutlets(filtered);
        if (filtered.length === 0) {
            toast.error("Selected brand has no outlets.");
        }
    };

    const handleSave = async () => {
        if (!paymentInfo.name || paymentInfo.name.trim().length < 3) {
            toast.error("Payment name must be at least 3 characters long.");
            return;
        }
        if (paymentInfo.name.trim().length > 50) {
            toast.error("Payment name cannot exceed 50 characters.");
            return;
        }
        if (!paymentInfo.status) {
            toast.error("Please select a status.");
            return;
        }
        if (!selectedBrand?.value) {
            toast.error("Please select a brand.");
            return;
        }
        if (!selectedOutlet?.value) {
            toast.error("Please select an outlet.");
            return;
        }

        const isDuplicate = (field) => {
            return paymentTypes?.some((type) => {
                return (
                    type.outlet_id._id === selectedOutlet?.value &&
                    type[field]?.trim().toLowerCase() === paymentInfo[field]?.trim().toLowerCase() &&
                    type._id !== paymentInfo._id
                );
            });
        };

        if (paymentInfo.name && isDuplicate("name")) {
            toast.error("Name already exists for this Outlet.");
            setLoading(false);
            return;
        }

        setLoading(true);
        const payload = {
            name: paymentInfo.name.trim(),
            status: paymentInfo.status,
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
        };

        try {
            if (isEditing) {
                await axios.put(`${API}/api/payment-type/update/${paymentInfo._id}`, payload, {
                    withCredentials: true,
                });
                toast.success("Payment type updated successfully!");
            } else {
                await axios.post(`${API}/api/payment-type/create`, payload, {
                    withCredentials: true,
                });
                toast.success("Payment type created successfully!");
            }
            fetchPaymentTypes();
            setShowPopup(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save payment type");
        } finally {
            setLoading(false);
        }
    };

    const getPaymentIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('card') || lowerName.includes('credit') || lowerName.includes('debit')) {
            return CreditCard;
        } else if (lowerName.includes('cash')) {
            return DollarSign;
        } else if (lowerName.includes('upi') || lowerName.includes('digital') || lowerName.includes('mobile')) {
            return Smartphone;
        }
        return Wallet;
    };

    const filteredData = useFilteredData({
        data: paymentTypes,
        searchTerm: search,
        searchKeys: ["name", "brand_id.full_name", "outlet_id.name"],
        filters: { status: status },
    });

    return (
        <>
            {loading && <Loader />}

            {showPopup ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {isEditing ? "Edit Payment Type" : "Create Payment Type"}
                                    </h2>
                                    <p className="text-orange-100">Configure payment method settings</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectInput
                                        label="Select Brand"
                                        selectedOption={selectedBrand}
                                        onChange={handleBrandSelection}
                                        options={brands.map(o=>({label: o.full_name, value : o._id}))}
                                        required
                                    />
                                    <SelectInput
                                        disable={filteredOutlets.length === 0}
                                        label="Select Outlet"
                                        selectedOption={selectedOutlet}
                                        onChange={setSelectedOutlet}
                                        options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                                        placeholder={!selectedBrand ? "Select a brand first" : "Select outlet"}
                                        required
                                    />
                                </div>
                                
                                <InputField
                                    label="Payment Method Name"
                                    name="name"
                                    type="text"
                                    value={paymentInfo.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter payment type name (e.g., Cash, Credit Card, UPI)"
                                    required
                                />

                                {isEditing && (
                                    <div className="p-6 bg-gray-50 rounded-xl">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Settings</h3>
                                        <Checkbox
                                            label="Active Status"
                                            checked={paymentInfo.status === 'active'}
                                            onChange={() =>
                                                setPaymentInfo(prev => ({
                                                    ...prev,
                                                    status: prev.status === 'active' ? 'inactive' : 'active',
                                                }))
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
                                <Button clickAction={() => setShowPopup(false)}>
                                    Cancel
                                </Button>
                                <GradientButton clickAction={handleSave}>
                                    {isEditing ? 'Update Payment Type' : 'Create Payment Type'}
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <TopBar
                        title="Payment Type Management"
                        searchText={search}
                        setSearchText={setSearch}
                        selectedFilter={status}
                        setSelectedFilter={setStatus}
                    />
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Payment Types</p>
                                    <p className="text-2xl font-bold text-gray-900">{paymentTypes.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Methods</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {paymentTypes.filter(p => p.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Building className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Brands</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Set(paymentTypes.map(p => p.brand_id?._id)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Store className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Outlets</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Set(paymentTypes.map(p => p.outlet_id?._id)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Types Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                                <p className="text-gray-600">Configure accepted payment methods</p>
                            </div>
                            <GradientButton clickAction={handleAdd}>
                                <Plus className="w-4 h-4" />
                                Add Payment Type
                            </GradientButton>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredData.map((type) => {
                                const IconComponent = getPaymentIcon(type.name);
                                return (
                                    <div key={type._id} className="group">
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-300">
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            <IconComponent className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                                                            <p className="text-sm text-orange-600 font-medium">Payment Method</p>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        type.status === 'active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {type.status.charAt(0).toUpperCase() + type.status.slice(1)}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate">{type.brand_id?.full_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Store className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate">{type.outlet_id?.name || "All Outlets"}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleEdit(type)}
                                                        className="w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                                                    >
                                                        Edit Payment Type
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Add New Card */}
                            <div className="group">
                                <button 
                                    onClick={handleAdd}
                                    className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 flex flex-col items-center justify-center text-center p-6"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold text-gray-600 group-hover:text-orange-600 transition-colors">
                                        Add Payment Type
                                    </span>
                                    <span className="text-sm text-gray-400 mt-2">Click to create new payment method</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentType;