import { useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import HeadingText from '../components/HeadingText';
import InputField from '../components/InputField';
import Popup from '../components/Popup';
import './Brand.css';
import './Outlet.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import useOutlets from '../hooks/useOutlets';
import SelectInput from '../components/SelectInput';
import axios from 'axios';
import Checkbox from '../components/Checkbox';
import useFetchBrands from '../hooks/useFetchBrands';

const timezones = [
    { label: "(UTC-12:00) Baker Island", value: "Etc/GMT+12" },
    { label: "(UTC-11:00) Samoa, Midway Atoll", value: "Pacific/Midway" },
    { label: "(UTC-10:00) Hawaii", value: "Pacific/Honolulu" },
    { label: "(UTC-09:00) Alaska", value: "America/Anchorage" },
    { label: "(UTC-08:00) Pacific Time (US & Canada)", value: "America/Los_Angeles" },
    { label: "(UTC-07:00) Mountain Time (US & Canada)", value: "America/Denver" },
    { label: "(UTC-06:00) Central Time (US & Canada)", value: "America/Chicago" },
    { label: "(UTC-05:00) Eastern Time (US & Canada)", value: "America/New_York" },
    { label: "(UTC-04:00) Atlantic Time (Canada)", value: "America/Halifax" },
    { label: "(UTC-03:00) Argentina, Brazil", value: "America/Argentina/Buenos_Aires" },
    { label: "(UTC-02:00) South Georgia & South Sandwich Islands", value: "Atlantic/South_Georgia" },
    { label: "(UTC-01:00) Azores", value: "Atlantic/Azores" },
    { label: "(UTC+00:00) UTC, London", value: "Europe/London" },
    { label: "(UTC+01:00) Central European Time", value: "Europe/Berlin" },
    { label: "(UTC+02:00) Eastern European Time", value: "Europe/Athens" },
    { label: "(UTC+03:00) Moscow, Istanbul", value: "Europe/Moscow" },
    { label: "(UTC+04:00) Dubai, Baku", value: "Asia/Dubai" },
    { label: "(UTC+05:00) Pakistan Standard Time", value: "Asia/Karachi" },
    { label: "(UTC+05:30) India Standard Time", value: "Asia/Kolkata" },
    { label: "(UTC+06:00) Bangladesh Standard Time", value: "Asia/Dhaka" },
    { label: "(UTC+07:00) Thailand, Vietnam", value: "Asia/Bangkok" },
    { label: "(UTC+08:00) China, Singapore", value: "Asia/Shanghai" },
    { label: "(UTC+09:00) Japan, Korea", value: "Asia/Tokyo" },
    { label: "(UTC+10:00) Sydney, Brisbane", value: "Australia/Sydney" },
    { label: "(UTC+11:00) Solomon Islands", value: "Pacific/Guadalcanal" },
    { label: "(UTC+12:00) New Zealand", value: "Pacific/Auckland" }
];


const Outlet = () => {
    const { brands } = useFetchBrands();
    const { createOutlet, updateOutlet } = useOutlets();
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [outletBrand, setOutletBrand] = useState(null);
    const [outlets, setOutlets] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [outletData, setOutletData] = useState({
        address: {
            street: "",
            city: "",
            state: "",
            country: "",
            code: ""
        },
        _id: "",
        brand_id: "",
        name: "",
        code: "",
        email: "",
        phone: "",
        timezone: "",
        opening_time: "",
        closing_time: "",
        website: "",
        status: true,
    });


    const handleBrandSelection = async () => {
        try {
            if (!selectedBrand?._id) {
                console.error("Brand ID is missing!");
                return;
            }

            const response = await axios.get(
                `http://localhost:5001/api/outlets/brand/${selectedBrand._id}`,
                { withCredentials: true }
            );

            const outlets = response.data;

            setOutlets(outlets);

            setOutletBrand(selectedBrand);

        } catch (error) {
            if (error.status === 404) {
                setOutletBrand(selectedBrand);
            }
            console.error("Error fetching outlets:", error);
            setOutlets([]);
            // setError?.(error.response?.data?.message || "Failed to fetch outlets.");
        }
    };

    const handleOutletEdit = (outlet) => {
        setIsEditing(true);
        setOutletData({
            address: {
                street: outlet.address.street,
                city: outlet.address.city,
                state: outlet.address.state,
                country: outlet.address.country,
                code: outlet.address.code
            },
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
            status: outlet.status,
        });
        setShowPopup(true);
    }

    const handleTimezoneChange = (event) => {
        const newTimezone = event.target.value;
        setOutletData((prevData) => ({
            ...prevData,
            timezone: newTimezone
        }));
    };

    const handleAddNewOutlet = async () => {
        setIsEditing(false);
        try {

            setOutletData({
                address: {
                    street: "",
                    city: "",
                    state: "",
                    country: "",
                    code: ""
                },
                _id: "",
                brand_id: outletBrand._id,
                name: "",
                code: "",
                email: "",
                phone: "",
                timezone: timezones[0].value,
                opening_time: "",
                closing_time: "",
                website: "",
                status: true,
            });
            setShowPopup(true);
        } catch (error) {
            console.error("Error creating outlet:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setOutletData((prevData) => {
            if (name.startsWith("address.")) {
                return {
                    ...prevData,
                    address: {
                        ...prevData.address,
                        [name.split(".")[1]]: value,
                    },
                };
            }

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
        };

        if (isEditing) {
            const updatedOutletData = await updateOutlet(outletData._id, formattedOutletData);
            if (updatedOutletData) {
                setOutlets((prevOutlets) =>
                    prevOutlets.map((outlet) =>
                        outlet._id === updatedOutletData._id ? updatedOutletData : outlet
                    )
                );
            }

        } else {
            createOutlet(formattedOutletData);
        }
        setShowPopup(false);
    };


    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    return (
        <>
            <HeadingText>Outlet</HeadingText>
            <div className="brand-filter">
                <SelectInput
                    selectedOption={selectedBrand}
                    onChange={setSelectedBrand}
                    options={brands}
                    label="Brand Name"
                />
                <div className="filter-action-btns">
                    <GradientButton clickAction={handleBrandSelection}>Submit</GradientButton>
                    <Button clickAction={() => setSelectedBrand(null)}>Reset</Button>
                </div>
            </div>
            {
                outletBrand && (
                    <>
                        <HeadingText>Outlet List ({outletBrand.short_name})</HeadingText>
                        <div className="cards-container">
                            {outlets && outlets.map(outlet => (
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
                    </>
                )
            }
            {showPopup && (
                <Popup title="Outlet Configuration" closePopup={() => setShowPopup(false)}>
                    <div className="inputs-row">
                        <InputField
                            label="Outlet Name"
                            type="text"
                            name="name"
                            value={outletData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Outlet Code"
                            type="text"
                            name="code"
                            value={outletData.code}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Phone No"
                            type="tel"
                            name="phone"
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
                        <InputField
                            label="Website"
                            type="url"
                            name="website"
                            value={outletData.website}
                            onChange={handleInputChange}
                        />
                        <div className='input-field'>
                            <label>Timezone</label>
                            <div className="input-container">
                                <select name="timezone" defaultValue={timezones.find(tz => tz.value === outletData.timezone)?.value || timezones[0].value} onChange={handleTimezoneChange}>
                                    {timezones.map((tz) => (
                                        <option key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Opening Time"
                            type="time"
                            name="opening_time"
                            value={outletData.opening_time}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Closing Time"
                            type="time"
                            name="closing_time"
                            value={outletData.closing_time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Street"
                            type="text"
                            name="address.street"
                            value={outletData.address.street}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="City"
                            type="text"
                            name="address.city"
                            value={outletData.address.city}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="State"
                            type="text"
                            name="address.state"
                            value={outletData.address.state}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Country"
                            type="text"
                            name="address.country"
                            value={outletData.address.country}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Pin Code"
                            type="text"
                            name="address.code"
                            value={outletData.address.code}
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
