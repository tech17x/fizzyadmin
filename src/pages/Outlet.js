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
import { Store, Plus } from 'lucide-react';
import HeadingText from '../components/HeadingText';

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
            
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <HeadingText title={isEditing ? "Edit Outlet" : "Add New Outlet"} />
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
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
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter outlet name"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Outlet Code"
                                        format="####"
                                        type="text"
                                        value={outletCode}
                                        onChange={(e) => setOutletCode(e.target.value)}
                                        placeholder="Enter 4-digit code"
                                        required
                                    />
                                    <InputField
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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

                                <div className="grid grid-cols-3 gap-4">
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
                                        value={closingTime}
                                        onChange={(e) => setClosingTime(e.target.value)}
                                        placeholder="22:00"
                                        required
                                    />
                                </div>

                                <InputField
                                    label="Website"
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://example.com"
                                />

                                <InputField
                                    label="Street Address"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter street address"
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="City"
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Enter city"
                                        required
                                    />
                                    <InputField
                                        label="State"
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="Enter state"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        placeholder="Enter postal code"
                                        required
                                    />
                                </div>

                                {isEditing && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <Checkbox
                                            label="Active Status"
                                            checked={status}
                                            onChange={() => setStatus(!status)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                <Button clickAction={() => setShowPopup(false)}>
                                    Cancel
                                </Button>
                                <GradientButton clickAction={handleSave}>
                                    {isEditing ? "Update" : "Create"}
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <TopBar
                    title="Outlet Management"
                    searchText={search}
                    setSearchText={setSearch}
                    selectedFilter={filteredStatus}
                    setSelectedFilter={setFilteredStatus}
                />
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Outlets ({outlets.length})</h2>
                            <p className="text-gray-600">Manage your outlet locations</p>
                        </div>
                        <GradientButton clickAction={handleAddNewOutlet}>
                            <Plus className="w-4 h-4" />
                            Add Outlet
                        </GradientButton>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((outlet) => (
                                    <tr key={outlet._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary-gradient rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold">{outlet.name.charAt(0)}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{outlet.name}</div>
                                                    <div className="text-sm text-gray-500">Code: {outlet.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{outlet.email}</div>
                                            <div className="text-sm text-gray-500">{outlet.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{outlet.opening_time} - {outlet.closing_time}</div>
                                            <div className="text-sm text-gray-500">{outlet.timezone?.label?.split(')')[0]}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{outlet.city}</div>
                                            <div className="text-sm text-gray-500">{outlet.state}, {outlet.country}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                outlet.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {outlet.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleOutletEdit(outlet)}
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

export default Outlet;