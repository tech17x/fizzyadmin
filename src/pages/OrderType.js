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
import { Type, Plus } from 'lucide-react';
import HeadingText from '../components/HeadingText';

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

    const filteredData = useFilteredData({
        data: orderTypes,
        searchTerm: search,
        searchKeys: ["name", "category", "brand_id.full_name", "outlet_id.name"],
        filters: { status: status },
    });

    return (
        <>
            {loading && <Loader />}

            {showPopup && (
                <div className='card'>
                    <HeadingText title={`${isEditing ? "Edit" : "Add"} Order Type`} />
                    <div className="inputs-container">
                        <div className="inputs-row">
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
                                placeholder={!selectedBrand ? "Select brand first" : "Select outlet"}
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <SelectInput
                                label="Category"
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
                                placeholder="Enter name"
                                required
                            />
                        </div>
                        {isEditing && (
                            <div className="checkbox-container">
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
                    <div className="action-btns-container">
                        <GradientButton clickAction={handleSave}>
                            {isEditing ? 'Update' : 'Create'}
                        </GradientButton>
                        <Button clickAction={() => setShowPopup(false)}>Close</Button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <TopBar
                    title="Order Type Management"
                    searchText={search}
                    setSearchText={setSearch}
                    selectedFilter={status}
                    setSelectedFilter={setStatus}
                />
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Order Types ({orderTypes.length})</h2>
                            <p className="text-gray-600">Configure order categories</p>
                        </div>
                        <GradientButton clickAction={handleAdd}>
                            <Plus className="w-4 h-4" />
                            Add Order Type
                        </GradientButton>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((type) => (
                                    <tr key={type._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary-gradient rounded-lg flex items-center justify-center">
                                                    <Type className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-light text-primary-orange">
                                                {type.category.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {type.brand_id?.full_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {type.outlet_id?.name || "All Outlets"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                type.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {type.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(type)}
                                                className="text-primary-orange hover:text-orange-700"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderType;