// src/pages/Menu.js

import { useCallback, useContext, useEffect, useState } from 'react';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import InputField from '../components/InputField';
import Checkbox from '../components/Checkbox';
import { toast } from 'react-toastify';
import axios from 'axios';
import EditMenu from '../components/EditableMenuTable';
import TopBar from '../components/TopBar';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import useFilteredData from '../hooks/filterData';
import HeadingText from '../components/HeadingText';
import { Edit, Eye } from 'lucide-react';

const Menu = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [menus, setMenus] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');


    const [filteredOutlets, setFilteredOutlets] = useState([]);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    const [name, setName] = useState("");
    const [menuStatus, setMenuStatus] = useState(false);
    const [menuId, setMenuId] = useState(null);
    const [posMenu, setPosMenu] = useState(false);
    const [digitalMenu, setDigitalMenu] = useState(false);
    const [thirdParyMenu, setThirdPartyMenu] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [showMenuDetails, setShowMenuDetails] = useState(false);
    const [brandOutletIds, setBrandOutletIds] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (staff.permissions?.includes('menu_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);


    const fetchAllMenus = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/menus/accessible`, {
                withCredentials: true,
            });
            setMenus(response.data.menus || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch menus.");
        } finally {
            setLoading(false); // Uncomment this if you're managing loading state
        }
    }, [API]);

    useEffect(() => {
        fetchAllMenus();
    }, [fetchAllMenus]);

    const handleAddNewCategory = () => {

        setSelectedBrand(null);
        setSelectedOutlet(null);
        setName("");
        setMenuStatus(true);
        setMenuId(null);
        setDigitalMenu(false);
        setPosMenu(false);
        setThirdPartyMenu(false)
        setIsEditing(false);
        setShowPopup(true);
    }

    const handleEditCategory = (menu) => {
        setName(menu.name);
        setMenuStatus(menu.status === "active" ? true : false);
        setMenuId(menu._id);
        setPosMenu(menu.pos_menu);
        setDigitalMenu(menu.digital_menu);
        setThirdPartyMenu(menu.third_party_menu)
        handleBrandSelection({label: menu.brand_id.full_name, value : menu.brand_id._id});
        const selectedOutlet = outlets.find(outlet => outlet._id === menu.outlet_id?._id);
        if (selectedOutlet) {
            handleOutletSelection({
                label: selectedOutlet.name,
                value: selectedOutlet._id,
            });
        } else {
            handleOutletSelection(null); // In case outlet not found
        }
        setIsEditing(true);
        setShowPopup(true);
    }


    const handleSave = async () => {
        if (!selectedBrand || !name || (!selectedOutlet)) {
            toast.error("Please fill all required fields.");
            return;
        }

        const payload = {
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet?.value,
            pos_menu: posMenu,
            digital_menu: digitalMenu,
            third_party_menu: thirdParyMenu,
            name: name,
            status: menuStatus ? "active" : "inactive",
        };

        try {
            if (isEditing) {
                // Assuming you're keeping track of the selected tax to edit
                await axios.put(`https://api.techseventeen.com/api/menus/update/${menuId}`, payload, { withCredentials: true });
                toast.success("Category updated successfully");
            } else {
                await axios.post("https://api.techseventeen.com/api/menus/create", payload, { withCredentials: true });
                toast.success("Category added successfully!")
            }
            setShowPopup(false);
            fetchAllMenus();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
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

    const handleShowMenuItems = async (menu) => {
        setMenuId(menu._id);
        setBrandOutletIds({
            brand: menu.brand_id._id,
            outlet: menu.outlet_id._id
        });
        setShowMenuDetails(true);
    };


    const filteredData = useFilteredData({
        data: menus,
        searchTerm: search,
        searchKeys: ["name", "status", "pos_menu", "digital_menu", "third_party_menu", "brand_id.name", "outlet_id.name"],
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
                        <HeadingText title="Menu Configuration" />
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 gap-4">
                                <InputField
                                    label="Menu Name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter menu name"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-700">Menu Availability</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {
                                    isEditing ?
                                        <Checkbox
                                            label="Status"
                                            checked={menuStatus}
                                            onChange={() => setMenuStatus(!menuStatus)}
                                        /> : null
                                }
                                <Checkbox
                                    label="POS Menu"
                                    checked={posMenu}
                                    onChange={() => setPosMenu(!posMenu)}
                                />
                                <Checkbox
                                    label="Digital Menu"
                                    checked={digitalMenu}
                                    onChange={() => setDigitalMenu(!digitalMenu)}
                                />
                                <Checkbox
                                    label="3rd Party Delivery Menu"
                                    checked={thirdParyMenu}
                                    onChange={() => setThirdPartyMenu(!thirdParyMenu)}
                                />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <GradientButton clickAction={handleSave}>
                                {
                                    isEditing ? "Update" : "Create"
                                }
                            </GradientButton>
                            <Button clickAction={() => setShowPopup(false)}>Close</Button>
                        </div>
                    </div> :
                    <div className="space-y-6">
                        <TopBar
                            title="Menu Management"
                            searchText={search}
                            setSearchText={setSearch}
                            selectedFilter={status}
                            setSelectedFilter={setStatus}
                        />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Menu Configuration</h2>
                                <GradientButton clickAction={handleAddNewCategory}>Add Menu</GradientButton>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POS Menu</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Digital Menu</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3rd Party</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {
                                            filteredData.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.apply_on_all_outlets ? "All Outlets" : item.outlet_id.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            item.pos_menu ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {item.pos_menu ? "Yes" : "No"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            item.digital_menu ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {item.digital_menu ? "Yes" : "No"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            item.third_party_menu ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {item.third_party_menu ? "Yes" : "No"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => handleEditCategory(item)}
                                                                className="text-orange-600 hover:text-orange-900 p-1 rounded transition-colors"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleShowMenuItems(item)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
            }
            {
                showMenuDetails &&
                <EditMenu menuId={menuId} brandOutletIds={brandOutletIds} closeMenuDetails={() => setShowMenuDetails(false)} />
            }
        </>
    )
}

export default Menu;
