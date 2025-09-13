// src/pages/Brand.js

import { useCallback, useContext, useEffect, useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import InputField from '../components/InputField';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import Checkbox from '../components/Checkbox';
import axios from 'axios';
import { toast } from 'react-toastify';
import useFilteredData from '../hooks/filterData';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import TopBar from '../components/TopBar';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { countryCodeOptions } from '../constants/countryOptions';

const Staff = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff: currentStaff, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [staff, setStaff] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [showSecondScreen, setShowSecondScreen] = useState(false);
    const [showSecondScreenSection, setShowSecondScreenSection] = useState("PROFILE") // USER, BRAND, OUTLET

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null); // Store selected role
    const [checkedPermissions, setCheckedPermissions] = useState({});

    const [staffInfo, setStaffInfo] = useState({
        _id: null,
        image: "",
        name: "",
        email: "",
        phone: "",
        country_code: countryCodeOptions[1].value,
        password: "",
        pos_login_pin: "",
        status: true,
        role: "",
        permissions: [],
        brands: [],
        outlets: [],
    });

    const [phone, setPhone] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodeOptions[1]);

    useEffect(() => {
        if (currentStaff.permissions?.includes('staff_manage')) {
            setOutlets(currentStaff.outlets);
            setBrands(currentStaff.brands);
            setLoading(false);
        } else {
            logout();
        }
    }, [currentStaff, logout]);

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
                    country_code: staff.country_code,
                    password: "",
                    pos_login_pin: "",
                    status: staff.status === "active" ? true : false,
                    role: staff.role._id,
                    permissions: staff.permissions,
                    brands: staff.brands.map((brand) => brand._id),
                    outlets: staff.outlets.map((outlet) => outlet._id),
                });
                setPhone(staff.phone);
                setSelectedCountryCode(countryCodeOptions.find(opt => opt.value === staff.country_code) || null);
            } else {
                setStaffInfo({
                    _id: null,
                    image: "",
                    name: "",
                    email: "",
                    phone: "",
                    country_code: countryCodeOptions[1].value,
                    password: "",
                    pos_login_pin: "",
                    status: true,
                    role: "",
                    permissions: [],
                    brands: [],
                    outlets: [],
                });
                setPhone("");
                setSelectedCountryCode(countryCodeOptions[1]);
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
                        setSelectedRole({ label: filterRole.name, value: filterRole._id });
                        // Set permissions checked based on the selected role
                        const newCheckedPermissions = {};
                        filterRole.default_permissions.forEach((perm) => {
                            newCheckedPermissions[perm] = true;
                        });
                        setCheckedPermissions(newCheckedPermissions);
                    }
                } else {
                    const defaultRole = response.data.data.roles[4];
                    handleRoleChange({ label: defaultRole.name, value: defaultRole._id });
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
        const filterRole = roles.find((r) => r._id === role.value);
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
            status: prev.status ? false : true,
        }));
    };

    const handleStaffSave = async () => {
        setLoading(true);
        const errors = [];

        // Required Fields
        if (!staffInfo.name?.trim()) errors.push("Name is required.");
        if (!staffInfo.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffInfo.email))
            errors.push("Valid email is required.");
        if (!staffInfo.phone?.trim())
            errors.push("Valid phone number is required.");
        if (!selectedRole?.value) errors.push("Role is required.");

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

        // Uniqueness check for staff info within a specific brand
        const isDuplicate = (field) => {
            return staff?.some((existingStaff) => {
                if (existingStaff._id === staffInfo._id) return false; // skip self

                const existingBrandIds = existingStaff.brands?.map(brand => brand._id) || [];
                const currentBrandIds = staffInfo.brands || [];

                // Check if there is any overlapping brand ID
                const hasCommonBrand = existingBrandIds.some(id => currentBrandIds.includes(id));
                if (!hasCommonBrand) return false;

                // Compare the given field (name, email, phone)
                const existingField = existingStaff[field]?.trim().toLowerCase();
                const currentField = staffInfo[field]?.trim().toLowerCase();

                return existingField === currentField;
            });
        };


        if (staffInfo.name && isDuplicate("name")) {
            errors.push("Name already exists for this brand.");
        }

        if (staffInfo.email && isDuplicate("email")) {
            errors.push("Email already exists for this brand.");
        }

        if (staffInfo.phone && isDuplicate("phone")) {
            errors.push("Phone already exists for this brand.");
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
            country_code: staffInfo.country_code,
            role: selectedRole.value,
            permissions: selectedPermissions,
            brands: staffInfo.brands,
            outlets: staffInfo.outlets,
            status: isEditing ? staffInfo.status ? "active" : "inactive" : "active",
            owner_id: currentStaff.owner_id,
        };

        console.log(formattedStaffData);

        if (staffInfo.password) {
            formattedStaffData.password = staffInfo.password;
        }

        if (staffInfo.pos_login_pin) {
            formattedStaffData.pos_login_pin = staffInfo.pos_login_pin;
        }

        try {
            // Prevent current user from updating their own status
            if (isEditing && staffInfo._id === currentStaff._id && !staffInfo.status) {
                toast.error("You cannot change logged in user status.");
                return;
            }

            if (isEditing) {
                const response = await axios.put(`${API}/api/staff/update/${staffInfo._id}`, formattedStaffData, { withCredentials: true });
                const updatedStaff = response.data.staff;

                setStaff((prev) =>
                    prev.map((staff) =>
                        staff._id === staffInfo._id ? updatedStaff : staff
                    )
                );
                toast.success("Staff updated successfully!");
            } else {
                const response = await axios.post(`${API}/api/staff/create`, formattedStaffData, { withCredentials: true });
                setStaff((prev) => [...prev, response.data.staff]);
                toast.success("Staff created successfully!");
            }
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
            {
                !showSecondScreen ?
                    <div className="space-y-6 animate-fade-in">
                        <TopBar
                            title="Staff"
                            searchText={search}
                            setSearchText={setSearch}
                            selectedFilter={status}
                            setSelectedFilter={setStatus}
                        />
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Staff Management</h2>
                                    <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
                                </div>
                                <button 
                                    onClick={handleAddNewStaff}
                                    className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Staff
                                </button>
                            </div>
                            <div className="cards-container">
                            <>
                                {
                                    filteredData.map(staff => (
                                        <EditCard key={staff._id} firstLetter={staff.name.charAt(0)} title={staff.name} role={staff.role.name} time={formatDate(staff.createdAt)} status={staff.status} handleEdit={() => handleStaffEdit(staff)} />
                                    ))
                                }
                            </>
                            </div>
                        </div>
                    </div> :
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-slide-in">
                        <div className="step-links">
                            <div className="step-btns">
                                {
                                    showSecondScreenSection === 'PROFILE' ?
                                        <GradientButton>Profile</GradientButton>
                                        :
                                        <Button clickAction={() => setShowSecondScreenSection("PROFILE")}>Profile</Button>
                                }
                            </div>
                            {
                                (selectedRole && selectedRole.label === "Admin" && isEditing) ? null :
                                    <>
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
                                    </>
                            }
                        </div>
                        {
                            showSecondScreenSection === "PROFILE" &&
                            <div className="profile-info">
                                <img src={staffInfo.image} alt="" onError={(e) => e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} style={{ borderRadius: "10%", height: "10rem", width: "10rem" }} />

                                <InputField
                                    label="Image"
                                    type="text"
                                    name={"image"}
                                    value={staffInfo.image || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Image url"
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
                                <PhoneNumberInput
                                    phoneNumber={phone}
                                    onPhoneNumberChange={(value) => { setPhone(value); setStaffInfo((prevData) => ({ ...prevData, phone: value })); }}
                                    selectedCountry={selectedCountryCode}
                                    onCountryChange={(value) => { setSelectedCountryCode(value); setStaffInfo((prevData) => ({ ...prevData, country_code: value.value })); }}
                                    countryOptions={countryCodeOptions}
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
                                    label="Pos pin"
                                    type="text"
                                    name={"pos_login_pin"}
                                    format={"####"}
                                    value={staffInfo.pos_login_pin || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter Password"
                                    required
                                />

                                {isEditing && (
                                    <div className="inputs-row checkbox-input">
                                        <Checkbox
                                            label="Active Status"
                                            checked={staffInfo.status}
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
                                    options={roles.map((role) => ({ label: role.name, value: role._id }))}
                                    placeholder="Select a Role"
                                    selectedOption={selectedRole}
                                    onChange={handleRoleChange}
                                />

                                <p style={{ margin: "1rem 0" }}>Permissions</p>

                                {/* Permissions Table */}
                                <div className="table-overflow">
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
                                                                    disable={selectedRole.label === "Admin"}
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
                                                    label={item.full_name}
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
