// src/pages/Brand.js

import { useCallback, useContext, useEffect, useState } from 'react';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import InputField from '../components/InputField';
import Checkbox from '../components/Checkbox';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import TopBar from '../components/TopBar';
import AuthContext from '../context/AuthContext';
import useFilteredData from '../hooks/filterData';
import HeadingText from '../components/HeadingText';
import SectionHeading from '../components/SectionHeading';

const weeks = [
    { label: "Sunday", value: "sunday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
];

const applyTypeOptions = [
    { label: "Discount", value: "discount" },
    { label: "Coupon", value: "coupon" },
    { label: "Extra charge", value: "extra_charge" }
];

const Discount = () => {
    const API = process.env.REACT_APP_API_URL;

    const { staff, logout } = useContext(AuthContext);

    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [orderTypes, setOrderTypes] = useState([]);
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [filteredOutlets, setFilteredOutlets] = useState([]);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState([]);

    const [applyOnAllOrderTypes, setApplyOnAllOrderTypes] = useState(false);
    const [applyOnAllMenus, setApplyOnAllMenus] = useState(false);
    const [applyOnAllCategories, setApplyOnAllCategories] = useState(false);
    const [applyOnAllItems, setApplyOnAllItems] = useState(false);
    const [status, setStatus] = useState(false);

    const [name, setName] = useState('');
    const [rate, setRate] = useState(null);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [couponCode, setCouponCode] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [applyType, setApplyType] = useState(null);
    const [selectedDay, setSelectedDay] = useState([]);
    const [selectedOrderType, setSelectedOrderType] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplyAs, setSelectedApplyAs] = useState(null);
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState([]);
    const [showCoupon, setShowCoupon] = useState(false);

    const [dataId, setDataId] = useState(null);

    useEffect(() => {
        if (staff.permissions?.includes('discount_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/discounts/accessible`, {
                withCredentials: true,
            });
            setData(response.data.discounts || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch floors.");
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
        setApplyType(null);
        setSelectedMenu([]);           // empty array for multiple select
        setRate('');
        setName('');
        setSelectedApplyAs(null);
        setSelectedOrderType([]);      // empty array for multiple select
        setSelectedCategory([]);       // empty array for multiple select
        setSelectedItem([]);           // empty array for multiple select
        setSelectedDay([]);            // empty array for multiple select
        setStartTime("");
        setEndTime("");
        setCouponCode("");
        setApplyOnAllOrderTypes(false);
        setApplyOnAllMenus(false);
        setApplyOnAllCategories(false);
        setApplyOnAllItems(false);
        setStatus(true);
        setShowPopup(true);
        setLoading(false);
    };

    const handleEdit = async (data) => {
        setLoading(true);
        setIsEditing(true);
        setDataId(data._id);
        setName(data.name);

        // Step 1: Handle Brand
        if (data.brand_id) {
            handleBrandSelection({
                label: data.brand_id.full_name,
                value: data.brand_id._id
            });
        }

        // Step 2: Handle Outlet
        const selectedOutletObj = outlets.find(outlet => outlet._id === data.outlet_id?._id);
        if (selectedOutletObj) {
            handleOutletSelection({
                label: selectedOutletObj.name,
                value: selectedOutletObj._id
            }, {
                label: data.brand_id.full_name,
                value: data.brand_id._id
            });
        } else if (data.outlet_id) {
            handleOutletSelection({
                label: data.outlet_id.name,
                value: data.outlet_id._id
            }, {
                label: data.brand_id.full_name,
                value: data.brand_id._id
            });
        } else {
            handleOutletSelection(null);
        }

        // Step 3: Menu (multiple select needs array)
        if (data.menu) {
            handleMenuSelection([{
                label: data.menu.name,
                value: data.menu._id
            }]);
        } else {
            handleMenuSelection([]);
        }

        // Step 4: Order Type (multiple select needs array)
        if (data.order_type) {
            handleOrderTypeSelection([{
                label: data.order_type.name,
                value: data.order_type._id
            }]);
        } else {
            handleOrderTypeSelection([]);
        }

        // Step 5: Category (multiple select needs array)
        if (data.category) {
            handleCategorySelection([{
                label: data.category.name,
                value: data.category._id
            }]);
        } else {
            handleCategorySelection([]);
        }

        // Step 6: Item (multiple select needs array)
        if (data.item) {
            handleItemSelection([{
                label: data.item.name,
                value: data.item._id
            }]);
        } else {
            handleItemSelection([]);
        }

        // Step 7: Other fields
        const selectedApplyAsOption = [
            { label: "Percentage %", value: "percentage" },
            { label: "Fixed $", value: "fixed" }
        ].find(i => i.value === data.type);
        setSelectedApplyAs(selectedApplyAsOption);

        handleApplyTypeSelection(applyTypeOptions.find(i => i.value === data.apply_type));

        setRate(data.rate ?? 0);
        setSelectedDay(data.day ? [weeks.find(i => i.value === data.day)].filter(Boolean) : []); // multiple select array
        setStartTime(data.start_time ?? "");
        setEndTime(data.end_time ?? "");
        setCouponCode(data.code ?? "");
        setApplyOnAllOrderTypes(data.apply_on_all_order_types ?? false);
        setApplyOnAllMenus(data.apply_on_all_menus ?? false);
        setApplyOnAllCategories(data.apply_on_all_categories ?? false);
        setApplyOnAllItems(data.apply_on_all_items ?? false);
        setStatus(data.status === "active");

        setShowPopup(true);
        setLoading(false);
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

    const handleOutletSelection = (outlet, brand = selectedBrand) => {
        if (outlet) {
            setSelectedOutlet(outlet);
            fetchOrderTypes(brand, outlet);
            fetchMenus(brand, outlet);
        }
    };

    const handleApplyTypeSelection = (type) => {
        if (type?.value === "coupon") {
            setShowCoupon(true);
        } else {
            setShowCoupon(false);
        }
        setApplyType(type);
    };

    const handleOrderTypeSelection = (selectedOptions) => {
        setSelectedOrderType(selectedOptions || []);
    };

    const handleCategorySelection = (cat) => {
        setSelectedCategory(cat || []);
        fetchItems(cat || []);
    };

    const handleDaySelection = (day) => {
        setSelectedDay(day || []);
    };

    const handleMenuSelection = (menu) => {
        setSelectedMenu(menu || []);
        if (menu && selectedOutlet) {
            fetchCategories(selectedOutlet);
        }
    };

    const handleItemSelection = (item) => {
        setSelectedItem(item || []);
    };

    const fetchOrderTypes = async (selectedBrand, selectedOutlet) => {
        try {
            const response = await axios.get(`${API}/api/order-type/by-brand-outlet`, {
                params: { brand_id: selectedBrand.value, outlet_id: selectedOutlet.value },
                withCredentials: true,
            });
            setOrderTypes(response.data.orderTypes || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch order types");
        } finally {
            setLoading(false);
        }
    };

    const fetchMenus = async (selectedBrand, selectedOutlet) => {
        try {
            const response = await axios.get(`${API}/api/menus/by-brand-outlet`, {
                params: { brand_id: selectedBrand.value, outlet_id: selectedOutlet.value },
                withCredentials: true
            });
            setMenus(response.data.menus || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async (selectedCategory) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${API}/api/items/outlet/items`,
                {
                    outlet_id: selectedOutlet.value,
                    category_ids: selectedCategory.map(cat => cat.value) // extract only IDs
                },
                { withCredentials: true }
            );

            setItems(response.data.items || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async (selectedOutlet) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/api/categories/by-outlet/${selectedOutlet.value}`, {
                withCredentials: true
            });
            setCategories(response.data.categories || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);

        const payload = {
            brand_id: selectedBrand?.value,
            outlet_id: selectedOutlet?.value,
            name: name,
            apply_type: applyType?.value,
            type: selectedApplyAs?.value,
            rate: rate,
            apply_on_all_order_types: applyOnAllOrderTypes,
            order_type: selectedOrderType?.map(o => o.value) || [],   // multiple allowed
            apply_on_all_menus: applyOnAllMenus,
            menu: selectedMenu?.map(m => m.value) || [],             // multiple allowed
            apply_on_all_categories: applyOnAllCategories,
            category: selectedCategory?.map(c => c.value) || [],     // multiple allowed
            apply_on_all_items: applyOnAllItems,
            item: selectedItem?.map(i => i.value) || [],             // multiple allowed
            day: selectedDay.length === 1 ? selectedDay[0].value : null,
            start_time: startTime,
            end_time: endTime,
            code: couponCode,
            status: status ? "active" : "inactive",
        };

        // Validation
        if (
            !selectedBrand ||
            !selectedOutlet ||
            !name ||
            !selectedApplyAs ||
            !applyType ||
            !rate ||
            (applyType?.value === "coupon" && !couponCode)
        ) {
            toast.error("Please fill all required fields.");
            setLoading(false);
            return;
        }

        // Duplicate check by name in same outlet
        const isDuplicate = (field) => {
            return data?.some((type) => {
                return (
                    type.outlet_id._id === selectedOutlet?.value &&
                    type[field]?.trim().toLowerCase() === name?.trim().toLowerCase() &&
                    type._id !== dataId
                );
            });
        };

        if (isDuplicate("name")) {
            toast.error("Name already exists in this outlet.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                const response = await axios.put(
                    `${API}/api/discounts/update/${dataId}`,
                    payload,
                    { withCredentials: true }
                );
                toast.success("Data updated successfully");
                const updated = response.data.discount;

                setData((prev) =>
                    prev.map((discount) => (discount._id === dataId ? updated : discount))
                );
            } else {
                const response = await axios.post(
                    `${API}/api/discounts/create`,
                    payload,
                    { withCredentials: true }
                );
                setData((prev) => [...prev, response.data.discount]);
                toast.success("Data added successfully!");
            }
            setShowPopup(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (data) => {
        if (!window.confirm(`Are you sure you want to delete "${data.name}"?`)) return;

        try {
            const response = await axios.delete(`${API}/api/discounts/delete/${data._id}`, {
                withCredentials: true,
            });
            toast.success(response.data.message || "Data deleted successfully");

            setData(prevDatas => prevDatas.filter(t => t._id !== data._id));
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.error(error.response?.data?.message || "Failed to delete data");
        }
    };

    const filteredData = useFilteredData({
        data: data,
        searchTerm: search,
        searchKeys: ["name", "apply_type", "type", "status", "code", "day", "brand_id.short_name", "outlet_id.name"],
        filters: {
            status: filterStatus,
        },
    });

    return (
        <>
            {loading && <Loader />}
            {showPopup ? (
                <div className="card">
                    <HeadingText title={`${isEditing ? "Edit" : "Add"} Discount / Charge`} />
                    <div className="form-container">

                        {/* Section 1: General Information */}
                        <SectionHeading title="General Information" />
                        <div className="inputs-row">
                            <SelectInput
                                label="Brand"
                                selectedOption={selectedBrand}
                                onChange={handleBrandSelection}
                                options={brands.map(o => ({ label: o.full_name, value: o._id }))}
                            />
                            <SelectInput
                                label="Outlet"
                                selectedOption={selectedOutlet}
                                onChange={handleOutletSelection}
                                options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter discount/charge name"
                                required
                            />
                            <SelectInput
                                label="Apply Type"
                                selectedOption={applyType}
                                onChange={handleApplyTypeSelection}
                                options={applyTypeOptions}
                            />
                        </div>

                        {/* Section 2: Discount/Charge Rule */}
                        <SectionHeading title="Discount / Charge Rule" />
                        <div className="inputs-row">
                            <SelectInput
                                label="Apply As"
                                selectedOption={selectedApplyAs}
                                onChange={setSelectedApplyAs}
                                options={[
                                    { label: "Percentage %", value: "percentage" },
                                    { label: "Fixed $", value: "fixed" }
                                ]}
                            />
                            <InputField
                                label="Rate"
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                placeholder="Enter rate"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Coupon Code"
                                type="text"
                                disabled={!showCoupon}
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter coupon code"
                            />
                        </div>

                        {/* Section 3: Applicability */}
                        <SectionHeading title="Applicability" />
                        <div className="inputs-row">
                            <SelectInput
                                label="Order Types"
                                multiple
                                selectedOption={selectedOrderType}
                                onChange={handleOrderTypeSelection}
                                options={orderTypes.map(o => ({ label: o.name, value: o._id }))}
                            />
                            <SelectInput
                                label="Menus"
                                multiple
                                selectedOption={selectedMenu}
                                onChange={handleMenuSelection}
                                options={menus.map(o => ({ label: o.name, value: o._id }))}
                            />
                        </div>
                        <div className="inputs-row">
                            <SelectInput
                                label="Categories"
                                multiple
                                selectedOption={selectedCategory}
                                onChange={handleCategorySelection}
                                options={categories.map(o => ({ label: o.name, value: o._id }))}
                            />
                            <SelectInput
                                label="Items"
                                multiple
                                selectedOption={selectedItem}
                                onChange={handleItemSelection}
                                options={items.map(o => ({ label: o.name, value: o._id }))}
                            />
                        </div>

                        {/* Section 4: Schedule */}
                        <SectionHeading title="Schedule" />
                        <div className="inputs-row">
                            <InputField
                                label="Start Time"
                                format="##:##"
                                type="text"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="HH:MM"
                                required
                            />
                            <InputField
                                label="End Time"
                                format="##:##"
                                type="text"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="HH:MM"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <SelectInput
                                label="Days"
                                multiple
                                selectedOption={selectedDay}
                                onChange={handleDaySelection}
                                options={weeks}
                            />
                        </div>

                        {/* Section 5: Status */}
                        {isEditing && (
                            <SectionHeading title="Status" />
                        )}
                        {isEditing && (
                            <Checkbox
                                label="Active"
                                checked={status}
                                onChange={() => setStatus(!status)}
                            />
                        )}

                        {/* Section 6: Action Buttons */}
                        <div className="action-btns-container">
                            <GradientButton clickAction={handleSave}>
                                {isEditing ? "Update" : "Create"}
                            </GradientButton>
                            <Button clickAction={() => setShowPopup(false)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="table-section-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <TopBar
                        title="Floor"
                        searchText={search}
                        setSearchText={setSearch}
                        selectedFilter={filterStatus}
                        setSelectedFilter={setFilterStatus}
                    />
                    <div className="add-new-staff-info card">
                        <GradientButton clickAction={() => handleAddData()}>Add Discount/Charge</GradientButton>

                        {filteredData.length === 0 ? (
                            <>
                                <p>No discounts or coupons found.</p>
                            </>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sr No</th>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Outlet Name</th>
                                            <th>Rate</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {item.apply_type
                                                        .split('_')
                                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(' ')}
                                                </td>
                                                <td>{item.name}</td>
                                                <td>{item.outlet_id.name}</td>
                                                <td>{item.type === "fixed" ? `$${item.rate}` : `${item.rate}%`}</td>
                                                <td><div className={`status ${item.status}`}>{item.status}</div></td>
                                                <td>
                                                    <div className="tax-action-btns">
                                                        <button onClick={() => handleEdit(item)}>
                                                            {/* Edit icon SVG */}
                                                            <svg width="14" height="14" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M18 10V17.5C18 17.8978 17.842 18.2794 17.5607 18.5607C17.2794 18.842 16.8978 19 16.5 19H1.5C1.10218 19 0.720644 18.842 0.43934 18.5607C0.158035 18.2794 0 17.8978 0 17.5V2.50001C0 2.10219 0.158035 1.72065 0.43934 1.43935C0.720644 1.15805 1.10218 1.00001 1.5 1.00001H9C9.19891 1.00001 9.38968 1.07903 9.53033 1.21968C9.67098 1.36033 9.75 1.5511 9.75 1.75001C9.75 1.94892 9.67098 2.13969 9.53033 2.28034C9.38968 2.42099 9.19891 2.50001 9 2.50001H1.5V17.5H16.5V10C16.5 9.8011 16.579 9.61033 16.7197 9.46968C16.8603 9.32903 17.0511 9.25001 17.25 9.25001C17.4489 9.25001 17.6397 9.32903 17.7803 9.46968C17.921 9.61033 18 9.8011 18 10ZM18.5306 4.53064L9.53063 13.5306C9.46092 13.6003 9.37818 13.6555 9.28714 13.6931C9.19609 13.7308 9.09852 13.7501 9 13.75H6C5.80109 13.75 5.61032 13.671 5.46967 13.5303C5.32902 13.3897 5.25 13.1989 5.25 13V10C5.24992 9.90149 5.26926 9.80392 5.3069 9.71287C5.34454 9.62183 5.39975 9.53909 5.46937 9.46939L14.4694 0.469385C14.539 0.399653 14.6217 0.344333 14.7128 0.30659C14.8038 0.268847 14.9014 0.24942 15 0.24942C15.0986 0.24942 15.1962 0.268847 15.2872 0.30659C15.3783 0.344333 15.461 0.399653 15.5306 0.469385L18.5306 3.46938C18.6004 3.53904 18.6557 3.62176 18.6934 3.71281C18.7312 3.80385 18.7506 3.90145 18.7506 4.00001C18.7506 4.09857 18.7312 4.19617 18.6934 4.28722C18.6557 4.37826 18.6004 4.46098 18.5306 4.53064ZM16.9369 4.00001L15 2.06032L13.8103 3.25001L15.75 5.1897L16.9369 4.00001Z" fill="black" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(item)}>
                                                            {/* Delete icon SVG */}
                                                            <svg width="14" height="14" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M17.25 3.5H13.5V2.75C13.5 2.15326 13.2629 1.58097 12.841 1.15901C12.419 0.737053 11.8467 0.5 11.25 0.5H6.75C6.15326 0.5 5.58097 0.737053 5.15901 1.15901C4.73705 1.58097 4.5 2.15326 4.5 2.75V3.5H0.75C0.551088 3.5 0.360322 3.57902 0.21967 3.71967C0.0790178 3.86032 0 4.05109 0 4.25C0 4.44891 0.0790178 4.63968 0.21967 4.78033C0.360322 4.92098 0.551088 5 0.75 5H1.5V18.5C1.5 18.8978 1.65804 19.2794 1.93934 19.5607C2.22064 19.842 2.60218 20 3 20H15C15.3978 20 15.7794 19.842 16.0607 19.5607C16.342 19.2794 16.5 18.8978 16.5 18.5V5H17.25C17.4489 5 17.6397 4.92098 17.7803 4.78033C17.921 4.63968 18 4.44891 18 4.25C18 4.05109 17.921 3.86032 17.7803 3.71967C17.6397 3.57902 17.4489 3.5 17.25 3.5ZM6 2.75C6 2.55109 6.07902 2.36032 6.21967 2.21967C6.36032 2.07902 6.55109 2 6.75 2H11.25C11.4489 2 11.6397 2.07902 11.7803 2.21967C11.921 2.36032 12 2.55109 12 2.75V3.5H6V2.75ZM15 18.5H3V5H15V18.5ZM7.5 8.75V14.75C7.5 14.9489 7.42098 15.1397 7.28033 15.2803C7.13968 15.421 6.94891 15.5 6.75 15.5C6.55109 15.5 6.36032 15.421 6.21967 15.2803C6.07902 15.1397 6 14.9489 6 14.75V8.75C6 8.55109 6.07902 8.36032 6.21967 8.21967C6.36032 8.07902 6.55109 8 6.75 8C6.94891 8 7.13968 8.07902 7.28033 8.21967C7.42098 8.36032 7.5 8.55109 7.5 8.75ZM12 8.75V14.75C12 14.9489 11.921 15.1397 11.7803 15.2803C11.6397 15.421 11.4489 15.5 11.25 15.5C11.0511 15.5 10.8603 15.421 10.7197 15.2803C10.579 15.1397 10.5 14.9489 10.5 14.75V8.75C10.5 8.55109 10.579 8.36032 10.7197 8.21967C10.8603 8.07902 11.0511 8 11.25 8C11.4489 8 11.6397 8.07902 11.7803 8.21967C11.921 8.36032 12 8.55109 12 8.75Z" fill="black" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Discount;
