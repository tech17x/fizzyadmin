

import { useCallback, useContext, useEffect, useState } from 'react';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import './Tax.css';
import './Menu.css';
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
                await axios.put(`http://localhost:5002/api/menus/update/${menuId}`, payload, { withCredentials: true });
                toast.success("Category updated successfully");
            } else {
                await axios.post("http://localhost:5002/api/menus/create", payload, { withCredentials: true });
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
                    <div className='card'>
                        <HeadingText title={`Menu`} />
                        <div className="inputs-container">
                            <div className="inputs-row">
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
                            <div className="inputs-row">
                                <InputField
                                    label="Name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter Tax name"
                                    required
                                />
                            </div>
                            <div className="checkbox-container">
                                {
                                    isEditing ?
                                        <Checkbox
                                            label="Status"
                                            checked={menuStatus}
                                            onChange={() => setMenuStatus(!menuStatus)}
                                        /> : null
                                }
                                <Checkbox
                                    label="Pos Menu"
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

                        <div className="action-btns-container">
                            <GradientButton clickAction={handleSave}>
                                {
                                    isEditing ? "Update" : "Create"
                                }
                            </GradientButton>
                            <Button clickAction={() => setShowPopup(false)}>Close</Button>
                        </div>
                    </div> :
                    <div className="table-section-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <TopBar
                            title="Floor"
                            searchText={search}
                            setSearchText={setSearch}
                            selectedFilter={status}
                            setSelectedFilter={setStatus}
                        />
                        <div className="add-new-staff-info card">
                            <GradientButton clickAction={handleAddNewCategory}>Add Menu</GradientButton>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sr No</th>
                                            <th>Menu Name</th>
                                            <th>Outlet Name</th>
                                            <th>Pos Menu</th>
                                            <th>Digital Menu</th>
                                            <th>3rd Party</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            filteredData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.apply_on_all_outlets ? "All" : item.outlet_id.name}</td>
                                                    <td><div className={``}>{item.pos_menu ? "Yes" : "No"}</div></td>
                                                    <td><div className={``}>{item.digital_menu ? "Yes" : "No"}</div></td>
                                                    <td><div className={``}>{item.third_party_menu ? "Yes" : "No"}</div></td>
                                                    <td><div className={`status ${item.status}`}>{item.status}</div></td>
                                                    <td>{item.createdAt}</td>
                                                    <td>
                                                        <div className="tax-action-btns">
                                                            <button onClick={() => handleEditCategory(item)}>
                                                                <svg width="14" height="14" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M18 10V17.5C18 17.8978 17.842 18.2794 17.5607 18.5607C17.2794 18.842 16.8978 19 16.5 19H1.5C1.10218 19 0.720644 18.842 0.43934 18.5607C0.158035 18.2794 0 17.8978 0 17.5V2.50001C0 2.10219 0.158035 1.72065 0.43934 1.43935C0.720644 1.15805 1.10218 1.00001 1.5 1.00001H9C9.19891 1.00001 9.38968 1.07903 9.53033 1.21968C9.67098 1.36033 9.75 1.5511 9.75 1.75001C9.75 1.94892 9.67098 2.13969 9.53033 2.28034C9.38968 2.42099 9.19891 2.50001 9 2.50001H1.5V17.5H16.5V10C16.5 9.8011 16.579 9.61033 16.7197 9.46968C16.8603 9.32903 17.0511 9.25001 17.25 9.25001C17.4489 9.25001 17.6397 9.32903 17.7803 9.46968C17.921 9.61033 18 9.8011 18 10ZM18.5306 4.53064L9.53063 13.5306C9.46092 13.6003 9.37818 13.6555 9.28714 13.6931C9.19609 13.7308 9.09852 13.7501 9 13.75H6C5.80109 13.75 5.61032 13.671 5.46967 13.5303C5.32902 13.3897 5.25 13.1989 5.25 13V10C5.24992 9.90149 5.26926 9.80392 5.3069 9.71287C5.34454 9.62183 5.39975 9.53909 5.46937 9.46939L14.4694 0.469385C14.539 0.399653 14.6217 0.344333 14.7128 0.30659C14.8038 0.268847 14.9014 0.24942 15 0.24942C15.0986 0.24942 15.1962 0.268847 15.2872 0.30659C15.3783 0.344333 15.461 0.399653 15.5306 0.469385L18.5306 3.46938C18.6004 3.53904 18.6557 3.62176 18.6934 3.71281C18.7312 3.80385 18.7506 3.90145 18.7506 4.00001C18.7506 4.09857 18.7312 4.19617 18.6934 4.28722C18.6557 4.37826 18.6004 4.46098 18.5306 4.53064ZM16.9369 4.00001L15 2.06032L13.8103 3.25001L15.75 5.1897L16.9369 4.00001Z" fill="black" />
                                                                </svg>
                                                            </button>
                                                            <button onClick={() => handleShowMenuItems(item)}>
                                                                <svg width="14" height="14" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M21.3069 8.05092C21.286 7.9453 21.2426 7.84543 21.1797 7.75807C21.1167 7.67072 21.0357 7.59793 20.9422 7.54467L18.1456 5.95092L18.1344 2.79904C18.134 2.69049 18.1101 2.58331 18.0643 2.4849C18.0185 2.38649 17.9519 2.29919 17.8691 2.22904C16.8546 1.37095 15.6864 0.713356 14.4266 0.291232C14.3273 0.257651 14.2222 0.245223 14.1179 0.25475C14.0136 0.264276 13.9124 0.295546 13.8209 0.346545L11 1.92342L8.17624 0.343732C8.0847 0.292446 7.98341 0.260941 7.87893 0.251251C7.77445 0.241562 7.6691 0.253905 7.56968 0.287482C6.31059 0.712317 5.14366 1.37246 4.13093 2.23279C4.04822 2.30284 3.98166 2.38999 3.93586 2.48823C3.89006 2.58647 3.8661 2.69347 3.86562 2.80186L3.85156 5.95654L1.055 7.55029C0.961434 7.60356 0.880437 7.67634 0.817509 7.7637C0.754582 7.85105 0.711198 7.95093 0.690308 8.05654C0.434367 9.34268 0.434367 10.6667 0.690308 11.9528C0.711198 12.0584 0.754582 12.1583 0.817509 12.2456C0.880437 12.333 0.961434 12.4058 1.055 12.459L3.85156 14.0528L3.86281 17.2056C3.86315 17.3142 3.88705 17.4213 3.93285 17.5197C3.97866 17.6182 4.04528 17.7055 4.12812 17.7756C5.14256 18.6337 6.31077 19.2913 7.57062 19.7134C7.66983 19.747 7.77498 19.7594 7.87929 19.7499C7.9836 19.7404 8.08476 19.7091 8.17624 19.6581L11 18.0765L13.8237 19.6562C13.9355 19.7185 14.0615 19.7508 14.1894 19.75C14.2713 19.75 14.3526 19.7367 14.4303 19.7106C15.6891 19.286 16.8559 18.6265 17.8691 17.7672C17.9518 17.6971 18.0183 17.61 18.0641 17.5117C18.1099 17.4135 18.1339 17.3065 18.1344 17.1981L18.1484 14.0434L20.945 12.4497C21.0386 12.3964 21.1196 12.3236 21.1825 12.2363C21.2454 12.1489 21.2888 12.049 21.3097 11.9434C21.5642 10.6583 21.5632 9.33566 21.3069 8.05092ZM11 13.75C10.2583 13.75 9.53329 13.53 8.91661 13.118C8.29992 12.7059 7.81927 12.1203 7.53545 11.435C7.25162 10.7498 7.17736 9.99582 7.32205 9.26839C7.46674 8.54096 7.8239 7.87278 8.34834 7.34833C8.87279 6.82388 9.54098 6.46673 10.2684 6.32204C10.9958 6.17734 11.7498 6.2516 12.4351 6.53543C13.1203 6.81926 13.706 7.29991 14.118 7.91659C14.5301 8.53328 14.75 9.2583 14.75 9.99998C14.75 10.9945 14.3549 11.9484 13.6516 12.6516C12.9484 13.3549 11.9946 13.75 11 13.75Z" fill="black" />
                                                                </svg>
                                                            </button>
                                                            {/* <button>
                                                                <svg width="14" height="14" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M17.25 3.5H13.5V2.75C13.5 2.15326 13.2629 1.58097 12.841 1.15901C12.419 0.737053 11.8467 0.5 11.25 0.5H6.75C6.15326 0.5 5.58097 0.737053 5.15901 1.15901C4.73705 1.58097 4.5 2.15326 4.5 2.75V3.5H0.75C0.551088 3.5 0.360322 3.57902 0.21967 3.71967C0.0790178 3.86032 0 4.05109 0 4.25C0 4.44891 0.0790178 4.63968 0.21967 4.78033C0.360322 4.92098 0.551088 5 0.75 5H1.5V18.5C1.5 18.8978 1.65804 19.2794 1.93934 19.5607C2.22064 19.842 2.60218 20 3 20H15C15.3978 20 15.7794 19.842 16.0607 19.5607C16.342 19.2794 16.5 18.8978 16.5 18.5V5H17.25C17.4489 5 17.6397 4.92098 17.7803 4.78033C17.921 4.63968 18 4.44891 18 4.25C18 4.05109 17.921 3.86032 17.7803 3.71967C17.6397 3.57902 17.4489 3.5 17.25 3.5ZM6 2.75C6 2.55109 6.07902 2.36032 6.21967 2.21967C6.36032 2.07902 6.55109 2 6.75 2H11.25C11.4489 2 11.6397 2.07902 11.7803 2.21967C11.921 2.36032 12 2.55109 12 2.75V3.5H6V2.75ZM15 18.5H3V5H15V18.5ZM7.5 8.75V14.75C7.5 14.9489 7.42098 15.1397 7.28033 15.2803C7.13968 15.421 6.94891 15.5 6.75 15.5C6.55109 15.5 6.36032 15.421 6.21967 15.2803C6.07902 15.1397 6 14.9489 6 14.75V8.75C6 8.55109 6.07902 8.36032 6.21967 8.21967C6.36032 8.07902 6.55109 8 6.75 8C6.94891 8 7.13968 8.07902 7.28033 8.21967C7.42098 8.36032 7.5 8.55109 7.5 8.75ZM12 8.75V14.75C12 14.9489 11.921 15.1397 11.7803 15.2803C11.6397 15.421 11.4489 15.5 11.25 15.5C11.0511 15.5 10.8603 15.421 10.7197 15.2803C10.579 15.1397 10.5 14.9489 10.5 14.75V8.75C10.5 8.55109 10.579 8.36032 10.7197 8.21967C10.8603 8.07902 11.0511 8 11.25 8C11.4489 8 11.6397 8.07902 11.7803 8.21967C11.921 8.36032 12 8.55109 12 8.75Z" fill="black" />
                                                                </svg>
                                                            </button> */}
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
