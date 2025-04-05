import { useState } from "react";
import CardAdd from "../components/CardAdd";
import EditCard from "../components/EditCard";
import HeadingText from "../components/HeadingText";
import InputField from "../components/InputField";
import Popup from "../components/Popup";
import "./Brand.css";
import GradientButton from "../components/GradientButton";
import Button from "../components/Button";
import useBrands from "../hooks/useBrands";
import Checkbox from "../components/Checkbox";
import SearchFilterBar from "../components/SearchFilterBar";

const Brand = () => {
    const { brands, loading, error, updateBrand, createBrand } = useBrands(); // API methods

    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [brandData, setBrandData] = useState({
        _id: "",
        name: "",
        short_name: "",
        gst_no: "",
        license_no: "",
        food_license: "",
        phone: "",
        email: "",
        website: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        street_address: "",
        status: true, // Default to active (checked)
    });

    const handleAddNewBrand = () => {
        setIsEditing(false);
        setBrandData({
            _id: "",
            name: "",
            short_name: "",
            gst_no: "",
            license_no: "",
            food_license: "",
            phone: "",
            email: "",
            website: "",
            city: "",
            state: "",
            country: "",
            postal_code: "",
            street_address: "",
            status: true, // Default to active (checked)
        });
        setShowPopup(true);
    };

    const handleEditBrand = (brand) => {
        setIsEditing(true);
        setBrandData({
            _id: brand._id,
            name: brand.name || "",
            short_name: brand.short_name || "",
            gst_no: brand.gst_no || "",
            license_no: brand.license_no || "",
            food_license: brand.food_license || "",
            phone: brand.phone || "",
            email: brand.email || "",
            website: brand.website || "",
            city: brand.city || "",
            state: brand.state || "",
            country: brand.country || "",
            postal_code: brand.postal_code || "",
            street_address: brand.street_address || "",
            status: brand.status === "active", // Convert string status to boolean
        });
        setShowPopup(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBrandData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = () => {
        setBrandData((prev) => ({ ...prev, status: !prev.status }));
    };

    const handleSave = () => {
        const formattedBrandData = {
            ...brandData,
            status: isEditing ? (brandData.status ? "active" : "inactive") : "active", // Always active for new brand
        };

        if (isEditing) {
            updateBrand(brandData._id, formattedBrandData);
        } else {
            createBrand(formattedBrandData);
        }
        setShowPopup(false);
    };

    const filteredBrands = brands.filter((brand) => {
        const matchesSearch = brand.name.toLowerCase().includes(search.toLowerCase()) ||
            brand.short_name.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            !status || brand.status.toLowerCase() === status.toLowerCase(); // empty status means all

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <HeadingText>Brand List</HeadingText>
            <SearchFilterBar
                placeholder="Search Brands..."
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
                        {filteredBrands.map((brand) => (
                            <EditCard
                                key={brand._id}
                                firstLetter={brand.short_name.charAt(0)}
                                title={brand.short_name}
                                link={brand.website}
                                status={brand.status}
                                handleEdit={() => handleEditBrand(brand)}
                            />
                        ))}
                        <CardAdd handleAdd={handleAddNewBrand} />
                    </>
                )}
            </div>

            {showPopup && (
                <Popup
                    title={isEditing ? "Edit Brand" : "Add New Brand"}
                    closePopup={() => setShowPopup(false)}
                >
                    <div className="inputs-container">
                        <div className="inputs-row">
                            <InputField
                                label="Brand Name"
                                type="text"
                                name="name"
                                value={brandData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Short Name"
                                type="text"
                                name="short_name"
                                value={brandData.short_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="GST No"
                                type="text"
                                name="gst_no"
                                value={brandData.gst_no}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="License No"
                                type="text"
                                name="license_no"
                                value={brandData.license_no}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Food License"
                                type="text"
                                name="food_license"
                                value={brandData.food_license}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Phone No"
                                type="tel"
                                name="phone"
                                value={brandData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Email"
                                type="email"
                                name="email"
                                value={brandData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Website"
                                type="url"
                                name="website"
                                value={brandData.website}
                                onChange={handleInputChange}
                                required
                            />

                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Street Address"
                                type="text"
                                name="street_address"
                                value={brandData.street_address}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="City"
                                type="text"
                                name="city"
                                value={brandData.city}
                                onChange={handleInputChange}
                                required
                            />

                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="State"
                                type="text"
                                name="state"
                                value={brandData.state}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Country"
                                type="text"
                                name="country"
                                value={brandData.country}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Postal Code"
                                type="text"
                                name="postal_code"
                                value={brandData.postal_code}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        {isEditing && (
                            <div className="inputs-row" style={{ padding: "10px", flexDirection: "column", gap: "5px" }}>
                                <Checkbox
                                    label="Active Status"
                                    checked={brandData.status}
                                    onChange={handleStatusChange}
                                />
                            </div>
                        )}
                    </div>

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

export default Brand;
