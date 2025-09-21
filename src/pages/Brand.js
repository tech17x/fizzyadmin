import { useContext, useEffect, useState } from "react";
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
import { Plus } from "lucide-react";

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

            {showPopup && (
                <div className='card'>
                    <HeadingText title={`${isEditing ? "Edit" : "Add"} Brand`} />
                    <div className="inputs-container">
                        <div className="inputs-row">
                            <InputField
                                label="Brand Name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter brand name"
                                required
                            />
                            <InputField
                                label="Short Name"
                                type="text"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                placeholder="Enter short name"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
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
                        <div className="inputs-row">
                            <InputField
                                label="GST Number"
                                type="text"
                                value={gstNo}
                                onChange={(e) => setGstNo(e.target.value)}
                                placeholder="GST number"
                                required
                            />
                            <InputField
                                label="License Number"
                                type="text"
                                value={licenseNo}
                                onChange={(e) => setLicenseNo(e.target.value)}
                                placeholder="License number"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Food License"
                                type="text"
                                value={foodLicense}
                                onChange={(e) => setFoodLicense(e.target.value)}
                                placeholder="Food license"
                                required
                            />
                            <InputField
                                label="Website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Street Address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter street address"
                                required
                            />
                            <InputField
                                label="City"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter city"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="State"
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="Enter state"
                                required
                            />
                            <SelectInput
                                label="Country"
                                selectedOption={selectedCountry}
                                onChange={setSelectedCountry}
                                options={countryOptions}
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Postal Code"
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="Enter postal code"
                                required
                            />
                            <div style={{ visibility: "hidden" }}>
                                <InputField label="Hidden" />
                            </div>
                        </div>
                        {isEditing && (
                            <div className="checkbox-container">
                                <Checkbox
                                    label="Active Status"
                                    checked={status}
                                    onChange={() => setStatus(!status)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="action-btns-container">
                        <GradientButton clickAction={handleSave}>
                            {isEditing ? "Update" : "Create"}
                        </GradientButton>
                        <Button clickAction={() => setShowPopup(false)}>Close</Button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <TopBar
                    title="Brand Management"
                    searchText={search}
                    setSearchText={setSearch}
                    selectedFilter={filteredStatus}
                    setSelectedFilter={setFilteredStatus}
                />
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Brands ({brands.length})</h2>
                            <p className="text-gray-600">Manage your brand portfolio</p>
                        </div>
                        <GradientButton clickAction={handleAddNewBrand}>
                            <Plus className="w-4 h-4" />
                            Add Brand
                        </GradientButton>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary-gradient rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold">{brand.short_name.charAt(0)}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{brand.full_name}</div>
                                                    <div className="text-sm text-gray-500">{brand.short_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{brand.email}</div>
                                            <div className="text-sm text-gray-500">{brand.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{brand.city}</div>
                                            <div className="text-sm text-gray-500">{brand.state}, {brand.country}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                brand.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {brand.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEditBrand(brand)}
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

export default Brand;