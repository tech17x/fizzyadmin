// src/pages/Brand.js

import { useCallback, useEffect, useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import HeadingText from '../components/HeadingText';
import InputField from '../components/InputField';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import Checkbox from '../components/Checkbox';
import useFetchBrands from '../hooks/useFetchBrands';
import useFetchOutlets from '../hooks/useFetchOutlets';
import axios from 'axios';
import SearchFilterBar from '../components/SearchFilterBar';
import { toast } from 'react-toastify';
import useFilteredData from '../hooks/filterData';
import Loader from '../components/Loader';

const Staff = () => {
    const API = process.env.REACT_APP_API_URL;
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [staff, setStaff] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [showSecondScreen, setShowSecondScreen] = useState(false);
    const [showSecondScreenSection, setShowSecondScreenSection] = useState("PROFILE") // USER, BRAND, OUTLET

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(""); // Store selected role
    const [checkedPermissions, setCheckedPermissions] = useState({});

    const [staffInfo, setStaffInfo] = useState({
        _id: null,
        image: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        pos_login_pin: "",
        status: "",
        role: "",
        permissions: [],
        brands: [],
        outlets: [],
    });

    const fetchStaff = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/staff/staff/authorized`, {
                withCredentials: true,
            });

            if (response.data.success) {
                setStaff(response.data.data);
            } else {
                console.error("Error fetching staff data:", response.data.message);
            }
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleAddNewStaff = () => {
        setIsEditing(false);
        getRolesAndPermissions();
        setShowSecondScreen(true);
    }

    const handleStaffEdit = (staff) => {
        setIsEditing(true);
        getRolesAndPermissions(staff);
        setShowSecondScreen(true);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setStaffInfo((prevData) => ({
            ...prevData,
            [name]: value, // Updates the input field dynamically
            status: prevData.status === "active" ? "inactive" : "active", // Toggles status
        }));
    };

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    const getRolesAndPermissions = async (staff) => {
        setLoading(true);
        try {

            if (staff) {
                setStaffInfo({
                    _id: staff._id,
                    image: staff.image,
                    name: staff.name,
                    email: staff.email,
                    phone: staff.phone,
                    password: "",
                    pos_login_pin: "",
                    status: staff.status,
                    role: staff.role._id,
                    permissions: staff.permissions,
                    brands: staff.brands.map((brand) => brand._id),
                    outlets: staff.outlets.map((outlet) => outlet._id),
                });
            } else {
                setStaffInfo({
                    _id: null,
                    image: "",
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    pos_login_pin: "",
                    status: "active",
                    role: "",
                    permissions: [],
                    brands: [],
                    outlets: [],
                });
            }

            const response = await axios.get(`${API}/api/utils/roles-permissions`, {
                withCredentials: true,
            });

            if (response.data.success) {
                setRoles(response.data.data.roles);
                setPermissions(response.data.data.permissions);
                if (staff) {
                    const filterRole = response.data.data.roles.find((r) => r._id === staff.role._id);
                    if (filterRole) {
                        setSelectedRole(filterRole);
                        // Set permissions checked based on the selected role
                        // Initialize permissions object
                        const newCheckedPermissions = {};

                        // Mark only those permissions that exist in both staff.permissions and role.default_permissions
                        filterRole.default_permissions.forEach((perm) => {
                            newCheckedPermissions[perm] = staff.permissions.includes(perm);
                        });

                        setCheckedPermissions(newCheckedPermissions);
                    }
                }
            } else {
                console.error("Error fetching roles & permissions:", response.data.message);
                setRoles([]);
                setPermissions([]);
            }
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            setRoles([]);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle role selection
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        const filterRole = roles.find((r) => r._id === role._id);
        if (filterRole) {
            // Set permissions checked based on the selected role
            const newCheckedPermissions = {};
            filterRole.default_permissions.forEach((perm) => {
                newCheckedPermissions[perm] = true;
            });
            setCheckedPermissions(newCheckedPermissions);
        }
    };

    // Handle permission checkbox toggle
    const handlePermissionToggle = (perm) => {
        setCheckedPermissions((prev) => ({
            ...prev,
            [perm]: !prev[perm],
        }));
    };


    const handleBrandSelection = (brandId) => {
        const isAlreadySelected = staffInfo.brands.includes(brandId);

        if (!isAlreadySelected) {
            const relatedOutlets = outlets.filter((item) => item.brand_id === brandId);
            if (relatedOutlets.length === 0) {
                toast.info("No outlets found for the selected brand.");
            }

            setStaffInfo((prevState) => ({
                ...prevState,
                brands: [...prevState.brands, brandId],
            }));
        } else {
            // Remove any outlets related to this brand
            setStaffInfo((prevState) => {
                const updatedOutlets = prevState.outlets.filter((outletId) => {
                    const outlet = outlets.find(o => o._id === outletId);
                    return outlet && outlet.brand_id !== brandId;
                });

                return {
                    ...prevState,
                    brands: prevState.brands.filter((id) => id !== brandId),
                    outlets: updatedOutlets,
                };
            });
        }
    };


    const handleOutletSelection = (outletId) => {
        setStaffInfo((prevState) => {
            const isAlreadySelected = prevState.outlets.includes(outletId);

            return {
                ...prevState,
                outlets: isAlreadySelected
                    ? prevState.outlets.filter((id) => id !== outletId) // Remove if already selected
                    : [...prevState.outlets, outletId], // Add if not selected
            };
        });
    };

    const handleStatusChange = () => {
        setStaffInfo((prev) => ({
            ...prev,
            status: prev.status === "active" ? "inactive" : "active",
        }));
    };

    const handleStaffSave = async () => {
        setLoading(true);
        const errors = [];

        // Required Fields
        if (!staffInfo.name?.trim()) errors.push("Name is required.");
        if (!staffInfo.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffInfo.email))
            errors.push("Valid email is required.");
        if (!staffInfo.phone?.trim() || !/^\+?\d{10,15}$/.test(staffInfo.phone))
            errors.push("Valid phone number is required.");
        if (!selectedRole?._id) errors.push("Role is required.");

        const selectedPermissions = Object.keys(checkedPermissions).filter(key => checkedPermissions[key]);
        if (!selectedPermissions.length) errors.push("Permissions must contain at least one item.");

        if (!Array.isArray(staffInfo.brands) || staffInfo.brands.length === 0)
            errors.push("At least one brand is required.");
        if (!Array.isArray(staffInfo.outlets))
            errors.push("Outlets must be an array.");

        // Password
        if (!isEditing) {
            if (!staffInfo.password?.trim()) {
                errors.push("Password is required for new staff.");
            } else if (staffInfo.password.length < 6) {
                errors.push("Password must be at least 6 characters.");
            }
        } else if (staffInfo.password && staffInfo.password.length < 6) {
            errors.push("Password must be at least 6 characters.");
        }

        // POS PIN (Optional but must be valid if present)
        if (staffInfo.pos_login_pin && !/^\d{4}$/.test(staffInfo.pos_login_pin)) {
            errors.push("POS login PIN must be a 4-digit number.");
        }

        if (errors.length > 0) {
            errors.forEach(err => toast.error(err));
            setLoading(false);
            return;
        }

        // Format data to send
        const formattedStaffData = {
            image: staffInfo.image,
            name: staffInfo.name,
            email: staffInfo.email,
            phone: staffInfo.phone,
            role: selectedRole._id,
            permissions: selectedPermissions,
            brands: staffInfo.brands,
            outlets: staffInfo.outlets,
            status: isEditing ? staffInfo.status : "active",
        };

        if (staffInfo.password) {
            formattedStaffData.password = staffInfo.password;
        }

        if (staffInfo.pos_login_pin) {
            formattedStaffData.pos_login_pin = staffInfo.pos_login_pin;
        }

        try {
            if (isEditing) {
                await axios.put(`${API}/api/staff/update/${staffInfo._id}`, formattedStaffData, { withCredentials: true });
                toast.success("Staff updated successfully!");
            } else {
                await axios.post(`${API}/api/staff/create`, formattedStaffData, { withCredentials: true });
                toast.success("Staff created successfully!");
            }

            fetchStaff();
            setShowSecondScreen(false);
        } catch (error) {
            console.error("Error saving staff:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "An error occurred while saving staff.");
        } finally {
            setLoading(false);
        }
    };


    const filteredData = useFilteredData({
        data: staff,
        searchTerm: search,
        searchKeys: ['name', 'email', 'phone', "outlets.name", "role.name", "brands.full_name"],
        filters: { status: status },
    });

    return (
        <>
            {
                loading && <Loader />
            }
            <HeadingText>Staff</HeadingText>
            {
                !showSecondScreen ?
                    <div className="current-staff-info">
                        <SearchFilterBar
                            placeholder="Search Brand, Outlet, Staff..."
                            searchValue={search}
                            onSearchChange={setSearch}
                            statusValue={status}
                            onStatusChange={setStatus}
                        />

                        <div className="cards-container">
                            <>
                                {
                                    filteredData.map(staff => (
                                        <EditCard key={staff._id} firstLetter={staff.name.charAt(0)} title={staff.name} role={staff.role.name} time={formatDate(staff.createdAt)} status={staff.status} handleEdit={() => handleStaffEdit(staff)} />
                                    ))
                                }
                                <CardAdd handleAdd={handleAddNewStaff} />
                            </>
                        </div>

                    </div> :
                    <div className="add-new-staff-info">
                        <div className="step-links">
                            <div className="step-btns">
                                {
                                    showSecondScreenSection === 'PROFILE' ?
                                        <GradientButton>Profile</GradientButton>
                                        :
                                        <Button clickAction={() => setShowSecondScreenSection("PROFILE")}>Profile</Button>
                                }
                            </div>
                            <div className="step-btns">
                                {
                                    showSecondScreenSection === "USER" ?
                                        <GradientButton>User Permissions</GradientButton>
                                        :
                                        <Button clickAction={() => setShowSecondScreenSection("USER")}>User Permissions</Button>
                                }
                            </div>
                            <div className="step-btns">
                                {
                                    showSecondScreenSection === "BRAND" ?
                                        <GradientButton>Brand Permissions</GradientButton>
                                        :
                                        <Button clickAction={() => setShowSecondScreenSection("BRAND")}>Brand Permissions</Button>
                                }
                            </div>
                            <div className="step-btns">
                                {
                                    showSecondScreenSection === "OUTLET" ?
                                        <GradientButton>Outlet Permissions</GradientButton>
                                        :
                                        <Button disable={(staffInfo.brands.length > 0 && outlets.filter((item) => staffInfo.brands.includes(item.brand_id)).length > 0) ? false : true} clickAction={() => setShowSecondScreenSection("OUTLET")}>Outlet Permissions</Button>
                                }
                            </div>
                        </div>
                        {
                            showSecondScreenSection === "PROFILE" &&
                            <div className="profile-info">
                                <img src={staffInfo.image} alt="" onError={(e) => e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} style={{ borderRadius: "10%", height: "10rem", width: "10rem" }} />
                                <InputField
                                    label="Image"
                                    type="url"
                                    name={"image"}
                                    value={staffInfo.image || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Name"
                                    required
                                />
                                <InputField
                                    label="Name"
                                    type="text"
                                    name={"name"}
                                    value={staffInfo.name || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Name"
                                    required
                                />
                                <InputField
                                    label="Phone"
                                    type="tel"
                                    name={"phone"}
                                    value={staffInfo.phone || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Phone no"
                                    required
                                />
                                <InputField
                                    label="Email"
                                    type="email"
                                    name={"email"}
                                    value={staffInfo.email || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Email"
                                    required
                                />
                                <InputField
                                    label="Passowd"
                                    type="text"
                                    name={"password"}
                                    value={staffInfo.password || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Password"
                                    required
                                />
                                <InputField
                                    label="Pos Login Pin"
                                    type="number"
                                    name={"pos_login_pin"}
                                    value={staffInfo.pos_login_pin || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Pin"
                                    required
                                />
                                {isEditing && (
                                    <div className="inputs-row" style={{ padding: "10px", flexDirection: "column", gap: "5px" }}>
                                        <Checkbox
                                            label="Active Status"
                                            checked={staffInfo.status === "active"}
                                            onChange={handleStatusChange}
                                        />
                                    </div>
                                )}
                            </div>
                        }
                        {
                            showSecondScreenSection === "USER" &&
                            <div className="permissions">
                                {/* Roles Dropdown */}
                                <SelectInput
                                    label="Roles"
                                    options={roles.map((role) => ({ name: role.name, _id: role._id }))}
                                    placeholder="Select a Role"
                                    selectedOption={selectedRole}
                                    onChange={handleRoleChange}
                                />

                                <p style={{ margin: "1rem 0" }}>Permissions</p>

                                {/* Permissions Table */}
                                <table className="checkbox-table">
                                    <thead>
                                        <tr>
                                            <th>Features</th>
                                            <th>Capabilities</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from(new Set(permissions.map((p) => p.category))).map((category) => (
                                            <tr key={category}>
                                                <td>{category}</td>
                                                <td>
                                                    {permissions
                                                        .filter((p) => p.category === category)
                                                        .map((perm) => (
                                                            <Checkbox
                                                                disable={selectedRole.name === "Admin"}
                                                                key={perm._id}
                                                                label={perm.name}
                                                                checked={checkedPermissions[perm.name] || false}
                                                                onChange={() => handlePermissionToggle(perm.name)}
                                                            />
                                                        ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                        {
                            showSecondScreenSection === "BRAND" &&
                            <div className="brand-permissions">
                                <p>Permissions</p>
                                <div className="box">
                                    <div className="box-head">
                                        Brand
                                    </div>
                                    <div className="box-body">
                                        {
                                            brands.map((item, index) => (
                                                <Checkbox
                                                    key={index}
                                                    labelId={item._id}
                                                    label={item.short_name}
                                                    checked={staffInfo.brands.includes(item._id)}
                                                    onChange={() => handleBrandSelection(item._id)}
                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            showSecondScreenSection === "OUTLET" &&
                            <div className="brand-permissions">
                                <p>Permissions</p>
                                <div className="box">
                                    <div className="box-head">
                                        Outlet
                                    </div>
                                    <div className="box-body">
                                        {
                                            outlets
                                                .filter((item) => staffInfo.brands.includes(item.brand_id))
                                                .map((item, index) => (
                                                    <Checkbox
                                                        key={index}
                                                        label={item.name}
                                                        labelId={item._id}
                                                        checked={staffInfo.outlets.includes(item._id)}
                                                        onChange={() => handleOutletSelection(item._id)}
                                                    />
                                                ))
                                        }
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="sections-action-btns-container">
                            <GradientButton clickAction={handleStaffSave}>
                                {isEditing ? "Update" : "Save"}
                            </GradientButton>
                            <Button clickAction={() => { setShowSecondScreen(false); setShowSecondScreenSection('PROFILE'); }}>Close</Button>
                        </div>
                    </div>
            }
        </>
    )
}

export default Staff;
