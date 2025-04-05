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
import Checkbox from '../components/Checkbox';
import useFetchBrands from '../hooks/useFetchBrands';
import SearchFilterBar from '../components/SearchFilterBar';
import timezones from '../data/timezones.json';

const Outlet = () => {
    const { brands } = useFetchBrands();
    const { outlets, loading, error, updateOutlet, createOutlet } = useOutlets(); // API methods
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
        setShowPopup(false);
    };


    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }


    const filteredOutlets = outlets.filter((outlet) => {
        const matchesSearch = outlet.name.toLowerCase().includes(search.toLowerCase()) ||
            outlet.brand_id.short_name.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            !status || outlet.status.toLowerCase() === status.toLowerCase(); // empty status means all

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <HeadingText>Outlet</HeadingText>
            <SearchFilterBar
                placeholder="Search Brand, Outlet..."
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={status}
                onStatusChange={setStatus}
            />
            <div className="cards-container">
                {loading ? (
                    <p>Loading brands...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <>
                        {filteredOutlets.map((outlet) => (
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
                )}
            </div>
            {showPopup && (
                <Popup title="Outlet Configuration" closePopup={() => setShowPopup(false)}>
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
                            format={"(###) ###-####"}
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
                            format={"##/##"}
                            required
                        />
                    </div>

                    <div className="inputs-row">
                        <InputField
                            label="Closing Time"
                            type="text"
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
