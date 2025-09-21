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
import { Users, Plus, User, Shield, Building, Store } from 'lucide-react';
import HeadingText from '../components/HeadingText';

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
    const [showPopup, setShowPopup] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

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
        setCurrentStep(1);
        getRolesAndPermissions();
        setShowPopup(true);
    }

    const handleStaffEdit = (staff) => {
        setIsEditing(true);
        setCurrentStep(1);
        getRolesAndPermissions(staff);
        setShowPopup(true);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStaffInfo((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

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
            setShowPopup(false);
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Full Name"
                                type="text"
                                name="name"
                                value={staffInfo.name || ""}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                required
                            />
                            <InputField
                                label="Email"
                                type="email"
                                name="email"
                                value={staffInfo.email || ""}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                required
                            />
                        </div>

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

                        <div className="grid grid-cols-2 gap-4">
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
                                placeholder="4-digit PIN"
                            />
                        </div>

                        <InputField
                            label="Profile Image URL"
                            type="text"
                            name="image"
                            value={staffInfo.image || ""}
                            onChange={handleInputChange}
                            placeholder="Enter image URL"
                        />

                        {isEditing && (
                            <div className="pt-4 border-t border-gray-200">
                                <Checkbox
                                    label="Active Status"
                                    checked={staffInfo.status}
                                    onChange={handleStatusChange}
                                />
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <SelectInput
                            label="Select Role"
                            options={roles.map((role) => ({ label: role.name, value: role._id }))}
                            selectedOption={selectedRole}
                            onChange={handleRoleChange}
                            required
                        />

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4">Permissions</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from(new Set(permissions.map((p) => p.category))).map((category) => (
                                    <div key={category} className="space-y-2">
                                        <h5 className="text-sm font-medium text-gray-700">{category}</h5>
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
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-4">Select Brands</h4>
                            <div className="grid grid-cols-2 gap-4">
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

                        <div>
                            <h4 className="font-medium text-gray-900 mb-4">Select Outlets</h4>
                            <div className="grid grid-cols-2 gap-4">
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
                );
            default:
                return null;
        }
    };

    return (
        <>
            {loading && <Loader />}
            
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <HeadingText title={isEditing ? "Edit Staff" : "Add New Staff"} />
                            
                            {/* Step Navigation */}
                            <div className="flex items-center justify-center mb-8">
                                {[
                                    { step: 1, label: 'Profile', icon: User },
                                    { step: 2, label: 'Role & Permissions', icon: Shield },
                                    { step: 3, label: 'Access', icon: Building }
                                ].map(({ step, label, icon: Icon }) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                            currentStep === step 
                                                ? 'bg-primary-gradient text-white' 
                                                : currentStep > step 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`ml-2 text-sm font-medium ${
                                            currentStep === step ? 'text-primary-orange' : 'text-gray-500'
                                        }`}>
                                            {label}
                                        </span>
                                        {step < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
                                    </div>
                                ))}
                            </div>

                            {renderStepContent()}

                            <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
                                <div>
                                    {currentStep > 1 && (
                                        <Button clickAction={() => setCurrentStep(currentStep - 1)}>
                                            Previous
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button clickAction={() => setShowPopup(false)}>
                                        Cancel
                                    </Button>
                                    {currentStep < 3 ? (
                                        <GradientButton clickAction={() => setCurrentStep(currentStep + 1)}>
                                            Next
                                        </GradientButton>
                                    ) : (
                                        <GradientButton clickAction={handleStaffSave}>
                                            {isEditing ? "Update" : "Create"}
                                        </GradientButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <TopBar
                    title="Staff Management"
                    searchText={search}
                    setSearchText={setSearch}
                    selectedFilter={status}
                    setSelectedFilter={setStatus}
                />
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Staff ({staff.length})</h2>
                            <p className="text-gray-600">Manage your team members</p>
                        </div>
                        <GradientButton clickAction={handleAddNewStaff}>
                            <Plus className="w-4 h-4" />
                            Add Staff
                        </GradientButton>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((staffMember) => (
                                    <tr key={staffMember._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={staffMember.image}
                                                    onError={(e) => {
                                                        e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png";
                                                    }}
                                                    alt="Staff"
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {staffMember._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{staffMember.email}</div>
                                            <div className="text-sm text-gray-500">{staffMember.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-light text-primary-orange">
                                                {staffMember.role.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{staffMember.brands?.length || 0} brands</div>
                                            <div className="text-sm text-gray-500">{staffMember.outlets?.length || 0} outlets</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                staffMember.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {staffMember.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleStaffEdit(staffMember)}
                                                className="text-primary-orange hover:text-orange-700"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Staff;