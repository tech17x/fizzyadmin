import { useCallback, useEffect, useState } from "react";
import CardAdd from "../components/CardAdd";
import EditCard from "../components/EditCard";
import HeadingText from "../components/HeadingText";
import InputField from "../components/InputField";
import Popup from "../components/Popup";
import "./Brand.css";
import GradientButton from "../components/GradientButton";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Checkbox from "../components/Checkbox";
import SearchFilterBar from "../components/SearchFilterBar";
import { toast } from "react-toastify";
import axios from "axios";
import useFilteredData from "../hooks/filterData";


const Brand = () => {
    const API = process.env.REACT_APP_API_URL;
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [brandData, setBrandData] = useState({
        _id: "",
        full_name: "",
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

    const fetchBrands = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/brands`, {
                withCredentials: true,
            });
            setBrands(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch brands.");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]); // No warning, fetchBrands is memoized

    const handleAddNewBrand = () => {
        setIsEditing(false);
        setBrandData({
            _id: "",
            full_name: "",
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
            full_name: brand.full_name || "",
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
        setLoading(true);
        const formattedBrandData = {
            ...brandData,
            status: isEditing ? (brandData.status ? "active" : "inactive") : "active", // Always active for new brand
        };

        const errors = validateBrandData(formattedBrandData, brands);
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((msg) => toast.error(msg));
            setTimeout(() => {
                setLoading(false);
            }, 1000);
            return;
        }

        if (isEditing) {
            updateBrand(brandData._id, formattedBrandData);
        } else {
            createBrand(formattedBrandData);
        }

    };

    const validateBrandData = (brandData, brands) => {
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
        if (!brandData.postal_code) errors.postal_code = "Postal code is required.";
        if (!brandData.street_address) errors.street_address = "Street address is required.";

        // Format validations
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (brandData.email && !emailRegex.test(brandData.email)) {
            errors.email = "Invalid email format.";
        }

        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (brandData.phone && !phoneRegex.test(brandData.phone)) {
            errors.phone = "Invalid phone number format. Use ###-###-####";
        }

        // Uniqueness check
        const isDuplicate = (field) => {
            return brands?.some((brand) =>
                brand[field]?.trim().toLowerCase() === brandData[field]?.trim().toLowerCase() &&
                brand._id !== brandData._id
            );
        };

        if (brandData.full_name && isDuplicate("full_name")) {
            errors.full_name = "Full name already exists.";
        }

        if (brandData.short_name && isDuplicate("short_name")) {
            errors.short_name = "Short name already exists.";
        }

        if (brandData.email && isDuplicate("email")) {
            errors.email = "Email already exists.";
        }

        if (brandData.phone && isDuplicate("phone")) {
            errors.phone = "Phone number already exists.";
        }

        if (brandData.gst_no && isDuplicate("gst_no")) {
            errors.gst_no = "GST number already exists.";
        }

        if (brandData.license_no && isDuplicate("license_no")) {
            errors.license_no = "License number already exists.";
        }

        if (brandData.food_license && isDuplicate("food_license")) {
            errors.food_license = "Food license number already exists.";
        }

        if (brandData.website && isDuplicate("website")) {
            errors.website = "Website already exists.";
        }

        return errors;
    };


    const createBrand = async (brandData) => {
        try {
            const response = await axios.post(`${API}/api/brands`, brandData, {
                withCredentials: true,
            });
            setBrands((prevBrands) => [...prevBrands, response.data.brand]); // Append new brand
            setShowPopup(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create brand.");
        } finally {
            setLoading(false);
        }
    };

    const updateBrand = async (brandId, updatedData) => {
        try {
            const response = await axios.put(
                `${API}/api/brands/${brandId}`,
                updatedData,
                { withCredentials: true }
            );

            // Extract updated brand from response
            const updatedBrand = response.data.brand;

            setBrands((prevBrands) =>
                prevBrands.map((brand) =>
                    brand._id === brandId ? updatedBrand : brand
                )
            );

            setShowPopup(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update brand.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {
                loading && <Loader />
            }
            <HeadingText title={"Brand"}/>
            
            <SearchFilterBar
                placeholder="Find what you’re looking for..."
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={status}
                onStatusChange={setStatus}
            />
            <div className="cards-container">
                {useFilteredData({
                    data: brands,
                    searchTerm: search,
                    searchKeys: ["full_name", "short_name", "email", "phone", "website", "city", "state", "country", "postal_code", "street"],
                    filters: {
                        status: status,
                    },
                }).map((brand) => (
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
                                name="full_name"
                                value={brandData.full_name}
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
                                format={"###-###-####"}
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
