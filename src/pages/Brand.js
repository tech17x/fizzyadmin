import { useContext, useEffect, useState } from "react";
import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
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
import { countryOptions, countryCodeOptions } from '../constants/countryOptions';

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
    const [status, setStatus] = useState(true);

    useEffect(() => {
        if (staff.permissions?.includes('brand_manage')) {
            setBrands(staff.brands);
            setLoading(false);
        } else {
            logout();
        }
    }, [staff, logout]);

    const handleAddNewBrand = () => {
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
        }


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

        // Required fields
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

        // Format validations
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

            // ✅ Update local brands state
            setBrands(updatedBrands);

            // ✅ Update staff context with new brands array
            const updatedStaff = {
                ...staff,
                brands: updatedBrands
            };

            updateStaff(updatedStaff); // Comes from AuthContext
            setShowPopup(false);
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

            // ✅ Update brands state
            setBrands(updatedBrands);

            // ✅ Safely update staff using a new object
            const updatedStaff = {
                ...staff,
                brands: updatedBrands
            };

            updateStaff(updatedStaff); // ✅ from AuthContext


            setShowPopup(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update brand.");
        } finally {
            setLoading(false);
        }
    };

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
                <div className="max-w-4xl mx-auto">
                    <div className="card">
                        <HeadingText 
                            title={`${isEditing ? "Edit" : "Add"} Brand`}
                            subtitle={`${isEditing ? "Update" : "Create"} brand information and business details`}
                            icon={Building2}
                        />
                        
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="section-title">Basic Information</h3>
                                <div className="form-grid">
                                    <InputField
                                        label="Brand Name"
                                        type="text"
                                        name="full_name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your brand name"
                                        helpText="This will be displayed as your main brand identity"
                                        icon={Building2}
                                        required
                                    />
                                    <InputField
                                        label="Short Name"
                                        type="text"
                                        name="short_name"
                                        value={shortName}
                                        onChange={(e) => setShortName(e.target.value)}
                                        placeholder="Enter abbreviated name"
                                        helpText="Used for quick identification and displays"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Legal Information */}
                            <div>
                                <h3 className="section-title">Legal Information</h3>
                                <div className="form-grid">
                                    <InputField
                                        label="GST Number"
                                        type="text"
                                        name="gst_no"
                                        value={gstNo}
                                        onChange={(e) => setGstNo(e.target.value)}
                                        placeholder="Enter GST registration number"
                                        helpText="Required for tax compliance and invoicing"
                                        required
                                    />
                                    <InputField
                                        label="Business License Number"
                                        type="text"
                                        name="license_no"
                                        value={licenseNo}
                                        onChange={(e) => setLicenseNo(e.target.value)}
                                        placeholder="Enter business license number"
                                        helpText="Official business registration number"
                                        required
                                    />
                                </div>
                                <div className="form-grid mt-4">
                                    <InputField
                                        label="Food License"
                                        type="text"
                                        name="food_license"
                                        value={foodLicense}
                                        onChange={(e) => setFoodLicense(e.target.value)}
                                        placeholder="Enter food safety license"
                                        helpText="FSSAI or equivalent food safety certification"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="section-title">Contact Information</h3>
                                <div className="form-grid">
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
                                        placeholder="Enter business email"
                                        helpText="Primary contact email for business communications"
                                        icon={Mail}
                                        required
                                    />
                                </div>
                                <div className="form-grid mt-4">
                                    <InputField
                                        label="Website URL"
                                        type="url"
                                        name="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://yourbrand.com"
                                        helpText="Your brand's official website"
                                        icon={Globe}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Address Information */}
                            <div>
                                <h3 className="section-title">Address Information</h3>
                                <div className="space-y-4">
                                    <InputField
                                        label="Street Address"
                                        type="text"
                                        name="street_address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter complete street address"
                                        helpText="Include building number, street name, and any apartment/suite details"
                                        icon={MapPin}
                                        required
                                    />
                                    <div className="form-grid">
                                        <InputField
                                            label="City"
                                            type="text"
                                            name="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Enter city name"
                                            required
                                        />
                                        <InputField
                                            label="State/Province"
                                            type="text"
                                            name="state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="Enter state or province"
                                            required
                                        />
                                    </div>
                                    <div className="form-grid">
                                        <SelectInput
                                            label="Country"
                                            selectedOption={selectedCountry}
                                            onChange={setSelectedCountry}
                                            options={countryOptions}
                                            helpText="Select your business location country"
                                        />
                                        <InputField
                                            label="Postal Code"
                                            type="text"
                                            name="postal_code"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            placeholder="Enter postal/ZIP code"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            {isEditing && (
                                <div>
                                    <h3 className="section-title">Status Settings</h3>
                                    <Checkbox
                                        label="Active Status"
                                        checked={status}
                                        onChange={() => setStatus(!status)}
                                        helpText="Enable this brand for operations and outlet creation"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <Button clickAction={() => setShowPopup(false)}>
                                Cancel
                            </Button>
                            <GradientButton clickAction={handleSave}>
                                {isEditing ? "Update Brand" : "Create Brand"}
                            </GradientButton>
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
                    
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Your Brands</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage your brand portfolio and business information
                                </p>
                            </div>
                            <GradientButton clickAction={handleAddNewBrand}>
                                Add New Brand
                            </GradientButton>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredData.map((brand) => (
                                <EditCard
                                    key={brand._id}
                                    firstLetter={brand.short_name.charAt(0)}
                                    title={brand.full_name}
                                    link={brand.website}
                                    status={brand.status}
                                    location={`${brand.city}, ${brand.state}`}
                                    handleEdit={() => handleEditBrand(brand)}
                                />
                            ))}
                            <CardAdd handleAdd={handleAddNewBrand} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Brand;