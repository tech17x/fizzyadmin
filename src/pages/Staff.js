import { useCallback, useContext, useEffect, useState } from 'react';
import InputField from '../components/InputField';
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
import { Users, User, Shield, Building, Store, Settings, Award, UserPlus } from 'lucide-react';

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
    const [showSecondScreenSection, setShowSecondScreenSection] = useState("PROFILE");

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
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
            [name]: value,
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

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        const filterRole = roles.find((r) => r._id === role.value);
        if (filterRole) {
            const newCheckedPermissions = {};
            filterRole.default_permissions.forEach((perm) => {
                newCheckedPermissions[perm] = true;
            });
            setCheckedPermissions(newCheckedPermissions);
        }
    };

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
                    ? prevState.outlets.filter((id) => id !== outletId)
                    : [...prevState.outlets, outletId],
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

        if (!isEditing) {
            if (!staffInfo.password?.trim()) {
                errors.push("Password is required for new staff.");
            } else if (staffInfo.password.length < 6) {
                errors.push("Password must be at least 6 characters.");
            }
        } else if (staffInfo.password && staffInfo.password.length < 6) {
            errors.push("Password must be at least 6 characters.");
        }

        if (staffInfo.pos_login_pin && !/^\d{4}$/.test(staffInfo.pos_login_pin)) {
            errors.push("POS login PIN must be a 4-digit number.");
        }

        const isDuplicate = (field) => {
            return staff?.some((existingStaff) => {
                if (existingStaff._id === staffInfo._id) return false;

                const existingBrandIds = existingStaff.brands?.map(brand => brand._id) || [];
                const currentBrandIds = staffInfo.brands || [];

                const hasCommonBrand = existingBrandIds.some(id => currentBrandIds.includes(id));
                if (!hasCommonBrand) return false;

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

        if (staffInfo.password) {
            formattedStaffData.password = staffInfo.password;
        }

        if (staffInfo.pos_login_pin) {
            formattedStaffData.pos_login_pin = staffInfo.pos_login_pin;
        }

        try {
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
            {loading && <Loader />}
            
            {!showSecondScreen ? (
                <div className="space-y-6">
                    <TopBar
                        title="Staff Management"
                        searchText={search}
                        setSearchText={setSearch}
                        selectedFilter={status}
                        setSelectedFilter={setStatus}
                    />
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Staff</p>
                                    <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Staff</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {staff.filter(s => s.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Roles</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Set(staff.map(s => s.role.name)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {staff.filter(s => {
                                            const created = new Date(s.createdAt);
                                            const now = new Date();
                                            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                        }).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Staff Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Staff Directory</h2>
                                <p className="text-gray-600">Manage your team members</p>
                            </div>
                            <GradientButton clickAction={handleAddNewStaff}>
                                <UserPlus className="w-4 h-4" />
                                Add New Staff
                            </GradientButton>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredData.map((staffMember) => (
                                <div key={staffMember._id} className="group">
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-300">
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={staffMember.image}
                                                        onError={(e) => {
                                                            e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png";
                                                        }}
                                                        alt="Staff"
                                                        className="w-12 h-12 rounded-xl object-cover border-2 border-orange-200"
                                                    />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{staffMember.name}</h3>
                                                        <p className="text-sm text-orange-600 font-medium">{staffMember.role.name}</p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    staffMember.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {staffMember.status.charAt(0).toUpperCase() + staffMember.status.slice(1)}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{staffMember.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{staffMember.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-gray-400" />
                                                    <span>{staffMember.brands?.length || 0} brands</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-4 h-4 text-gray-400" />
                                                    <span>{staffMember.outlets?.length || 0} outlets</span>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleStaffEdit(staffMember)}
                                                    className="w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                                                >
                                                    Edit Staff
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
                                    </h2>
                                    <p className="text-orange-100">Configure staff information and permissions</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="border-b border-gray-200 px-8">
                            <nav className="flex space-x-8">
                                {[
                                    { id: 'PROFILE', label: 'Profile Information', icon: User },
                                    { id: 'USER', label: 'User Permissions', icon: Shield },
                                    { id: 'BRAND', label: 'Brand Access', icon: Building },
                                    { id: 'OUTLET', label: 'Outlet Access', icon: Store }
                                ].map((tab) => {
                                    const IconComponent = tab.icon;
                                    const isActive = showSecondScreenSection === tab.id;
                                    const isDisabled = (selectedRole?.label === "Admin" && isEditing && tab.id !== 'PROFILE');
                                    
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => !isDisabled && setShowSecondScreenSection(tab.id)}
                                            className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                                isActive
                                                    ? 'border-orange-500 text-orange-600'
                                                    : isDisabled
                                                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                            disabled={isDisabled}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="p-8">
                            {showSecondScreenSection === "PROFILE" && (
                                <div className="space-y-8">
                                    {/* Profile Image */}
                                    <div className="text-center">
                                        <img 
                                            src={staffInfo.image || "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} 
                                            alt="Staff Profile" 
                                            onError={(e) => e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} 
                                            className="w-24 h-24 rounded-xl object-cover border-4 border-orange-200 mx-auto shadow-lg"
                                        />
                                    </div>

                                    {/* Basic Info */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField
                                                label="Profile Image URL"
                                                type="text"
                                                name="image"
                                                value={staffInfo.image || ""}
                                                onChange={handleInputChange}
                                                placeholder="Enter image URL"
                                            />
                                            <InputField
                                                label="Full Name"
                                                type="text"
                                                name="name"
                                                value={staffInfo.name || ""}
                                                onChange={handleInputChange}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <PhoneNumberInput
                                                phoneNumber={phone}
                                                onPhoneNumberChange={(value) => { 
                                                    setPhone(value); 
                                                    setStaffInfo((prevData) => ({ ...prevData, phone: value })); 
                                                }}
                                                selectedCountry={selectedCountryCode}
                                                onCountryChange={(value) => { 
                                                    setSelectedCountryCode(value); 
                                                    setStaffInfo((prevData) => ({ ...prevData, country_code: value.value })); 
                                                }}
                                                countryOptions={countryCodeOptions}
                                            />
                                            <InputField
                                                label="Email Address"
                                                type="email"
                                                name="email"
                                                value={staffInfo.email || ""}
                                                onChange={handleInputChange}
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Security */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField
                                                label="Password"
                                                type="password"
                                                name="password"
                                                value={staffInfo.password || ""}
                                                onChange={handleInputChange}
                                                placeholder="Enter password"
                                                required={!isEditing}
                                            />
                                            <InputField
                                                label="POS PIN"
                                                type="text"
                                                name="pos_login_pin"
                                                format="####"
                                                value={staffInfo.pos_login_pin || ""}
                                                onChange={handleInputChange}
                                                placeholder="Enter 4-digit PIN"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="p-6 bg-gray-50 rounded-xl">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Settings</h3>
                                            <Checkbox
                                                label="Active Status"
                                                checked={staffInfo.status}
                                                onChange={handleStatusChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {showSecondScreenSection === "USER" && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Role & Permissions</h3>
                                        <SelectInput
                                            label="Select Role"
                                            options={roles.map((role) => ({ label: role.name, value: role._id }))}
                                            placeholder="Select a Role"
                                            selectedOption={selectedRole}
                                            onChange={handleRoleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Permissions</h3>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-200">
                                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature Category</th>
                                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Available Permissions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Array.from(new Set(permissions.map((p) => p.category))).map((category) => (
                                                            <tr key={category} className="border-b border-gray-100">
                                                                <td className="py-4 px-4 font-medium text-gray-900">{category}</td>
                                                                <td className="py-4 px-4">
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {permissions
                                                                            .filter((p) => p.category === category)
                                                                            .map((perm) => (
                                                                                <Checkbox
                                                                                    disable={selectedRole?.label === "Admin"}
                                                                                    key={perm._id}
                                                                                    label={perm.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                                    checked={checkedPermissions[perm.name] || false}
                                                                                    onChange={() => handlePermissionToggle(perm.name)}
                                                                                />
                                                                            ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showSecondScreenSection === "BRAND" && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Brand Access</h3>
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h4 className="font-medium text-gray-700 mb-4">Select accessible brands</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {brands.map((item) => (
                                                <Checkbox
                                                    key={item._id}
                                                    labelId={item._id}
                                                    label={item.full_name}
                                                    checked={staffInfo.brands.includes(item._id)}
                                                    onChange={() => handleBrandSelection(item._id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showSecondScreenSection === "OUTLET" && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Outlet Access</h3>
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h4 className="font-medium text-gray-700 mb-4">Select accessible outlets</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {outlets
                                                .filter((item) => staffInfo.brands.includes(item.brand_id))
                                                .map((item) => (
                                                    <Checkbox
                                                        key={item._id}
                                                        label={item.name}
                                                        labelId={item._id}
                                                        checked={staffInfo.outlets.includes(item._id)}
                                                        onChange={() => handleOutletSelection(item._id)}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
                                <Button clickAction={() => { 
                                    setShowSecondScreen(false); 
                                    setShowSecondScreenSection('PROFILE'); 
                                }}>
                                    Cancel
                                </Button>
                                <GradientButton clickAction={handleStaffSave}>
                                    {isEditing ? "Update Staff" : "Create Staff"}
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Staff;