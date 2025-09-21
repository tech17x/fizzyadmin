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
import { Type, Building, Store, Plus, ShoppingCart, Truck, Coffee, Users } from 'lucide-react';

const category = [
    { label: "Pickup", value: "pickup" },
    { label: "Dine-in", value: "dine-in" },
    { label: "Quick Service", value: "quick-service" },
    { label: "Delivery", value: "delivery" },
    { label: "Third Party", value: "third-party" },
];

const OrderType = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);

    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [orderTypes, setOrderTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [orderTypeInfo, setOrderTypeInfo] = useState({
        _id: '',
        name: '',
        category: '',
        status: 'active',
        brand_id: '',
        outlet_id: '',
    });

    useEffect(() => {
        if (staff.permissions?.includes('order_type_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    const fetchOrderTypes = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/order-type/accessible`, {
                withCredentials: true,
            });
            setOrderTypes(response.data?.orderTypes || []);
        } catch (error) {
            console.error("Error fetching order types:", error);
            toast.error(error?.response?.data?.message || "Failed to fetch order types");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchOrderTypes();
    }, [fetchOrderTypes]);

    const handleAdd = () => {
        setIsEditing(false);
        setOrderTypeInfo({
            _id: '',
            name: '',
            category: '',
            status: 'active',
            brand_id: '',
            outlet_id: '',
        });
        setFilteredOutlets([]);
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setSelectedCategory(null);
        setShowPopup(true);
    };

    const handleEdit = (type) => {
        setIsEditing(true);
        const brand = brands.find(b => b._id === type.brand_id?._id);
        const outletOptions = outlets.filter(outlet => outlet.brand_id === brand?._id);
        const outlet = outlets.find(outlet => outlet._id === type.outlet_id?._id);
        const categoryOption = category.find(cat => cat.value === type.category);

        setOrderTypeInfo({
            _id: type._id,
            name: type.name,
            status: type.status,
            brand_id: type.brand_id?._id || '',
            outlet_id: type.outlet_id?._id || '',
        });
        setSelectedBrand({ label: brand.full_name, value: brand._id });
        setFilteredOutlets(outletOptions);
        setSelectedOutlet(outlet ? { label: outlet.name, value: outlet._id } : null);
        setSelectedCategory(categoryOption);
        setShowPopup(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderTypeInfo(prev => ({ ...prev, [name]: value }));
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
        setLoading(true);
        
        if (!orderTypeInfo.name || orderTypeInfo.name.trim().length < 3) {
            toast.error("Name must be at least 3 characters long.");
            setLoading(false);
            return;
        }
        if (orderTypeInfo.name.trim().length > 50) {
            toast.error("Name cannot exceed 50 characters.");
            setLoading(false);
            return;
        }
        if (!selectedCategory?.value) {
            toast.error("Please select a category.");
            setLoading(false);
            return;
        }
        if (!orderTypeInfo.status) {
            toast.error("Please select a status.");
            setLoading(false);
            return;
        }
        if (!selectedBrand?.value) {
            toast.error("Please select a brand.");
            setLoading(false);
            return;
        }
        if (!selectedOutlet?.value) {
            toast.error("Please select an outlet.");
            setLoading(false);
            return;
        }

        const isDuplicate = (field) => {
            return orderTypes?.some((type) => {
                return (
                    type.outlet_id._id === selectedOutlet?.value &&
                    type[field]?.trim().toLowerCase() === (orderTypeInfo[field]?.trim().toLowerCase() || selectedCategory.value) &&
                    type._id !== orderTypeInfo._id
                );
            });
        };

        if (selectedCategory?.value !== "third-party" && isDuplicate("category")) {
            toast.error("Category already exists for this outlet.");
            setLoading(false);
            return;
        }

        if (orderTypeInfo.name && isDuplicate("name")) {
            toast.error("Name already exists for this brand.");
            setLoading(false);
            return;
        }

        const payload = {
            name: orderTypeInfo.name.trim(),
            category: selectedCategory.value,
            status: orderTypeInfo.status,
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
        };

        try {
            if (isEditing) {
                const response = await axios.put(`${API}/api/order-type/update/${orderTypeInfo._id}`, payload, {
                    withCredentials: true,
                });
                const updatedType = response.data.orderType;
                setOrderTypes((prev) =>
                    prev.map((type) => (type._id === orderTypeInfo._id ? updatedType : type))
                );
                toast.success("Order type updated successfully!");
            } else {
                const response = await axios.post(`${API}/api/order-type/create`, payload, {
                    withCredentials: true,
                });
                setOrderTypes((prev) => [...prev, response.data.orderType]);
                toast.success("Order type created successfully!");
            }
            setShowPopup(false);
        } catch (error) {
            console.error("Error saving order type:", error);
            toast.error(error?.response?.data?.message || "Failed to save order type");
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (categoryValue) => {
        switch (categoryValue) {
            case 'pickup': return Coffee;
            case 'dine-in': return Users;
            case 'delivery': return Truck;
            case 'quick-service': return ShoppingCart;
            default: return Type;
        }
    };

    const filteredData = useFilteredData({
        data: orderTypes,
        searchTerm: search,
        searchKeys: ["name", "category", "brand_id.full_name", "outlet_id.name"],
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
                                    <Type className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {isEditing ? "Edit Order Type" : "Create Order Type"}
                                    </h2>
                                    <p className="text-orange-100">Configure order type settings</p>
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
                                        options={brands.map(o => ({ label: o.full_name, value: o._id }))}
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
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectInput
                                        label="Order Category"
                                        selectedOption={selectedCategory}
                                        onChange={setSelectedCategory}
                                        options={category}
                                        required
                                    />
                                    <InputField
                                        label="Order Type Name"
                                        name="name"
                                        type="text"
                                        value={orderTypeInfo.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter order type name"
                                        required
                                    />
                                </div>

                                {isEditing && (
                                    <div className="p-6 bg-gray-50 rounded-xl">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Settings</h3>
                                        <Checkbox
                                            label="Active Status"
                                            checked={orderTypeInfo.status === 'active'}
                                            onChange={() =>
                                                setOrderTypeInfo(prev => ({
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
                                    {isEditing ? 'Update Order Type' : 'Create Order Type'}
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <TopBar
                        title="Order Type Management"
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
                                    <Type className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Order Types</p>
                                    <p className="text-2xl font-bold text-gray-900">{orderTypes.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Type className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Types</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {orderTypes.filter(o => o.status === 'active').length}
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
                                    <p className="text-sm text-gray-600">Categories</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Set(orderTypes.map(o => o.category)).size}
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
                                        {new Set(orderTypes.map(o => o.outlet_id?._id)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Types Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order Types</h2>
                                <p className="text-gray-600">Configure different order categories</p>
                            </div>
                            <GradientButton clickAction={handleAdd}>
                                <Plus className="w-4 h-4" />
                                Add Order Type
                            </GradientButton>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredData.map((type) => {
                                const IconComponent = getCategoryIcon(type.category);
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
                                                            <p className="text-sm text-orange-600 font-medium capitalize">
                                                                {type.category.replace('-', ' ')}
                                                            </p>
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
                                                        Edit Order Type
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
                                        Add Order Type
                                    </span>
                                    <span className="text-sm text-gray-400 mt-2">Click to create new order type</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderType;