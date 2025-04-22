// src/pages/OrderType.js

import { useCallback, useEffect, useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import HeadingText from '../components/HeadingText';
import InputField from '../components/InputField';
import Popup from '../components/Popup';
import './Brand.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import SelectInput from '../components/SelectInput';
import SearchFilterBar from '../components/SearchFilterBar';
import { toast } from 'react-toastify';
import axios from 'axios';
import useFetchBrands from '../hooks/useFetchBrands';
import useFetchOutlets from '../hooks/useFetchOutlets';
import useFilteredData from '../hooks/filterData';
import Loader from '../components/Loader';

const category = [
    { label: "Pickup", value: "pickup" },
    { label: "Dine-in", value: "dine-in" },
    { label: "Quick Service", value: "quick-service" },
    { label: "Delivery", value: "delivery" },
    { label: "Third Party", value: "third-party" },
];

const OrderType = () => {
    const API = process.env.REACT_APP_API_URL;
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();

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
        setSelectedBrand(brand);
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
        const filtered = outlets.filter(outlet => outlet.brand_id === brand._id);
        setFilteredOutlets(filtered);
        if (filtered.length === 0) {
            toast.error("Selected brand has no outlets.");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        // Front-end Validation
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
        if (!selectedBrand?._id) {
            toast.error("Please select a brand.");
            setLoading(false);
            return;
        }
        if (!selectedOutlet?.value) {
            toast.error("Please select an outlet.");
            setLoading(false);
            return;
        }

        // Uniqueness check
        const isDuplicate = (field) => {
            return orderTypes?.some((type) => {
                return (
                    type.brand_id._id === selectedBrand?._id &&
                    type[field]?.trim().toLowerCase() === orderTypeInfo[field]?.trim().toLowerCase() &&
                    type._id !== orderTypeInfo._id // exclude self if editing
                );
            });
        };

        console.log(isDuplicate('name'));

        if (orderTypeInfo.name && isDuplicate("name")) {
            toast.error("Name already exists for this brand.");
            setLoading(false);
            return;
        }



        const payload = {
            name: orderTypeInfo.name.trim(),
            category: selectedCategory.value,
            status: orderTypeInfo.status,
            brand_id: selectedBrand._id,
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


    return (
        <>
            {
                loading && <Loader />
            }
            <HeadingText>Order Type</HeadingText>
            <SearchFilterBar
                placeholder="Search Brand, Outlet, Order Type..."
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={status}
                onStatusChange={setStatus}
            />
            <div className="cards-container">
                {
                    useFilteredData({
                        data: orderTypes,
                        searchTerm: search,
                        searchKeys: ["name", "category", "brand_id.full_name", "outlet_id.name"],
                        filters: {
                            status: status,
                        },
                    }).map(type => (
                        <EditCard
                            key={type._id}
                            title={type.name}
                            role={type.outlet_id?.name || "All Outlets"}
                            status={type.status}
                            handleEdit={() => handleEdit(type)}
                        />
                    ))
                }
                <CardAdd handleAdd={handleAdd} />
            </div>

            {showPopup && (
                <Popup title={`${isEditing ? 'Edit' : "Add"} Order Type`} closePopup={() => setShowPopup(false)}>
                    <div className="inputs-container">
                        <div className="inputs-row">
                            <SelectInput
                                label="Select Brand"
                                selectedOption={selectedBrand}
                                onChange={handleBrandSelection}
                                options={brands}
                            />
                            <SelectInput
                                disable={filteredOutlets.length === 0}
                                label="Outlet"
                                selectedOption={selectedOutlet}
                                onChange={setSelectedOutlet}
                                options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                                placeholder={
                                    !selectedBrand
                                        ? "Select a brand first"
                                        : "Select outlet"
                                }
                            />
                        </div>
                        <div className="inputs-row">
                            <SelectInput
                                label="Category"
                                selectedOption={selectedCategory}
                                onChange={setSelectedCategory}
                                options={category}
                            />
                            <InputField
                                label="Type Name"
                                name="name"
                                type="text"
                                value={orderTypeInfo.name}
                                onChange={handleInputChange}
                                placeholder="Enter Order Type name"
                            />
                        </div>
                        <div className="checkbox-container">
                            {isEditing && (
                                <Checkbox
                                    label="Active"
                                    checked={orderTypeInfo.status === 'active'}
                                    onChange={() =>
                                        setOrderTypeInfo(prev => ({
                                            ...prev,
                                            status: prev.status === 'active' ? 'inactive' : 'active',
                                        }))
                                    }
                                />
                            )}
                        </div>
                    </div>
                    <div className="action-btns-container">
                        <GradientButton clickAction={handleSave}>
                            {isEditing ? 'Update' : 'Create'}
                        </GradientButton>
                        <Button clickAction={() => setShowPopup(false)}>Close</Button>
                    </div>
                </Popup>
            )}
        </>
    );
};

export default OrderType;
