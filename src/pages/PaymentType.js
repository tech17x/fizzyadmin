import { useCallback, useContext, useEffect, useState } from 'react';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import SelectInput from '../components/SelectInput';
import { toast } from 'react-toastify';
import axios from 'axios';
import useFilteredData from '../hooks/filterData';
import Loader from '../components/Loader';
import TopBar from '../components/TopBar';
import AuthContext from '../context/AuthContext';
import { CreditCard, Plus } from 'lucide-react';

const PaymentType = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);

    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    const [paymentInfo, setPaymentInfo] = useState({
        _id: '',
        name: '',
        status: 'active',
        brand_id: '',
        outlet_id: ''
    });

    useEffect(() => {
        if (staff.permissions?.includes('payment_type_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    const fetchPaymentTypes = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/payment-type/accessible`, {
                withCredentials: true,
            });
            setPaymentTypes(res.data?.paymentTypes || []);
        } catch (err) {
            console.error("Error fetching payment types:", err);
            toast.error(err?.response?.data?.message || "Failed to fetch payment types");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchPaymentTypes();
    }, [fetchPaymentTypes]);

    const handleAdd = () => {
        setIsEditing(false);
        setPaymentInfo({
            _id: '',
            name: '',
            status: 'active',
            brand_id: '',
            outlet_id: '',
        });
        setFilteredOutlets([]);
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setShowPopup(true);
    };

    const handleEdit = (type) => {
        setIsEditing(true);
        const brand = brands.find(b => b._id === type.brand_id?._id);
        const outletOptions = outlets.filter(outlet => outlet.brand_id === brand?._id);
        const outlet = outlets.find(outlet => outlet._id === type.outlet_id?._id);

        setPaymentInfo({
            _id: type._id,
            name: type.name,
            status: type.status,
            brand_id: type.brand_id?._id || '',
            outlet_id: type.outlet_id?._id || ''
        });
        setSelectedBrand({label: brand.full_name, value : brand._id});
        setFilteredOutlets(outletOptions);
        setSelectedOutlet(outlet ? { label: outlet.name, value: outlet._id } : null);
        setShowPopup(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter(outlet => outlet.brand_id === brand.value);
        setFilteredOutlets(filtered);
        if (filtered.length === 0) {
            toast.error("Selected brand has no outlets.");
        }
    };

    const handleSave = async () => {
        if (!paymentInfo.name || paymentInfo.name.trim().length < 3) {
            toast.error("Payment name must be at least 3 characters long.");
            return;
        }
        if (paymentInfo.name.trim().length > 50) {
            toast.error("Payment name cannot exceed 50 characters.");
            return;
        }
        if (!paymentInfo.status) {
            toast.error("Please select a status.");
            return;
        }
        if (!selectedBrand?.value) {
            toast.error("Please select a brand.");
            return;
        }
        if (!selectedOutlet?.value) {
            toast.error("Please select an outlet.");
            return;
        }

        const isDuplicate = (field) => {
            return paymentTypes?.some((type) => {
                return (
                    type.outlet_id._id === selectedOutlet?.value &&
                    type[field]?.trim().toLowerCase() === paymentInfo[field]?.trim().toLowerCase() &&
                    type._id !== paymentInfo._id
                );
            });
        };

        if (paymentInfo.name && isDuplicate("name")) {
            toast.error("Name already exists for this Outlet.");
            setLoading(false);
            return;
        }

        setLoading(true);
        const payload = {
            name: paymentInfo.name.trim(),
            status: paymentInfo.status,
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
        };

        try {
            if (isEditing) {
                await axios.put(`${API}/api/payment-type/update/${paymentInfo._id}`, payload, {
                    withCredentials: true,
                });
                toast.success("Payment type updated successfully!");
            } else {
                await axios.post(`${API}/api/payment-type/create`, payload, {
                    withCredentials: true,
                });
                toast.success("Payment type created successfully!");
            }
            fetchPaymentTypes();
            setShowPopup(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save payment type");
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useFilteredData({
        data: paymentTypes,
        searchTerm: search,
        searchKeys: ["name", "brand_id.full_name", "outlet_id.name"],
        filters: { status: status },
    });

    return (
        <>
            {loading && <Loader />}

            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="p-6">
                            <HeadingText title={isEditing ? "Edit Payment Type" : "Add Payment Type"} />
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectInput
                                        label="Select Brand"
                                        selectedOption={selectedBrand}
                                        onChange={handleBrandSelection}
                                        options={brands.map(o=>({label: o.full_name, value : o._id}))}
                                        required
                                    />
                                    <SelectInput
                                        disable={filteredOutlets.length === 0}
                                        label="Select Outlet"
                                        selectedOption={selectedOutlet}
                                        onChange={setSelectedOutlet}
                                        options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                                        placeholder={!selectedBrand ? "Select brand first" : "Select outlet"}
                                        required
                                    />
                                </div>
                                
                                <InputField
                                    label="Payment Method Name"
                                    name="name"
                                    type="text"
                                    value={paymentInfo.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Cash, Credit Card, UPI"
                                    required
                                />

                                {isEditing && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <Checkbox
                                            label="Active Status"
                                            checked={paymentInfo.status === 'active'}
                                            onChange={() =>
                                                setPaymentInfo(prev => ({
                                                    ...prev,
                                                    status: prev.status === 'active' ? 'inactive' : 'active',
                                                }))
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                <Button clickAction={() => setShowPopup(false)}>
                                    Cancel
                                </Button>
                                <GradientButton clickAction={handleSave}>
                                    {isEditing ? 'Update' : 'Create'}
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <TopBar
                    title="Payment Type Management"
                    searchText={search}
                    setSearchText={setSearch}
                    selectedFilter={status}
                    setSelectedFilter={setStatus}
                />
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Payment Types ({paymentTypes.length})</h2>
                            <p className="text-gray-600">Configure payment methods</p>
                        </div>
                        <GradientButton clickAction={handleAdd}>
                            <Plus className="w-4 h-4" />
                            Add Payment Type
                        </GradientButton>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((type) => (
                                    <tr key={type._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary-gradient rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {type.brand_id?.full_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {type.outlet_id?.name || "All Outlets"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                type.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {type.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(type)}
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

export default PaymentType;