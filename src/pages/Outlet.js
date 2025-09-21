import { useContext, useEffect, useState } from 'react';
import { countryOptions, countryCodeOptions } from '../constants/countryOptions';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import Checkbox from '../components/Checkbox';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../components/Loader';
import useFilteredData from '../hooks/filterData';
import TopBar from '../components/TopBar';
import { timezones } from '../constants/timezoneOptions';
import AuthContext from '../context/AuthContext';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { Store, Clock, MapPin, Mail, Phone, Globe, Settings, Building } from 'lucide-react';

const Outlet = () => {
    const API = process.env.REACT_APP_API_URL;

    const { staff, updateStaff, logout } = useContext(AuthContext);

    const [outlets, setOutlets] = useState([]);
    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredStatus, setFilteredStatus] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [outletCode, setOutletCode] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodeOptions[1]);
    const [timezone, setTimezone] = useState(timezones[5]);
    const [openingTime, setOpeningTime] = useState('');
    const [closingTime, setClosingTime] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countryOptions[1]);
    const [postalCode, setPostalCode] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (staff.permissions?.includes('outlet_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
            setLoading(false);
        } else {
            logout();
        }
    }, [staff, logout]);

    const handleOutletEdit = (outlet) => {
        setIsEditing(true);
        setId(outlet._id);
        const _brandInfo = brands.find(brand => brand._id === outlet.brand_id);
        setSelectedBrand({ label: _brandInfo.full_name, value: _brandInfo._id });
        setName(outlet.name);
        setOutletCode(outlet.code);
        setPassword("");
        setEmail(outlet.email);
        setPhone(outlet.phone);
        setSelectedCountryCode(countryCodeOptions.find(opt => opt.value === outlet.country_code) || null);
        setTimezone(outlet.timezone);
        setOpeningTime(outlet.opening_time);
        setClosingTime(outlet.closing_time);
        setWebsite(outlet.website || '');
        setAddress(outlet.street);
        setCity(outlet.city);
        setState(outlet.state);
        setSelectedCountry(countryOptions.find(opt => opt.label.toLowerCase() === outlet.country.toLowerCase()) || null);
        setPostalCode(outlet.postal_code || '');
        setStatus(outlet.status === "active" ? true : false);
        setShowPopup(true);
    };

    const handleAddNewOutlet = async () => {
        setIsEditing(false);
        setId('');
        setName('');
        setOutletCode('');
        setPassword('');
        setEmail('');
        setPhone('');
        setSelectedCountryCode(countryCodeOptions[1]);
        setTimezone(timezones[5]);
        setOpeningTime('');
        setClosingTime('');
        setWebsite('');
        setAddress('');
        setCity('');
        setState('');
        setSelectedCountry(countryOptions[1]);
        setPostalCode('');
        setStatus(true);
        setSelectedBrand(null);
        setShowPopup(true);
    };

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            _id: id,
            brand_id: selectedBrand?._id || selectedBrand?.value,
            name,
            code: outletCode,
            password,
            email,
            phone,
            country_code: selectedCountryCode?.value || '',
            timezone,
            opening_time: openingTime,
            closing_time: closingTime,
            website,
            street: address,
            city,
            state,
            country: selectedCountry?.label || '',
            postal_code: postalCode,
            status: status ? "active" : "inactive"
        };

        const errors = validateOutletData(payload);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((msg) => toast.error(msg));
            setTimeout(() => {
                setLoading(false);
            }, 1000);
            return;
        }

        if (isEditing) {
            await updateOutlet(payload);
        } else {
            createOutlet(payload);
        }
    };

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    const validateOutletData = (data) => {
        const errors = {};
        const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!data.brand_id) errors.brand_id = "Brand is required.";
        if (!data.name) errors.name = "Name is required.";
        if (!data.code) errors.code = "Code is required.";
        if (!data.email || !emailRegex.test(data.email)) errors.email = "Valid email is required.";
        if (!data.phone) errors.phone = "Phone is required.";
        if (!data.timezone?.label) errors.timezone_label = "Timezone label is required.";
        if (!data.timezone?.value) errors.timezone_value = "Timezone value is required.";
        if (!data.opening_time || !timeRegex.test(data.opening_time))
            errors.opening_time = "Opening time must be in HH:mm format.";
        if (!data.closing_time || !timeRegex.test(data.closing_time))
            errors.closing_time = "Closing time must be in HH:mm format.";
        if (!data.street) errors.street = "Street is required.";
        if (!data.city) errors.city = "City is required.";
        if (!data.state) errors.state = "State is required.";
        if (!data.country) errors.country = "Country is required.";

        return errors;
    };

    const createOutlet = async (outletData) => {
        try {
            const response = await axios.post(`${API}/api/outlets`, outletData, {
                withCredentials: true,
            });

            const newOutlet = response.data.outlet;
            const updatedOutlets = [...outlets, newOutlet];
            setOutlets(updatedOutlets);

            const updatedStaff = {
                ...staff,
                outlets: updatedOutlets
            };

            updateStaff(updatedStaff);
            setShowPopup(false);
            toast.success("Outlet created successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create outlet.");
        } finally {
            setLoading(false);
        }
    };

    const updateOutlet = async (updatedData) => {
        try {
            const response = await axios.put(`${API}/api/outlets/${updatedData._id}`, updatedData, {
                withCredentials: true,
            });

            const updatedOutlet = response.data.outlet;
            const updatedOutlets = outlets.map((outlet) =>
                outlet._id === updatedData._id ? updatedOutlet : outlet
            );

            setOutlets(updatedOutlets);

            const updatedStaff = {
                ...staff,
                outlets: updatedOutlets
            };

            updateStaff(updatedStaff);
            setShowPopup(false);
            toast.success("Outlet updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update outlet.");
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useFilteredData({
        data: outlets,
        searchTerm: search,
        searchKeys: ["name", "code", "email", "phone", "website", "street", "city", "state", "country", "postal_code"],
        filters: {
            status: filteredStatus,
        },
    });

    return (
        <>
            {loading && <Loader />}
            
            {showPopup ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <Store className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {isEditing ? "Edit Outlet" : "Create New Outlet"}
                                    </h2>
                                    <p className="text-orange-100">Configure outlet information and settings</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Basic Information */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Store className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectInput
                                        selectedOption={selectedBrand}
                                        onChange={setSelectedBrand}
                                        options={brands.map(o => ({ label: o.full_name, value: o._id }))}
                                        label="Select Brand"
                                        required
                                    />
                                    <InputField
                                        label="Outlet Name"
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter outlet name"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <InputField
                                        label="Outlet Code"
                                        format="####"
                                        type="text"
                                        name="code"
                                        value={outletCode}
                                        onChange={(e) => setOutletCode(e.target.value)}
                                        placeholder="Enter 4-digit code"
                                        required
                                    />
                                    <InputField
                                        label="Outlet Password"
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter secure password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PhoneNumberInput
                                        phoneNumber={phone}
                                        onPhoneNumberChange={setPhone}
                                        selectedCountry={selectedCountryCode}
                                        onCountryChange={setSelectedCountryCode}
                                        countryOptions={countryCodeOptions}
                                    />
                                    <InputField
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>
                                <div className="mt-6">
                                    <InputField
                                        label="Website"
                                        type="url"
                                        name="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            {/* Operating Hours */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Operating Hours & Timezone</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <SelectInput
                                        selectedOption={timezone}
                                        onChange={setTimezone}
                                        options={timezones}
                                        label="Timezone"
                                        required
                                    />
                                    <InputField
                                        label="Opening Time"
                                        type="text"
                                        name="opening_time"
                                        value={openingTime}
                                        onChange={(e) => setOpeningTime(e.target.value)}
                                        format="##:##"
                                        placeholder="09:00"
                                        required
                                    />
                                    <InputField
                                        label="Closing Time"
                                        type="text"
                                        format="##:##"
                                        name="closing_time"
                                        value={closingTime}
                                        onChange={(e) => setClosingTime(e.target.value)}
                                        placeholder="22:00"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                                </div>
                                <div className="space-y-6">
                                    <InputField
                                        label="Street Address"
                                        type="text"
                                        name="street_address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter street address"
                                        required
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            label="City"
                                            type="text"
                                            name="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Enter city"
                                            required
                                        />
                                        <InputField
                                            label="State"
                                            type="text"
                                            name="state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="Enter state"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectInput
                                            label="Country"
                                            selectedOption={selectedCountry}
                                            onChange={setSelectedCountry}
                                            options={countryOptions}
                                            required
                                        />
                                        <InputField
                                            label="Postal Code"
                                            type="text"
                                            name="postal_code"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            placeholder="Enter postal code"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Settings</h3>
                                    <Checkbox
                                        label="Active Status"
                                        checked={status}
                                        onChange={() => setStatus(!status)}
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                <Button clickAction={() => setShowPopup(false)}>
                                    Cancel
                                </Button>
                                <GradientButton clickAction={handleSave}>
                                    {isEditing ? "Update Outlet" : "Create Outlet"}
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <TopBar
                        title="Outlet Management"
                        searchText={search}
                        setSearchText={setSearch}
                        selectedFilter={filteredStatus}
                        setSelectedFilter={setFilteredStatus}
                    />
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Store className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Outlets</p>
                                    <p className="text-2xl font-bold text-gray-900">{outlets.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Store className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Outlets</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {outlets.filter(o => o.status === 'active').length}
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
                                        {new Set(outlets.map(o => o.brand_id)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Cities</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Set(outlets.map(o => o.city)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Outlets Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Outlet Directory</h2>
                                <p className="text-gray-600">Manage your outlet locations</p>
                            </div>
                            <GradientButton clickAction={handleAddNewOutlet}>
                                <Store className="w-4 h-4" />
                                Add New Outlet
                            </GradientButton>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredData.map((outlet) => (
                                <div key={outlet._id} className="group">
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-300">
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                                        <span className="text-lg font-bold text-white">
                                                            {outlet.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{outlet.name}</h3>
                                                        <p className="text-sm text-gray-600">Code: {outlet.code}</p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    outlet.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {outlet.status.charAt(0).toUpperCase() + outlet.status.slice(1)}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{outlet.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{outlet.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{outlet.street}, {outlet.city}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>{outlet.opening_time} - {outlet.closing_time}</span>
                                                </div>
                                                {outlet.website && (
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-gray-400" />
                                                        <a 
                                                            href={outlet.website} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:text-orange-700 truncate"
                                                        >
                                                            Visit Website
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleOutletEdit(outlet)}
                                                    className="w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                                                >
                                                    Edit Outlet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Add New Card */}
                            <div className="group">
                                <button 
                                    onClick={handleAddNewOutlet}
                                    className="w-full h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 flex flex-col items-center justify-center text-center p-6"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold text-gray-600 group-hover:text-orange-600 transition-colors">
                                        Add New Outlet
                                    </span>
                                    <span className="text-sm text-gray-400 mt-2">Click to create a new outlet</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Outlet;