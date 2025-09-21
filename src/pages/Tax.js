// src/pages/Tax.js

import { useCallback, useContext, useEffect, useState } from 'react';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import InputField from '../components/InputField';
import Checkbox from '../components/Checkbox';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../components/Loader';
import useFilteredData from '../hooks/filterData';
import TopBar from '../components/TopBar';
import AuthContext from '../context/AuthContext';
import HeadingText from '../components/HeadingText';
import { Edit, Trash2 } from 'lucide-react';

const Tax = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);

    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [taxName, setTaxName] = useState("");
    const [displayTaxName, setDisplayTaxName] = useState("");
    const [taxValue, setTaxValue] = useState("");
    const [taxStatus, setTaxStatus] = useState(true);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [taxId, setTaxId] = useState(null);

    useEffect(() => {
        if (staff.permissions?.includes('tax_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);


    const fetchTaxes = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/taxes/accessible`, {
                withCredentials: true,
            });
            setTaxes(res.data?.taxes || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to fetch taxes");
        } finally {
            setLoading(false);
        }
    }, [API]); // include dependencies here if any

    useEffect(() => {
        fetchTaxes();
    }, [fetchTaxes]);

    const handleAddTax = () => {
        setIsEditing(false);
        setTaxId(null);
        setTaxName("");
        setDisplayTaxName("");
        setTaxValue("");
        setTaxStatus(true);
        setSelectedOutlet(null);
        setSelectedBrand(null);
        setShowPopup(true);
        setShowPopup(true);
    }

    const handleEditTax = (tax) => {
        setIsEditing(true);
        setTaxId(tax._id);
        setTaxName(tax.tax_name);
        setDisplayTaxName(tax.display_tax_name);
        setTaxValue(tax.tax_value);
        setTaxStatus(tax.status === "active" ? true : false);
        setShowPopup(true);
        setSelectedBrand({ label: tax.brand_id.full_name, value: tax.brand_id._id });
        const selectedOutlet = outlets.find(outlet => outlet._id === tax.outlet_id?._id);
        if (selectedOutlet) {
            handleOutletSelection({
                label: selectedOutlet.name,
                value: selectedOutlet._id,
            });
        } else {
            handleOutletSelection(null); // In case outlet not found
        }
    }

    const handleSave = async () => {
        setLoading(true);
        if (!selectedBrand || !selectedOutlet) {
            toast.error("Brand and Outlet are required.");
            setLoading(false);
            return;
        }

        if (!taxName || taxName.trim().length < 3 || taxName.trim().length > 50) {
            toast.error("Tax name must be between 3 and 50 characters.");
            setLoading(false);
            return;
        }

        if (!displayTaxName || displayTaxName.trim().length === 0) {
            toast.error("Display tax name is required.");
            setLoading(false);
            return;
        }

        const taxVal = Number(taxValue);
        if (isNaN(taxVal) || taxVal < 0 || taxVal > 100) {
            toast.error("Tax value must be a number between 0 and 100.");
            setLoading(false);
            return;
        }

        const existingTaxForOutlet = taxes.find(tax => tax.outlet_id?._id === selectedOutlet.value);

        console.log(existingTaxForOutlet)

        if (existingTaxForOutlet && !isEditing) {
            toast.error("This outlet already has a tax assigned.");
            setLoading(false);
            return;
        }

        const payload = {
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
            tax_name: taxName.trim(),
            display_tax_name: displayTaxName.trim(),
            tax_value: taxVal,
            status: taxStatus ? "active" : "inactive",
        };

        try {
            if (isEditing) {
                const response = await axios.put(`${API}/api/taxes/update/${taxId}`, payload, {
                    withCredentials: true,
                });
                const updatedTaxes = response.data.tax;
                setTaxes((prev) =>
                    prev.map((tax) => (tax._id === taxId ? updatedTaxes : tax))
                );
                toast.success("Tax updated successfully");
            } else {
                const response = await axios.post(`${API}/api/taxes/create`, payload, {
                    withCredentials: true,
                });
                setTaxes((prev) => [...prev, response.data.tax]);
                toast.success("Tax added successfully");
            }
            setShowPopup(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter(outlet => outlet.brand_id === brand.value);
        setSelectedOutlet(null);
        setFilteredOutlets(filtered);
        if (filtered.length === 0) {
            toast.error("Selected brand has no outlets.");
        }
    };

    const handleOutletSelection = (outlet) => {
        setSelectedOutlet(outlet);
    }

    const handleDelete = async (tax) => {
        if (!window.confirm(`Are you sure you want to delete tax "${tax.tax_name}"?`)) return;

        try {
            const response = await axios.delete(`${API}/api/taxes/delete/${tax._id}`, {
                withCredentials: true,
            });

            toast.success(response.data.message || "Tax deleted successfully");

            setTaxes(prevTaxes => prevTaxes.filter(t => t._id !== tax._id));

        } catch (error) {
            console.error("Error deleting tax:", error);
            toast.error(error.response?.data?.message || "Failed to delete tax");
        }
    };

    const filteredData = useFilteredData({
        data: taxes,
        searchTerm: search,
        searchKeys: ["tax_name", "tax_value", "display_tax_name", "brand_id.full_name", "brand_id.short_name", "outlet_id.name"],
        filters: {
            status: status,
        },
    });

    return (
        <>
            {
                loading && <Loader />
            }
            {
                showPopup ?
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <HeadingText title={`${isEditing ? "Edit" : "Add"} Tax Information`} />
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectInput
                                    label="Select Brand"
                                    selectedOption={selectedBrand}
                                    onChange={handleBrandSelection}
                                    options={brands.map(o => ({ label: o.full_name, value: o._id }))}
                                />
                                <SelectInput
                                    label="Outlet"
                                    selectedOption={selectedOutlet}
                                    onChange={(outlet) => handleOutletSelection(outlet)}
                                    options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Tax Name"
                                    type="text"
                                    value={taxName}
                                    onChange={(e) => setTaxName(e.target.value)}
                                    placeholder="Enter Tax name"
                                    required
                                />
                                <InputField
                                    label="Display Tax name"
                                    type="text"
                                    value={displayTaxName}
                                    onChange={(e) => setDisplayTaxName(e.target.value)}
                                    placeholder="Enter display tax name"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <InputField
                                    label="Tax Value"
                                    type="text"
                                    value={taxValue}
                                    onChange={(e) => setTaxValue(e.target.value)}
                                    placeholder="Enter tax value"
                                    required
                                />
                            </div>
                            {isEditing && (
                                <div className="pt-6 border-t border-slate-200">
                                    <Checkbox
                                        label="Active Status"
                                        checked={taxStatus}
                                        onChange={() => setTaxStatus(!taxStatus)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4 pt-8 border-t border-slate-200 mt-8">
                            <GradientButton clickAction={handleSave}>Update</GradientButton>
                            <Button clickAction={() => setShowPopup(false)}>Close</Button>
                        </div>
                    </div> :
                    <div className="space-y-6">
                        <TopBar
                            title="Tax Configuration"
                            searchText={search}
                            setSearchText={setSearch}
                            selectedFilter={status}
                            setSelectedFilter={setStatus}
                        />
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Tax Settings</h2>
                                <GradientButton clickAction={handleAddTax}>Add Tax</GradientButton>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sr No</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tax Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Brand Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tax Rate</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {filteredData.map((tax, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{tax.display_tax_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{tax.brand_id.short_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{tax.tax_value}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        tax.status === 'active' 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {tax.status.charAt(0).toUpperCase() + tax.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => handleEditTax(tax)}
                                                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(tax)}
                                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}

export default Tax;