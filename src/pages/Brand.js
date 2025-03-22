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

const Brand = () => {
    const { brands, loading, error, updateBrand, createBrand } = useBrands(); // API methods

    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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
        street_city: "",
        state: "",
        country: "",
        pin_code: "",
        status: true, // Default to active (checked)
    });

    const handleAddNewBrand = () => {
        setIsEditing(false);
        setBrandData({
            name: "",
            short_name: "",
            gst_no: "",
            license_no: "",
            food_license: "",
            phone: "",
            email: "",
            website: "",
            street_city: "",
            state: "",
            country: "",
            pin_code: "",
            status: true,
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
            street_city: brand.brand_address ? `${brand.brand_address.street_address}, ${brand.brand_address.city}` : "",
            state: brand.brand_address?.state || "",
            country: brand.brand_address?.country || "",
            pin_code: brand.brand_address?.code || "",
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
            brand_address: {
                street_address: brandData.street_city.split(",")[0]?.trim() || "",
                city: brandData.street_city.split(",")[1]?.trim() || "",
                state: brandData.state,
                country: brandData.country,
                code: brandData.pin_code,
            },
            status: isEditing ? (brandData.status ? "active" : "inactive") : "active", // Always active for new brand
        };

        if (isEditing) {
            updateBrand(brandData._id, formattedBrandData);
        } else {
            createBrand(formattedBrandData);
        }
        setShowPopup(false);
    };

    return (
        <>
            <HeadingText>Brand List</HeadingText>
            <div className="cards-container">
                {loading ? (
                    <p>Loading brands...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <>
                        {brands.map((brand) => (
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
                                label="Street & City"
                                type="text"
                                name="street_city"
                                value={brandData.street_city}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="State"
                                type="text"
                                name="state"
                                value={brandData.state}
                                onChange={handleInputChange}
                                required
                            />

                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Country"
                                type="text"
                                name="country"
                                value={brandData.country}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Pin Code"
                                type="text"
                                name="pin_code"
                                value={brandData.pin_code}
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
