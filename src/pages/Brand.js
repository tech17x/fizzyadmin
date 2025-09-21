import { useContext, useEffect, useState } from "react";
import CardAdd from "../components/CardAdd";
import EditCard from "../components/EditCard";
import InputField from "../components/InputField";
import GradientButton from "../components/GradientButton";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Checkbox from "../components/Checkbox";
import { toast } from "react-toastify";
import axios from "axios";
import useFilteredData from "../hooks/filterData";
import TopBar from "../components/TopBar";
import PhoneNumberInput from "../components/PhoneNumberInput";
import HeadingText from "../components/HeadingText";
import SelectInput from "../components/SelectInput";
import AuthContext from "../context/AuthContext";
import { countryCodeOptions, countryOptions } from "../constants/countryOptions";
import { Building, Globe, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react";

const Brand = () => {
    const API = process.env.REACT_APP_API_URL;

    const { staff, updateStaff, logout } = useContext(AuthContext);
    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [search, setSearch] = useState('');
    const [filteredStatus, setFilteredStatus] = useState('');

    const [id, setId] = useState("");
    const [fullName, setFullName] = useState('');
    const [shortName, setShortName] = useState('');
    const [gstNo, setGstNo] = useState('');
    const [licenseNo, setLicenseNo] = useState('');
    const [foodLicense, setFoodLicense] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodeOptions[1]);
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countryOptions[1]);
    const [postalCode, setPostalCode] = useState('');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (staff.permissions?.includes('brand_manage')) {
            setBrands(staff.brands);
            setLoading(false);
        } else {
            logout();
        }
    }, [staff, logout]);

    const handleAddNewBrand = async () => {
        setIsEditing(false);
        setId('');
        setFullName('');
        setShortName('');
        setGstNo('');
        setLicenseNo('');
        setFoodLicense('');
        setPhone('');
        setSelectedCountryCode(countryCodeOptions[1]);
        setEmail('');
        setWebsite('');
        setCity('');
        setState('');
        setSelectedCountry(countryOptions[1]);
        setPostalCode('');
        setAddress('');
        setStatus(true);
        setShowPopup(true);
    };

    const handleEditBrand = (brand) => {
        setIsEditing(true);
        setId(brand._id);
        setFullName(brand.full_name);
        setShortName(brand.short_name);
        setGstNo(brand.gst_no);
        setLicenseNo(brand.license_no);
        setFoodLicense(brand.food_license);
        setPhone(brand.phone);
        setSelectedCountryCode(countryCodeOptions.find(i => i.value === brand.country_code));
        setEmail(brand.email);
        setWebsite(brand.website);
        setCity(brand.city);
        setState(brand.state);
        setSelectedCountry(countryOptions.find(i => i.value === brand.country.toLowerCase()));
        setPostalCode(brand.postal_code);
        setAddress(brand.street_address);
        setStatus(brand.status === "active");
        setShowPopup(true);
    };

    const handleSave = () => {
        setLoading(true);
        const payload = {
            _id: id,
            full_name: fullName,
            short_name: shortName,
            gst_no: gstNo,
            license_no: licenseNo,
            food_license: foodLicense,
            phone: phone,
            country_code: selectedCountryCode.value,
            email: email,
            website: website,
            city: city,
            state: state,
            country: selectedCountry.value,
            postal_code: postalCode,
            street_address: address,
            status: status ? "active" : "inactive",
        };

        const errors = validateBrandData(payload);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((msg) => toast.error(msg));
            setTimeout(() => {
                setLoading(false);
            }, 1000);
            return;
        }

        if (isEditing) {
            updateBrand(payload);
        } else {
            createBrand(payload);
        }
    };

    const validateBrandData = (brandData) => {
        const errors = {};

        if (!brandData.full_name) errors.full_name = "Brand name is required.";
        if (!brandData.short_name) errors.short_name = "Short name is required.";
        if (!brandData.email) errors.email = "Email is required.";
        if (!brandData.phone) errors.phone = "Phone number is required.";
        if (!brandData.gst_no) errors.gst_no = "GST number is required.";
        if (!brandData.license_no) errors.license_no = "License number is required.";
        if (!brandData.food_license) errors.food_license = "Food license is required.";
        if (!brandData.city) errors.city = "City is required.";
        if (!brandData.state) errors.state = "State is required.";
        if (!brandData.country) errors.country = "Country is required.";
        if (!brandData.country_code) errors.country = "Country code is required.";
        if (!brandData.postal_code) errors.postal_code = "Postal code is required.";
        if (!brandData.street_address) errors.street_address = "Street address is required.";

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (brandData.email && !emailRegex.test(brandData.email)) {
            errors.email = "Invalid email format.";
        }

        return errors;
    };

    const createBrand = async (brandData) => {
        try {
            const response = await axios.post(`${API}/api/brands`, brandData, {
                withCredentials: true,
            });
            const newBrand = response.data.brand;

            const updatedBrands = [...brands, newBrand];

            setBrands(updatedBrands);

            const updatedStaff = {
                ...staff,
                brands: updatedBrands
            };

            updateStaff(updatedStaff);
            setShowPopup(false);
            toast.success("Brand created successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create brand.");
        } finally {
            setLoading(false);
        }
    };

    const updateBrand = async (updatedData) => {
        try {
            const response = await axios.put(
                `${API}/api/brands/${updatedData._id}`,
                updatedData,
                { withCredentials: true }
            );

            const updatedBrand = response.data.brand;

            const updatedBrands = brands.map((brand) =>
                brand._id === updatedData._id ? updatedBrand : brand
            );

            setBrands(updatedBrands);

            const updatedStaff = {
                ...staff,
                brands: updatedBrands
            };

            updateStaff(updatedStaff);

            setShowPopup(false);
            toast.success("Brand updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update brand.");
        } finally {
            setLoading(false);
        }
    };

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    const filteredData = useFilteredData({
        data: brands,
        searchTerm: search,
        searchKeys: ["full_name", "short_name", "email", "phone", "website", "city", "state", "country", "postal_code", "street_address", "gst_no", "license_no", "food_license"],
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
                                    <Building className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {isEditing ? "Edit Brand" : "Create New Brand"}
                                    </h2>
                                    <p className="text-orange-100">Configure brand information and settings</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Basic Information */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Building className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Brand Name"
                                        type="text"
                                        name="full_name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter full brand name"
                                        required
                                    />
                                    <InputField
                                        label="Short Name"
                                        type="text"
                                        name="short_name"
                                        value={shortName}
                                        onChange={(e) => setShortName(e.target.value)}
                                        placeholder="Enter short name"
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
                                    <InputField
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        required
                                    />
                                    <PhoneNumberInput
                                        phoneNumber={phone}
                                        onPhoneNumberChange={setPhone}
                                        selectedCountry={selectedCountryCode}
                                        onCountryChange={setSelectedCountryCode}
                                        countryOptions={countryCodeOptions}
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

                            {/* Legal Information */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Legal Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField
                                        label="GST Number"
                                        type="text"
                                        name="gst_no"
                                        value={gstNo}
                                        onChange={(e) => setGstNo(e.target.value)}
                                        placeholder="Enter GST number"
                                        required
                                    />
                                    <InputField
                                        label="License Number"
                                        type="text"
                                        name="license_no"
                                        value={licenseNo}
                                        onChange={(e) => setLicenseNo(e.target.value)}
                                        placeholder="Enter license number"
                                        required
                                    />
                                    <InputField
                                        label="Food License"
                                        type="text"
                                        name="food_license"
                                        value={foodLicense}
                                        onChange={(e) => setFoodLicense(e.target.value)}
                                        placeholder="Enter food license"
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
                                    {isEditing ? "Update Brand" : "Create Brand"}
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <TopBar
                        title="Brand Management"
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
                                    <Building className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Brands</p>
                                    <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Building className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Brands</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {brands.filter(b => b.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Countries</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Set(brands.map(b => b.country)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {brands.filter(b => {
                                            const created = new Date(b.createdAt);
                                            const now = new Date();
                                            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                        }).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brands Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Brand Directory</h2>
                                <p className="text-gray-600">Manage your brand portfolio</p>
                            </div>
                            <GradientButton clickAction={handleAddNewBrand}>
                                <Building className="w-4 h-4" />
                                Add New Brand
                            </GradientButton>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredData.map((brand) => (
                                <div key={brand._id} className="group">
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-300">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-xl font-bold text-white">
                                                    {brand.short_name.charAt(0)}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{brand.full_name}</h3>
                                                <p className="text-sm text-gray-600">{brand.short_name}</p>
                                            </div>
                                            
                                            <div className="space-y-2 text-xs text-gray-500 w-full">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{brand.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{brand.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{brand.city}, {brand.state}</span>
                                                </div>
                                                {brand.website && (
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-3 h-3" />
                                                        <a 
                                                            href={brand.website} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:text-orange-700 truncate"
                                                        >
                                                            Visit Website
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between w-full pt-4 border-t border-gray-100">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    brand.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {brand.status.charAt(0).toUpperCase() + brand.status.slice(1)}
                                                </span>
                                                <button
                                                    onClick={() => handleEditBrand(brand)}
                                                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Add New Card */}
                            <div className="group">
                                <button 
                                    onClick={handleAddNewBrand}
                                    className="w-full h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 flex flex-col items-center justify-center text-center p-6 group"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                                        <Building className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold text-gray-600 group-hover:text-orange-600 transition-colors">
                                        Add New Brand
                                    </span>
                                    <span className="text-sm text-gray-400 mt-2">Click to create a new brand</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Brand;