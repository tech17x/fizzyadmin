// src/pages/PaymentType.js

import { useEffect, useState } from 'react';
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

const PaymentType = () => {
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [applyOnAllOutlets, setApplyOnAllOutlets] = useState(false);

    const [paymentInfo, setPaymentInfo] = useState({
        _id: '',
        payment_name: '',
        status: 'active',
        apply_on_all_outlets: false,
        brand_id: '',
        outlet_id: ''
    });

    useEffect(() => {
        fetchPaymentTypes();
    }, []);

    const fetchPaymentTypes = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/payment-type/accessible", {
                withCredentials: true,
            });
            setPaymentTypes(res.data.paymentTypes || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to fetch payment types");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsEditing(false);
        setPaymentInfo({
            _id: '',
            payment_name: '',
            status: 'active',
            apply_on_all_outlets: false,
            brand_id: '',
            outlet_id: ''
        });
        setFilteredOutlets([]);
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setApplyOnAllOutlets(false);
        setShowPopup(true);
    };

    const handleEdit = (type) => {
        setIsEditing(true);
        const brand = brands.find(b => b._id === type.brand_id?._id);
        const outletOptions = outlets.filter(outlet => outlet.brand_id === brand?._id);
        const outlet = outlets.find(outlet => outlet._id === type.outlet_id?._id);

        setPaymentInfo({
            _id: type._id,
            payment_name: type.payment_name,
            status: type.status,
            apply_on_all_outlets: type.apply_on_all_outlets,
            brand_id: type.brand_id?._id || '',
            outlet_id: type.outlet_id?._id || ''
        });
        setSelectedBrand(brand);
        setFilteredOutlets(outletOptions);
        setSelectedOutlet(outlet ? { label: outlet.name, value: outlet._id } : null);
        setApplyOnAllOutlets(type.apply_on_all_outlets);
        setShowPopup(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter(outlet => outlet.brand_id === brand._id);
        setFilteredOutlets(filtered);
        if (filtered.length === 0) {
            toast.error("Selected brand has no outlets.");
            setApplyOnAllOutlets(false);
        }
    };

    const handleSave = async () => {
        const payload = {
            payment_name: paymentInfo.payment_name,
            status: paymentInfo.status,
            apply_on_all_outlets: applyOnAllOutlets,
            brand_id: selectedBrand?._id || '',
            outlet_id: (selectedOutlet && !applyOnAllOutlets) ? selectedOutlet.value : null
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5001/api/payment-type/update/${paymentInfo._id}`, payload, {
                    withCredentials: true,
                });
                toast.success("Payment type updated successfully!");
            } else {
                await axios.post("http://localhost:5001/api/payment-type/create", payload, {
                    withCredentials: true,
                });
                toast.success("Payment type created successfully!");
            }
            fetchPaymentTypes();
            setShowPopup(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save payment type");
        }
    };

    const filteredPaymentTypes = paymentTypes.filter((type) => {
        const searchLower = search.toLowerCase();
        const statusLower = status.toLowerCase();
        const matchesSearch = (
            type.payment_name?.toLowerCase().includes(searchLower) ||
            type.brand_id?.name?.toLowerCase().includes(searchLower) ||
            type.brand_id?.short_name?.toLowerCase().includes(searchLower) ||
            type.outlet_id?.name?.toLowerCase().includes(searchLower)
        );
        const matchesStatus = !status || type.status.toLowerCase() === statusLower;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <HeadingText>Payment Type</HeadingText>
            <SearchFilterBar
                placeholder="Search Brand, Outlet, Payment Type..."
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={status}
                onStatusChange={setStatus}
            />
            <div className="cards-container">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    filteredPaymentTypes.map(type => (
                        <EditCard
                            key={type._id}
                            title={type.payment_name}
                            role={type.outlet_id?.name || "All Outlets"}
                            status={type.status}
                            handleEdit={() => handleEdit(type)}
                        />
                    ))
                )}
                <CardAdd handleAdd={handleAdd} />
            </div>

            {showPopup && (
                <Popup title="Payment Type" closePopup={() => setShowPopup(false)}>
                    <div className="inputs-container">
                        <SelectInput
                            label="Select Brand"
                            selectedOption={selectedBrand}
                            onChange={handleBrandSelection}
                            options={brands}
                        />
                        <InputField
                            label="Payment Name"
                            name="payment_name"
                            type="text"
                            value={paymentInfo.payment_name}
                            onChange={handleInputChange}
                            placeholder="Enter payment type name"
                        />
                        <SelectInput
                            disable={applyOnAllOutlets || !selectedBrand || filteredOutlets.length === 0}
                            label="Outlet"
                            selectedOption={selectedOutlet}
                            onChange={setSelectedOutlet}
                            options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                            placeholder={
                                !selectedBrand
                                    ? "Select a brand first"
                                    : applyOnAllOutlets
                                        ? "Disabled (All outlets)"
                                        : "Select outlet"
                            }
                        />
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
                            <Checkbox
                                label="Apply on all outlets"
                                checked={applyOnAllOutlets}
                                disable={filteredOutlets.length === 0}
                                onChange={() => setApplyOnAllOutlets(!applyOnAllOutlets)}
                            />
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

export default PaymentType;
