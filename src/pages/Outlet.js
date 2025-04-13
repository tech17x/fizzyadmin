import { useCallback, useEffect, useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import HeadingText from '../components/HeadingText';
import InputField from '../components/InputField';
import Popup from '../components/Popup';
import './Brand.css';
import './Outlet.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import Checkbox from '../components/Checkbox';
import useFetchBrands from '../hooks/useFetchBrands';
import SearchFilterBar from '../components/SearchFilterBar';
import timezones from '../data/timezones.json';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../components/Loader';
import useFilteredData from '../hooks/filterData';

const Outlet = () => {
    const API = process.env.REACT_APP_API_URL;
    const { brands } = useFetchBrands();
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [outletData, setOutletData] = useState({
        _id: "",
        brand_id: "",
        name: "",
        code: "",
        email: "",
        phone: "",
        timezone: {
            label: "",
            value: "",
        },
        opening_time: "",
        closing_time: "",
        website: "",
        street: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        status: true,
    });

    const fetchOutlets = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/outlets`, {
                withCredentials: true,
            });
            setOutlets(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch brands.");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchOutlets();
    }, [fetchOutlets]); // No warning, fetchBrands is memoized

    const handleOutletEdit = (outlet) => {
        setIsEditing(true);
        setOutletData({
            _id: outlet._id,
            brand_id: outlet.brand_id,
            name: outlet.name,
            code: outlet.code,
            email: outlet.email,
            phone: outlet.phone,
            timezone: outlet.timezone,
            opening_time: outlet.opening_time,
            closing_time: outlet.closing_time,
            website: outlet.website,
            street: outlet.street,
            city: outlet.city,
            state: outlet.state,
            country: outlet.country,
            postal_code: outlet.postal_code,
            status: outlet.status,
        });
        setSelectedBrand(brands.find(brand => brand._id === outlet.brand_id._id));
        setShowPopup(true);
    }

    const handleTimezoneChange = (timezone) => {
        const newTimezone = timezone;
        setOutletData((prevData) => ({
            ...prevData,
            timezone: newTimezone
        }));
    };

    const handleAddNewOutlet = async () => {
        setIsEditing(false);
        try {
            setOutletData({
                _id: "",
                brand_id: "",
                name: "",
                code: "",
                email: "",
                phone: "",
                timezone: {
                    label: "",
                    value: "",
                },
                opening_time: "",
                closing_time: "",
                website: "",
                street: "",
                city: "",
                state: "",
                country: "",
                postal_code: "",
                status: true,
            });
            setSelectedBrand(null);
            setShowPopup(true);
        } catch (error) {
            console.error("Error creating outlet:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setOutletData((prevData) => {
            return {
                ...prevData,
                [name]: value,
            };
        });
    };


    const handleStatusChange = () => {
        setOutletData((prevData) => ({
            ...prevData,
            status: prevData.status === "active" ? "inactive" : "active",
        }));
    };

    const handleSave = async () => {
        const formattedOutletData = {
            ...outletData,
            status: isEditing ? (outletData.status) : "active", // Always active for new brand
            brand_id: selectedBrand._id
        };

        if (isEditing) {
            await updateOutlet(outletData._id, formattedOutletData);
        } else {
            createOutlet(formattedOutletData);
        }
    };


    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    const validateOutletData = (data) => {
        const errors = {};

        const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!data.brand_id) errors.brand_id = "Brand is required.";
        if (!data.name) errors.name = "Name is required.";
        if (!data.code) errors.code = "Code is required.";
        if (!data.email || !emailRegex.test(data.email)) errors.email = "Valid email is required.";
        if (!data.phone || !phoneRegex.test(data.phone)) errors.phone = "Phone must be ###-###-####.";

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
        const errors = validateOutletData(outletData);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((msg) => toast.error(msg));
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API}/api/outlets`, outletData, {
                withCredentials: true,
            });
            setOutlets((prevOutlets) => [...prevOutlets, response.data.outlet]);
            setShowPopup(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create outlet.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Update an existing outlet
    const updateOutlet = async (outletId, updatedData) => {
        const errors = validateOutletData(updatedData);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((msg) => toast.error(msg));
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`${API}/api/outlets/${outletId}`, updatedData, {
                withCredentials: true,
            });

            const updatedOutlet = response.data.outlet;
            setOutlets((prevOutlets) =>
                prevOutlets.map((outlet) => (outlet._id === outletId ? updatedOutlet : outlet))
            );

            setShowPopup(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update outlet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {
                loading && <Loader />
            }
            <HeadingText>Outlet</HeadingText>
            <SearchFilterBar
                placeholder="Search Brand, Outlet..."
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={status}
                onStatusChange={setStatus}
            />
            <div className="cards-container">
                <>
                    {useFilteredData({
                        data: outlets,
                        searchTerm: search,
                        searchKeys: ["name", "code", "email", "phone", "website", "license_no", "food_license", "website", "city", "state", "country", "postal_code", "street_address", "brand_id.full_name"],
                        filters: {
                            status: status,
                        },
                    }).map((outlet) => (
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
                </>
            </div>
            {showPopup && (
                <Popup title={isEditing ? "Edit Outlet" : "Add Outlet"} closePopup={() => setShowPopup(false)}>
                    <div className="inputs-row">
                        <SelectInput
                            selectedOption={selectedBrand}
                            onChange={setSelectedBrand}
                            options={brands}
                            label="Select Brand"
                        />
                        <InputField
                            label="Outlet Name"
                            type="text"
                            name="name"
                            value={outletData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Outlet Code"
                            format={"####"}
                            type="text"
                            name="code"
                            value={outletData.code}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Website"
                            type="url"
                            name="website"
                            value={outletData.website}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Phone No"
                            type="tel"
                            name="phone"
                            format={"###-###-####"}
                            value={outletData.phone}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Email"
                            type="email"
                            name="email"
                            value={outletData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <SelectInput
                            selectedOption={outletData.timezone || timezones.find(tz => tz.value === outletData.timezone) || timezones[0]}
                            onChange={handleTimezoneChange}
                            options={timezones}
                            label="Timezone"
                        />
                        <InputField
                            label="Opening Time"
                            type="text"
                            name="opening_time"
                            value={outletData.opening_time}
                            onChange={handleInputChange}
                            format={"##:##"}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Closing Time"
                            type="text"
                            format={"##:##"}
                            name="closing_time"
                            value={outletData.closing_time}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Street"
                            type="text"
                            name="street"
                            value={outletData.street}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="City"
                            type="text"
                            name="city"
                            value={outletData.city}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="State"
                            type="text"
                            name="state"
                            value={outletData.state}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Country"
                            type="text"
                            name="country"
                            value={outletData.country}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Pin Code"
                            type="text"
                            name="postal_code"
                            value={outletData.postal_code}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {
                        isEditing && (
                            <div className="inputs-row" style={{ padding: "10px", flexDirection: "column", gap: "5px" }}>
                                <Checkbox
                                    label="Active Status"
                                    checked={outletData.status === "active"}
                                    onChange={handleStatusChange}
                                />
                            </div>
                        )
                    }

                    <div className="action-btns-container">
                        <GradientButton clickAction={handleSave}>
                            {isEditing ? "Update" : "Save"}
                        </GradientButton>
                        <Button clickAction={() => setShowPopup(false)}>Close</Button>
                    </div>
                </Popup>
            )}

        </>
    );
};

export default Outlet;
