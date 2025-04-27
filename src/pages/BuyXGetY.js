// src/pages/Brand.js

import { useCallback, useEffect, useState } from 'react';
import HeadingText from '../components/HeadingText';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import './Tax.css';
import './Discount.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import InputField from '../components/InputField';
import Popup from '../components/Popup';
import Checkbox from '../components/Checkbox';
import useFetchBrands from '../hooks/useFetchBrands';
import useFetchOutlets from '../hooks/useFetchOutlets';
import SearchFilterBar from '../components/SearchFilterBar';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';


const weeks = [
    { label: "Sunday", value: "sunday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
];

const BuyXGetY = () => {
    const API = process.env.REACT_APP_API_URL;
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();
    const [data, setData] = useState([]);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [filteredOutlets, setFilteredOutlets] = useState([]);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    const [status, setStatus] = useState(false);

    const [name, setName] = useState('');
    const [rate, setRate] = useState(null);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [selectedDay, setSelectedDay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [items, setItems] = useState([]);

    const [dataId, setDataId] = useState(null);

    const [selectedBuyItem, setSelectedBuyItem] = useState(null);
    const [selectedGetItem, setSelectedGetItem] = useState(null);
    const [buyQut, setBuyQut] = useState('');
    const [getQut, setGetQut] = useState('');

    // ✅ Fetch staff floors
    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/buyX-getY-offers/accessible`, {
                withCredentials: true,
            });
            setData(response.data.offers || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch Offers.");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddData = () => {
        setLoading(true);
        setIsEditing(false);
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setSelectedMenu(null);
        setRate('');
        setName('');
        setSelectedDay(null);
        setStartTime("");
        setEndTime("");
        setStatus(true);
        setSelectedBuyItem(null);
        setSelectedGetItem(null);
        setBuyQut("");
        setGetQut('');
        setShowPopup(true);
        setLoading(false);
    }

    const handleEdit = async (data) => {
        console.log(data);
        setLoading(true);
        setIsEditing(true);
        setDataId(data._id);
        setName(data.name);
        // Step 1: Handle Brand First
        handleBrandSelection(data.brand_id);

        // Step 2: Now select Outlet
        const selectedOutlet = outlets.find(outlet => outlet._id === data.outlet_id?._id);
        if (selectedOutlet) {
            handleOutletSelection({
                label: selectedOutlet.name,
                value: selectedOutlet._id,
            }, data.brand_id);
        } else {
            handleOutletSelection(null);
        }

        handleMenuSelection({
            label: data.menu_id.name,
            value: data.menu_id._id,
        });

        setRate(data.rate);
        setSelectedDay(weeks.find(i => i.value === data.day));
        setStartTime(data.start_time);
        setEndTime(data.end_time);
        setStatus(data.status === "active" ? true : false);

        setSelectedBuyItem(data.buy_item);
        setSelectedGetItem(data.get_item);
        setBuyQut(data.buy_quantity);
        setGetQut(data.get_quantity);

        setShowPopup(true);
        setLoading(false);
    }


    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter(outlet => outlet.brand_id === brand._id);
        setSelectedOutlet(null);
        setFilteredOutlets(filtered);
        if (filtered.length === 0) {
            toast.error("Selected brand has no outlets.");
        }
    };

    const handleOutletSelection = (outlet, brand = selectedBrand) => {
        if (outlet) {
            setSelectedOutlet(outlet);
            fetchMenus(brand, outlet);
        }
    }

    const handleDaySelection = (day) => {
        setSelectedDay(day);
    };

    const handleMenuSelection = (menu) => {
        if (menu) {
            setSelectedMenu(menu);
            fetchItems(menu);
        }
    }

    const handleItemSelection = (item, type) => {
        if (type === "buy") {
            setSelectedBuyItem(item)
        } else {
            setSelectedGetItem(item);
        }
    }

    const fetchMenus = async (selectedBrand, selectedOutlet) => {
        try {
            const response = await axios.get(`${API}/api/menus/by-brand-outlet`, {
                params: { brand_id: selectedBrand._id, outlet_id: selectedOutlet.value },
                withCredentials: true
            });
            setMenus(response.data.menus);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async (selectedMenu) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/api/items/menu/${selectedMenu.value}`, {
                withCredentials: true
            });
            setItems(response.data.items);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            brand_id: selectedBrand?._id,
            outlet_id: selectedOutlet?.value,
            menu_id: selectedMenu?.value,
            name: name,
            rate: rate,
            buy_item: selectedBuyItem?.value,
            buy_quantity: buyQut,
            get_item: selectedGetItem?.value,
            get_quantity: getQut,
            day: selectedDay?.value,
            start_time: startTime,
            end_time: endTime,
            status: status ? "active" : "inactive",
        };

        console.log(payload);

        if (!selectedBrand || !selectedOutlet || !selectedMenu || !name || !rate || !selectedBuyItem || !buyQut || !selectedGetItem || !getQut) {
            toast.error("Please fill all required fields.");
            setLoading(false);
            return;
        }

        const isDuplicate = (field) => {
            return data?.some((type) => {
                return (
                    type.outlet_id._id === selectedOutlet?.value &&
                    type[field]?.trim().toLowerCase() === name?.trim().toLowerCase() &&
                    type._id !== dataId // exclude self if editing
                );
            });
        };

        if (isDuplicate('name')) {
            toast.error("Name already exists in this outlet.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                // Assuming you're keeping track of the selected tax to edit
                const response = await axios.put(`${API}/api/buyX-getY-offers/update/${dataId}`, payload, { withCredentials: true });
                toast.success("Data updated successfully");
                const updated = response.data.offer;
                setData((prev) =>
                    prev.map((offer) => (offer._id === dataId ? updated : offer))
                );
            } else {
                const response = await axios.post(`${API}/api/buyX-getY-offers/create`, payload, { withCredentials: true });
                setData((prev) => [...prev, response.data.offer]);
                toast.success("Data added successfully!")
            }
            setShowPopup(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function formatDateTimeLocal(datetimeString) {
        if (!datetimeString) return "";
        const date = new Date(datetimeString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
    }


    return (
        <>
            {
                loading && <Loader />
            }
            <HeadingText>Buy X Get Y Item</HeadingText>
            <SearchFilterBar
                placeholder={`Search Brand, Outlet...`}
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={filterStatus}
                onStatusChange={setFilterStatus}
            />
            <div className="add-new-staff-info">
                <GradientButton clickAction={() => handleAddData()}>Add Buy X Get Y Item</GradientButton>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Sr No</th>
                                <th>Offer Name</th>
                                <th>Outlet Name</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.outlet_id.name}</td>
                                        <td><div className={`status ${item.status}`}>{item.status}</div></td>
                                        <td>
                                            <div className="tax-action-btns">
                                                <button onClick={() => handleEdit(item)}>
                                                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M18 10V17.5C18 17.8978 17.842 18.2794 17.5607 18.5607C17.2794 18.842 16.8978 19 16.5 19H1.5C1.10218 19 0.720644 18.842 0.43934 18.5607C0.158035 18.2794 0 17.8978 0 17.5V2.50001C0 2.10219 0.158035 1.72065 0.43934 1.43935C0.720644 1.15805 1.10218 1.00001 1.5 1.00001H9C9.19891 1.00001 9.38968 1.07903 9.53033 1.21968C9.67098 1.36033 9.75 1.5511 9.75 1.75001C9.75 1.94892 9.67098 2.13969 9.53033 2.28034C9.38968 2.42099 9.19891 2.50001 9 2.50001H1.5V17.5H16.5V10C16.5 9.8011 16.579 9.61033 16.7197 9.46968C16.8603 9.32903 17.0511 9.25001 17.25 9.25001C17.4489 9.25001 17.6397 9.32903 17.7803 9.46968C17.921 9.61033 18 9.8011 18 10ZM18.5306 4.53064L9.53063 13.5306C9.46092 13.6003 9.37818 13.6555 9.28714 13.6931C9.19609 13.7308 9.09852 13.7501 9 13.75H6C5.80109 13.75 5.61032 13.671 5.46967 13.5303C5.32902 13.3897 5.25 13.1989 5.25 13V10C5.24992 9.90149 5.26926 9.80392 5.3069 9.71287C5.34454 9.62183 5.39975 9.53909 5.46937 9.46939L14.4694 0.469385C14.539 0.399653 14.6217 0.344333 14.7128 0.30659C14.8038 0.268847 14.9014 0.24942 15 0.24942C15.0986 0.24942 15.1962 0.268847 15.2872 0.30659C15.3783 0.344333 15.461 0.399653 15.5306 0.469385L18.5306 3.46938C18.6004 3.53904 18.6557 3.62176 18.6934 3.71281C18.7312 3.80385 18.7506 3.90145 18.7506 4.00001C18.7506 4.09857 18.7312 4.19617 18.6934 4.28722C18.6557 4.37826 18.6004 4.46098 18.5306 4.53064ZM16.9369 4.00001L15 2.06032L13.8103 3.25001L15.75 5.1897L16.9369 4.00001Z" fill="black" />
                                                    </svg>
                                                </button>
                                                <button>
                                                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17.25 3.5H13.5V2.75C13.5 2.15326 13.2629 1.58097 12.841 1.15901C12.419 0.737053 11.8467 0.5 11.25 0.5H6.75C6.15326 0.5 5.58097 0.737053 5.15901 1.15901C4.73705 1.58097 4.5 2.15326 4.5 2.75V3.5H0.75C0.551088 3.5 0.360322 3.57902 0.21967 3.71967C0.0790178 3.86032 0 4.05109 0 4.25C0 4.44891 0.0790178 4.63968 0.21967 4.78033C0.360322 4.92098 0.551088 5 0.75 5H1.5V18.5C1.5 18.8978 1.65804 19.2794 1.93934 19.5607C2.22064 19.842 2.60218 20 3 20H15C15.3978 20 15.7794 19.842 16.0607 19.5607C16.342 19.2794 16.5 18.8978 16.5 18.5V5H17.25C17.4489 5 17.6397 4.92098 17.7803 4.78033C17.921 4.63968 18 4.44891 18 4.25C18 4.05109 17.921 3.86032 17.7803 3.71967C17.6397 3.57902 17.4489 3.5 17.25 3.5ZM6 2.75C6 2.55109 6.07902 2.36032 6.21967 2.21967C6.36032 2.07902 6.55109 2 6.75 2H11.25C11.4489 2 11.6397 2.07902 11.7803 2.21967C11.921 2.36032 12 2.55109 12 2.75V3.5H6V2.75ZM15 18.5H3V5H15V18.5ZM7.5 8.75V14.75C7.5 14.9489 7.42098 15.1397 7.28033 15.2803C7.13968 15.421 6.94891 15.5 6.75 15.5C6.55109 15.5 6.36032 15.421 6.21967 15.2803C6.07902 15.1397 6 14.9489 6 14.75V8.75C6 8.55109 6.07902 8.36032 6.21967 8.21967C6.36032 8.07902 6.55109 8 6.75 8C6.94891 8 7.13968 8.07902 7.28033 8.21967C7.42098 8.36032 7.5 8.55109 7.5 8.75ZM12 8.75V14.75C12 14.9489 11.921 15.1397 11.7803 15.2803C11.6397 15.421 11.4489 15.5 11.25 15.5C11.0511 15.5 10.8603 15.421 10.7197 15.2803C10.579 15.1397 10.5 14.9489 10.5 14.75V8.75C10.5 8.55109 10.579 8.36032 10.7197 8.21967C10.8603 8.07902 11.0511 8 11.25 8C11.4489 8 11.6397 8.07902 11.7803 8.21967C11.921 8.36032 12 8.55109 12 8.75Z" fill="black" />
                                                    </svg>
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
            {
                showPopup &&
                <Popup
                    title={`${isEditing ? "Edit" : "Add"} Buy X Get Y Item`}
                    closePopup={() => setShowPopup(false)}
                >
                    <div className="inputs-container">
                        <div className="inputs-row">
                            <SelectInput
                                label="Brand"
                                selectedOption={selectedBrand}
                                onChange={handleBrandSelection}
                                options={brands}
                            />
                            <SelectInput
                                label="Outlet"
                                selectedOption={selectedOutlet}
                                onChange={(outlet) => handleOutletSelection(outlet)}
                                options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                            />
                        </div>
                        <div className="inputs-row">
                            <SelectInput
                                label="Menus"
                                selectedOption={selectedMenu}
                                onChange={(menu) => handleMenuSelection(menu)}
                                options={menus.map(o => ({ label: o.name, value: o._id }))}
                            />
                            <InputField
                                label={`Name`}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={`Offer name`}
                                required
                            />
                        </div>
                        <div className="inputs-row">

                            <InputField
                                label={`Rate`}
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                placeholder={`Rate`}
                                required
                            />

                            <SelectInput
                                label="Buy Item"
                                selectedOption={selectedBuyItem}
                                onChange={(item) => handleItemSelection(item, "buy")}
                                options={items.map(o => ({ label: o.name, value: o._id }))}
                            />
                        </div>
                        <div className="inputs-row">

                            <InputField
                                label={`Buy Quantity`}
                                type="number"
                                value={buyQut}
                                onChange={(e) => setBuyQut(e.target.value)}
                                placeholder={`Rate`}
                                required
                            />

                            <SelectInput
                                label="Get Item"
                                selectedOption={selectedGetItem}
                                onChange={(item) => handleItemSelection(item, "get")}
                                options={items.map(o => ({ label: o.name, value: o._id }))}
                            />
                        </div>
                        <div className="inputs-row">

                            <InputField
                                label={`Get Quantity`}
                                type="number"
                                value={getQut}
                                onChange={(e) => setGetQut(e.target.value)}
                                placeholder={`Rate`}
                                required
                            />

                            <InputField
                                label="Start Time"
                                type="datetime-local"
                                value={formatDateTimeLocal(startTime)}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="Enter Start time"
                                required
                            />
                        </div>
                        <div className="inputs-row">

                            <InputField
                                label="End Time"
                                type="datetime-local"
                                value={formatDateTimeLocal(endTime)}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="Enter End time"
                                required
                            />

                            <SelectInput
                                label="Day"
                                selectedOption={selectedDay}
                                onChange={(day) => handleDaySelection(day)}
                                options={weeks}
                            />
                        </div>
                        <div className="checkbox-container">
                            {
                                isEditing ?
                                    <Checkbox
                                        label="Status"
                                        checked={status}
                                        onChange={() => setStatus(!status)}
                                    />
                                    : null
                            }
                        </div>
                    </div>

                    <div className="action-btns-container">
                        <GradientButton clickAction={handleSave}>{isEditing ? "Update" : "Create"}</GradientButton>
                        <Button clickAction={() => setShowPopup(false)}>Close</Button>
                    </div>
                </Popup>
            }
        </>
    )
}

export default BuyXGetY;
