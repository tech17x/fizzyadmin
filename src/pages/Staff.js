// src/pages/Brand.js

import { useEffect, useState } from 'react';
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

const Staff = () => {
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [staff, setStaff] = useState([]);
    const [brandOutlet, setBrandOutlet] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showSecondScreen, setShowSecondScreen] = useState(false);
    const [showSecondScreenSection, setShowSecondScreenSection] = useState("PROFILE") // USER, BRAND, OUTLET
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(""); // Store selected role
    const [checkedPermissions, setCheckedPermissions] = useState({});
    const [staffInfo, setStaffInfo] = useState({
        _id: null,
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
    const [disableBtn, setDisableBtn] = useState(true);

    useEffect(() => {
        setSelectedOutlet(null);
    }, [selectedBrand])

    useEffect(() => {
        // Required fields excluding password
        const requiredFields = ["name", "email", "phone", "pos_login_pin"];
    
        // Check if any required field is empty
        const isMissing = requiredFields.some(field => !staffInfo[field]);
    
        // Ensure permissions, brands, and outlets are not empty
        const hasNoPermissions = Object.values(checkedPermissions).filter(Boolean).length === 0; // Check if any permission is true
        const hasNoBrands = staffInfo.brands.length === 0;
        const hasNoOutlets = staffInfo.outlets.length === 0;
    
        // Check password condition
        const isPasswordMissing = !isEditing && !staffInfo.password;
    
        // Update staffInfo role & permissions if selectedRole is set
        if (selectedRole) {
            setStaffInfo(prev => ({
                ...prev,
                role: selectedRole._id, // Update role
                permissions: Object.keys(checkedPermissions).filter(key => checkedPermissions[key]), // Convert selected permissions to an array
            }));
        }
    
        // Set disableBtn based on conditions
        setDisableBtn(isMissing || isPasswordMissing || hasNoPermissions || hasNoBrands || hasNoOutlets);
    }, [staffInfo, isEditing, selectedRole, checkedPermissions]);
    

    const getStaffData = async () => {
        if (!selectedBrand?._id || !selectedOutlet?._id) {
            return;
        }

        try {
            const response = await axios.get("http://localhost:5001/api/staff/staff", {
                params: {
                    brand_id: selectedBrand._id,
                    outlet_id: selectedOutlet._id,
                },
                withCredentials: true,
            });

            if (response.data.success) {
                setStaff(response.data.data);
                setBrandOutlet({
                    brand: selectedBrand,
                    outlet: selectedOutlet
                })
            } else {
                console.error("Error fetching staff data:", response.data.message);
                return [];
            }
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            return [];
        }
    };

    const handleAddNewStaff = () => {
        setIsEditing(false);
        getRolesAndPermissions();
        setShowSecondScreen(true);
        setStaffInfo({
            _id: null,
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
    }

    const handleStaffEdit = (staff) => {
        setIsEditing(true);
        setShowSecondScreen(true);
        setStaffInfo({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            password: "",
            pos_login_pin: staff.pos_login_pin,
            status: staff.status,
            role: staff.role,
            permissions: staff.permissions,
            brands: staff.brands,
            outlets: staff.outlets,
        });
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

    const handleBrandSelection = (brandId) => {
        setStaffInfo((prevState) => {
            const isAlreadySelected = prevState.brands.includes(brandId);

            return {
                ...prevState,
                brands: isAlreadySelected
                    ? prevState.brands.filter((id) => id !== brandId) // Remove if already selected
                    : [...prevState.brands, brandId], // Add if not selected
            };
        });
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


    const getRolesAndPermissions = async () => {
        try {
            const response = await axios.get("http://localhost:5001/api/utils/roles-permissions", {
                withCredentials: true,
            });

            if (response.data.success) {
                console.log("Roles & Permissions Data:", response.data.data);
                setRoles(response.data.data.roles);
                setPermissions(response.data.data.permissions);
                const filterRole = response.data.data.roles.find((r) => r.name === staffInfo.role);
                if (filterRole) {
                    setSelectedRole(filterRole);
                    // Set permissions checked based on the selected role
                    // Initialize permissions object
                    const newCheckedPermissions = {};

                    // Mark only those permissions that exist in both staff.permissions and role.default_permissions
                    filterRole.default_permissions.forEach((perm) => {
                        newCheckedPermissions[perm] = staffInfo.permissions.includes(perm);
                    });

                    setCheckedPermissions(newCheckedPermissions);
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

    return (
        <>
            <HeadingText>Staff</HeadingText>
            {
                !showSecondScreen ?
                    <div className="current-staff-info">
                        <div className="brand-filter">
                            <div className="two-col-row">
                                <SelectInput
                                    selectedOption={selectedBrand}
                                    onChange={setSelectedBrand}
                                    options={brands}
                                    label="Brand Name"
                                />
                                <SelectInput
                                    disable={!selectedBrand}
                                    selectedOption={selectedOutlet}
                                    onChange={setSelectedOutlet}
                                    options={outlets.filter(outlet => outlet.brand_id === selectedBrand?._id)}
                                    label="Outlet Name"
                                />
                            </div>
                            <div className="filter-action-btns">
                                <GradientButton clickAction={getStaffData}>Submit</GradientButton>
                                <Button clickAction={() => { setSelectedBrand(null); setBrandOutlet(null) }}>Reset</Button>
                            </div>
                        </div>

                        {
                            brandOutlet &&
                            <>
                                <HeadingText>Staff List</HeadingText>
                                <div className="cards-container">
                                    {
                                        staff && staff.map(staff => (
                                            <EditCard firstLetter={staff.name.charAt(0)} title={staff.name} role={staff.role} location={brandOutlet.brand.short_name + " " + brandOutlet.outlet.name} time={formatDate(staff.createdAt)} status={staff.status} handleEdit={() => handleStaffEdit(staff)} />
                                        ))
                                    }
                                    <CardAdd handleAdd={handleAddNewStaff} />
                                </div>
                            </>
                        }

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
                                        <Button clickAction={() => { setShowSecondScreenSection("USER"); getRolesAndPermissions(); }}>User Permissions</Button>
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
                                        <Button clickAction={() => setShowSecondScreenSection("OUTLET")}>Outlet Permissions</Button>
                                }
                            </div>
                        </div>
                        {
                            showSecondScreenSection === "PROFILE" &&
                            <div className="profile-info">
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
                            <GradientButton disable={disableBtn}>Update</GradientButton>
                            <Button clickAction={()=>{setShowSecondScreen(false);setShowSecondScreenSection('PROFILE');}}>Close</Button>
                        </div>
                    </div>
            }
        </>
    )
}

export default Staff;
