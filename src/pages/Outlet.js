import { useContext, useEffect, useState } from 'react';
import { countryOptions, countryCodeOptions } from '../constants/countryOptions';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import InputField from '../components/InputField';
import './Brand.css';
import './Outlet.css';
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
import HeadingText from '../components/HeadingText';
import PhoneNumberInput from '../components/PhoneNumberInput';

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

        // Set country code assuming value like "+1"
        setSelectedCountryCode(countryCodeOptions.find(opt => opt.value === outlet.country_code) || null);

        setTimezone(outlet.timezone); // Already an object with label/value

        setOpeningTime(outlet.opening_time);
        setClosingTime(outlet.closing_time);
        setWebsite(outlet.website || '');
        setAddress(outlet.street); // Assuming 'address' is stored in 'street'
        setCity(outlet.city);
        setState(outlet.state);

        // Set selectedCountry from options
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
        setSelectedCountryCode(countryCodeOptions[1]); // or set default like: countryCodeOptions[0]
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
            brand_id: selectedBrand?._id || selectedBrand?.value, // Depending on how your brand select is structured
            name,
            code: outletCode,
            password,
            email,
            phone,
            country_code: selectedCountryCode?.value || '',
            timezone, // Assuming it's already in { label, value } format
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

        // Basic required fields
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



    // ✅ Create a new outlet
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
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create outlet.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Update an existing outlet
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
            {
                loading && <Loader />
            }
            {showPopup ?
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <HeadingText title={`${isEditing ? "Edit" : "Add"} Outlet`} />
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectInput
                                selectedOption={selectedBrand}
                                onChange={setSelectedBrand}
                                options={brands.map(o => ({ label: o.full_name, value: o._id }))}
                                label="Select Brand"
                            />
                            <InputField
                                label="Outlet Name"
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Outlet Code"
                                format={"####"}
                                type="text"
                                name="code"
                                value={outletCode}
                                onChange={(e) => setOutletCode(e.target.value)}
                                required
                            />
                            <InputField
                                label="Outlet Password"
                                type="text"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PhoneNumberInput
                                phoneNumber={phone}
                                onPhoneNumberChange={setPhone}
                                selectedCountry={selectedCountryCode}
                                onCountryChange={setSelectedCountryCode}
                                countryOptions={countryCodeOptions}
                            />
                            <InputField
                                label="Email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectInput
                                selectedOption={timezone}
                                onChange={setTimezone}
                                options={timezones}
                                label="Timezone"
                            />
                            <InputField
                                label="Opening Time"
                                type="text"
                                name="opening_time"
                                value={openingTime}
                                onChange={(e) => setOpeningTime(e.target.value)}
                                format={"##:##"}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Closing Time"
                                type="text"
                                format={"##:##"}
                                name="closing_time"
                                value={closingTime}
                                onChange={(e) => setClosingTime(e.target.value)}
                                required
                            />
                            <InputField
                                label="Street Address"
                                type="text"
                                name="street_address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="City"
                                type="text"
                                name="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                            <InputField
                                label="State"
                                type="text"
                                name="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectInput
                                label={"Country"}
                                selectedOption={selectedCountry}
                                onChange={setSelectedCountry}
                                options={countryOptions}
                            />
                            <InputField
                                label="Pin Code"
                                type="text"
                                name="postal_code"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <InputField
                                label="Website"
                                type="url"
                                name="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>

                        {
                            isEditing && (
                                <div className="pt-4">
                                    <Checkbox
                                        label="Active Status"
                                        checked={status}
                                        onChange={() => setStatus(!status)}
                                    />
                                </div>
                            )
                        }
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <GradientButton clickAction={handleSave}>
                            {isEditing ? "Update" : "Save"}
                        </GradientButton>
                        <Button clickAction={() => setShowPopup(false)}>Close</Button>
                    </div>
                </div> :
                <div className="space-y-6">
                    <TopBar
                        title="Outlets"
                        searchText={search}
                        setSearchText={setSearch}
                        selectedFilter={filteredStatus}
                        setSelectedFilter={setFilteredStatus}
                    />
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredData.map((outlet) => (
                                <EditCard
                                    key={outlet._id}
                                    firstLetter={outlet.name.charAt(0)}
                                    title={outlet.name}
                                    time={formatDate(outlet.updatedAt)}
                                    link={outlet.website}
                                    status={outlet.status}
                                    handleEdit={() => handleOutletEdit(outlet)}
                                />
                            ))}
                            <CardAdd handleAdd={handleAddNewOutlet} />
                        </div>
                    </div>
                </div>
            }

        </>
    );
};

export default Outlet;
