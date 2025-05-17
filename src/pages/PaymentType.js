// src/pages/PaymentType.js

import { useCallback, useContext, useEffect, useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import InputField from '../components/InputField';
import './Brand.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import SelectInput from '../components/SelectInput';
import { toast } from 'react-toastify';
import axios from 'axios';
import useFilteredData from '../hooks/filterData';
import Loader from '../components/Loader';
import TopBar from '../components/TopBar';
import HeadingText from '../components/HeadingText';
import AuthContext from '../context/AuthContext';

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
            outlet_id: ''
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
        // Front-end validation
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

        // Uniqueness check
        const isDuplicate = (field) => {
            return paymentTypes?.some((type) => {
                return (
                    type.outlet_id._id === selectedOutlet?.value &&
                    type[field]?.trim().toLowerCase() === paymentInfo[field]?.trim().toLowerCase() &&
                    type._id !== paymentInfo._id // exclude self if editing
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


    const filteredData = useFilteredData({
        data: paymentTypes,
        searchTerm: search,
        searchKeys: ["name", "brand_id.full_name", "outlet_id.name"],
        filters: {
            status: status,
        },
    });

    return (
        <>
            {
                loading && <Loader />
            }

            {showPopup ? (
                <div className='card' >
                    <HeadingText title={`${isEditing ? "Edit" : "Add"} Payment Type`} />
                    <div className="inputs-container">
                        <div className="inputs-row">
                            <SelectInput
                                label="Select Brand"
                                selectedOption={selectedBrand}
                                onChange={handleBrandSelection}
                                options={brands.map(o=>({label: o.full_name, value : o._id}))}
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
                            <InputField
                                label="Payment Name"
                                name="name"
                                type="text"
                                value={paymentInfo.name}
                                onChange={handleInputChange}
                                placeholder="Enter payment type name"
                            />
                        </div>
                        <div className="checkbox-container">
                            {isEditing && (
                                <Checkbox
                                    label="Active"
                                    checked={paymentInfo.status === 'active'}
                                    onChange={() =>
                                        setPaymentInfo(prev => ({
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
                </div>
            ) :
                <div className="payment-type-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <TopBar
                        title="Paymnent Type"
                        searchText={search}
                        setSearchText={setSearch}
                        selectedFilter={status}
                        setSelectedFilter={setStatus}
                    />
                    <div className="cards-container card">
                        {
                            filteredData.map(type => (
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
                </div>
            }
        </>
    );
};

export default PaymentType;
