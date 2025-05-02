// src/pages/Brand.js

import { useCallback, useEffect, useState } from 'react';
import HeadingText from '../components/HeadingText';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import './Tax.css';
import './Discount.css';
import '../components/TableStyles.css';
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
import SMSPortal from '../components/SMSPortal';

const Customer = () => {
    const API = process.env.REACT_APP_API_URL;
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();
    const [data, setData] = useState([]);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [filteredOutlets, setFilteredOutlets] = useState([]);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [dataId, setDataId] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [dob, setDob] = useState('');
    const [anniversary, setAnniversary] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');
    const [status, setStatus] = useState(false);
    const [orderHistory, setOrderHistory] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedFile, setSelectedFile] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('Select file');

    const [showModel, setShowModel] = useState(false);
    const [bulkData, setBulkData] = useState([]);

    const [showSMSModel, setShowSMSModel] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // ✅ Fetch staff floors
    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/customers/accessible`, {
                withCredentials: true,
            });
            setData(response.data.customers || []);
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
        setName('');
        setEmail('');
        setMobile('');
        setDob('');
        setAnniversary('');
        setStreet('');
        setCity('');
        setState('');
        setZip('');
        setCountry('');
        setStatus(true);
        setOrderHistory([]);
        setShowPopup(true);
        setLoading(false);
    }

    const handleEdit = async (data) => {
        setLoading(true);
        setIsEditing(true);
        setDataId(data._id);
        // Step 1: Handle Brand First
        handleBrandSelection(data.brand_id);

        // Step 2: Now select Outlet
        const selectedOutlet = outlets.find(outlet => outlet._id === data.outlet_id?._id);
        if (selectedOutlet) {
            handleOutletSelection({
                label: selectedOutlet.name,
                value: selectedOutlet._id,
            });
        } else {
            handleOutletSelection(null);
        }

        setName(data.name);
        setEmail(data.email);
        setMobile(data.phone);
        setDob(data.dob);
        setAnniversary(data.anniversary_date);
        setStreet(data.address.street);
        setCity(data.address.city);
        setState(data.address.state);
        setZip(data.address.zip);
        setCountry(data.address.country);
        setStatus(data.status === "active" ? true : false);
        setOrderHistory(data.order_history);
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

    const handleOutletSelection = (outlet) => {
        if (outlet) {
            setSelectedOutlet(outlet);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            "brand_id": selectedBrand?._id,
            "outlet_id": selectedOutlet?.value,
            "name": name,
            "email": email,
            "phone": mobile,
            "dob": dob,
            "anniversary_date": anniversary,
            "address": {
                "street": street,
                "city": city,
                "state": state,
                "zip": zip,
                "country": country
            },
            "order_history": orderHistory,
            "status": status ? "active" : "inactive"
        }

        if (!selectedBrand || !selectedOutlet || !name) {
            toast.error("Please fill all required fields.");
            setLoading(false);
            return;
        }

        const isDuplicate = (field) => {
            return data?.some((type) => {
                return (
                    type.brand_id._id === selectedBrand?._id &&
                    type[field]?.trim().toLowerCase() === mobile?.trim().toLowerCase() &&
                    type._id !== dataId // exclude self if editing
                );
            });
        };

        if (isDuplicate('phone')) {
            toast.error("Phone already exists in this brand.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                // Assuming you're keeping track of the selected tax to edit
                const response = await axios.put(`${API}/api/customers/update/${dataId}`, payload, { withCredentials: true });
                toast.success("Data updated successfully");
                const updated = response.data.customer;
                setData((prev) =>
                    prev.map((customer) => (customer._id === dataId ? updated : customer))
                );
            } else {
                const response = await axios.post(`${API}/api/customers/create`, payload, { withCredentials: true });
                setData((prev) => [...prev, response.data.customer]);
                toast.success("Data added successfully!")
            }
            setShowPopup(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadCustomerSample = () => {
        const sampleCustomerData = [
            ["Sr No", "Name", "Email", "Phone"],
            [1, "John Doe", "john.doe@example.com", "1234567890"],
            [2, "Jane Smith", "jane.smith@example.com", "9876543210"],
            [3, "Robert Johnson", "robert.johnson@example.com", "4561237890"],
            [4, "Emily Davis", "emily.davis@example.com", "7890123456"],
            [5, "Michael Brown", "michael.brown@example.com", "6547891230"]
        ];

        const csvContent = sampleCustomerData
            .map((row) => row.map((val) => `"${val}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "customer-sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCustomerFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file.");
            return;
        }

        setSelectedFile(file);
        setSelectedFileName(file.name);
    };

    const handleCustomerUploadClick = async () => {
        if (!selectedFile) {
            toast.warn("Please select a CSV file before uploading.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const rows = text
                .split("\n")
                .slice(1)
                .map((line) => line.replace(/"/g, "").split(","))
                .filter((row) => row.length >= 4); // Name, Email, Phone

            if (!rows.length) {
                toast.error("CSV format is invalid or missing required fields.");
                return;
            }

            const parsedCustomers = rows.map((row) => {
                // Phone number formatting: ###-###-####
                const phone = row[3]?.trim();
                const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

                return {
                    name: row[1]?.trim(),
                    email: row[2]?.trim(),
                    phone: formattedPhone || "", // Default to empty if phone is missing or invalid
                    dob: "",                // Empty by default
                    anniversary_date: "",   // Empty by default
                    address: {},            // Empty by default
                    status: "active",       // Default active
                    brand_id: selectedBrand?._id,
                    outlet_id: selectedOutlet?.value,
                };
            });

            setBulkData(parsedCustomers);
            setShowModel(true);
        };
        reader.readAsText(selectedFile);
    };


    const uploadCustomers = async () => {
        if (!selectedBrand) {
            toast.error('Select a brand first');
            return;
        }
        try {
            const response = await axios.post(`${API}/api/customers/upsert`, {
                addedCustomers: bulkData,
                brand_id: selectedBrand?._id,
                outlet_id: selectedOutlet?.value,
            }, {
                withCredentials: true
            });

            const data = response.data;

            if (response.status === 200) {
                const { success = [], failed = [] } = data;

                if (success.length > 0) {
                    toast.success(`${success.length} customers uploaded successfully!`);
                }
                if (failed.length > 0) {
                    toast.error(`${failed.length} customers failed to upload!`);

                    // Correct mapping for error and email
                    failed.forEach((item) => {
                        toast.error(`Failed: ${item?.error || 'Unknown reason'} (${item?.data?.email || 'No email'})`);
                    });
                }

                setData((prev) => [...prev, ...success.map(item => item.customer)]);
                setShowModel(false);
            } else {
                toast.error(data.message || "Upload failed!");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while uploading customers.");
        }
    };


    const hideSMSModel = () => {
        setShowSMSModel(false);
    }

    const handleShowSMSModel = (data) => {
        setSelectedCustomer(data);
        setShowSMSModel(true);
    }

    return (
        <>
            {
                loading && <Loader />
            }
            <HeadingText>Customer</HeadingText>
            <SearchFilterBar
                placeholder={`Search Brand, Outlet, Customer...`}
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={filterStatus}
                onStatusChange={setFilterStatus}
            />
            <div className="add-new-staff-info">
                {/* justifyContent: "flex-end" */}
                <div className="right-shift" style={{ display: "flex", gap: '1rem', }}>
                    <GradientButton clickAction={() => handleAddData()}>Add Customer</GradientButton>
                    <div className="file-upload">
                        <label htmlFor="fileInput" className="custom-file-label">
                            <span className="file-name">{selectedFileName}</span>
                            <span className="browse-btn">Browse</span>
                        </label>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden-file-input"
                            onChange={handleCustomerFileChange}
                        />
                        <GradientButton clickAction={handleCustomerUploadClick}>Upload CSV</GradientButton>
                    </div>
                    <GradientButton clickAction={() => handleDownloadCustomerSample()}>Customer File Format</GradientButton>

                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Sr No</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                {/* <th>Total Visit</th> */}
                                {/* <th>Total Revenue</th> */}
                                <th>Birthdate</th>
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
                                        <td>{item.phone}</td>
                                        <td>{item.email}</td>
                                        {/* <td>{"NA"}</td> */}
                                        {/* <td>{"NA"}</td> */}
                                        <td>{item.dob || "NA"}</td>
                                        <td>{item?.outlet_id?.name || "NA"}</td>
                                        <td><div className={`status ${item.status}`}>{item.status}</div></td>
                                        <td>
                                            <div className="tax-action-btns">
                                                <button onClick={() => handleEdit(item)}>
                                                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M19.3211 6.74688C19.2937 6.68516 18.632 5.21719 17.1609 3.74609C15.2008 1.78594 12.725 0.75 9.99999 0.75C7.27499 0.75 4.79921 1.78594 2.83905 3.74609C1.36796 5.21719 0.703118 6.6875 0.678899 6.74688C0.643362 6.82681 0.625 6.91331 0.625 7.00078C0.625 7.08826 0.643362 7.17476 0.678899 7.25469C0.706242 7.31641 1.36796 8.78359 2.83905 10.2547C4.79921 12.2141 7.27499 13.25 9.99999 13.25C12.725 13.25 15.2008 12.2141 17.1609 10.2547C18.632 8.78359 19.2937 7.31641 19.3211 7.25469C19.3566 7.17476 19.375 7.08826 19.375 7.00078C19.375 6.91331 19.3566 6.82681 19.3211 6.74688ZM9.99999 10.125C9.38192 10.125 8.77774 9.94172 8.26383 9.59834C7.74993 9.25496 7.34939 8.76691 7.11287 8.19589C6.87634 7.62487 6.81446 6.99653 6.93504 6.39034C7.05562 5.78415 7.35324 5.22733 7.79028 4.79029C8.22732 4.35325 8.78414 4.05562 9.39033 3.93505C9.99652 3.81447 10.6249 3.87635 11.1959 4.11288C11.7669 4.3494 12.255 4.74994 12.5983 5.26384C12.9417 5.77775 13.125 6.38193 13.125 7C13.125 7.8288 12.7958 8.62366 12.2097 9.20971C11.6236 9.79576 10.8288 10.125 9.99999 10.125Z" fill="black" />
                                                    </svg>
                                                </button>
                                                <button onClick={()=>handleShowSMSModel(item)}>
                                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17.1305 13.5907C17.5623 12.695 17.7742 11.7092 17.7486 10.7151C17.7229 9.72108 17.4604 8.7475 16.983 7.87525C16.5055 7.00301 15.8267 6.25728 15.0032 5.70003C14.1796 5.14277 13.2349 4.79007 12.2477 4.67122C11.9192 3.90744 11.4416 3.21688 10.8429 2.63998C10.2442 2.06309 9.53637 1.61144 8.76093 1.3115C7.98549 1.01156 7.158 0.869348 6.32692 0.893197C5.49584 0.917047 4.67787 1.10648 3.9209 1.45039C3.16394 1.79431 2.48321 2.2858 1.91857 2.89609C1.35393 3.50637 0.916724 4.22318 0.632564 5.00454C0.348404 5.78589 0.222999 6.6161 0.263692 7.44653C0.304386 8.27695 0.510359 9.09092 0.869551 9.84075L0.301582 11.7712C0.238079 11.9867 0.233833 12.2154 0.289291 12.4331C0.344749 12.6508 0.457861 12.8496 0.616727 13.0084C0.775593 13.1673 0.97434 13.2804 1.19206 13.3359C1.40978 13.3913 1.63842 13.3871 1.85393 13.3236L3.7844 12.7556C4.40426 13.0534 5.06884 13.2474 5.75158 13.3298C6.08328 14.107 6.56914 14.8089 7.17979 15.393C7.79043 15.977 8.51318 16.4312 9.30434 16.7281C10.0955 17.0249 10.9386 17.1583 11.7828 17.12C12.6269 17.0818 13.4546 16.8728 14.2156 16.5056L16.1461 17.0736C16.3615 17.137 16.5901 17.1412 16.8077 17.0858C17.0253 17.0304 17.224 16.9173 17.3828 16.7586C17.5417 16.5998 17.6548 16.4012 17.7103 16.1836C17.7659 15.966 17.7618 15.7375 17.6985 15.522L17.1305 13.5907ZM15.861 13.7056L16.5 15.8751L14.3313 15.2368C14.1746 15.1914 14.0064 15.2091 13.8625 15.2861C12.7116 15.9006 11.3662 16.0413 10.113 15.6782C8.85983 15.3152 7.79803 14.477 7.15393 13.3423C8.00969 13.253 8.83776 12.9878 9.58619 12.5633C10.3346 12.1389 10.9873 11.5644 11.5032 10.8758C12.0191 10.1872 12.3871 9.39941 12.5842 8.56187C12.7813 7.72434 12.8032 6.85511 12.6485 6.00872C13.3941 6.18447 14.0893 6.5292 14.6806 7.0163C15.2718 7.5034 15.7432 8.11983 16.0584 8.81803C16.3736 9.51623 16.5242 10.2775 16.4985 11.0431C16.4728 11.8088 16.2715 12.5582 15.9102 13.2337C15.8324 13.3784 15.8147 13.5479 15.861 13.7056Z" fill="black" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => toast.info(`No order history for the ${item.name}`)}>
                                                    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M16.5 8.00005C16.5 9.46494 16.0711 10.8978 15.2661 12.1217C14.4611 13.3456 13.3153 14.3069 11.9701 14.887C10.625 15.4672 9.13944 15.6407 7.69683 15.3861C6.25421 15.1316 4.91772 14.4602 3.85234 13.4547C3.79263 13.3983 3.74462 13.3307 3.71105 13.2557C3.67748 13.1807 3.65901 13.0998 3.65668 13.0177C3.65436 12.9356 3.66824 12.8538 3.69752 12.7771C3.7268 12.7003 3.77092 12.6301 3.82734 12.5704C3.9413 12.4498 4.0985 12.3794 4.26435 12.3747C4.34648 12.3724 4.42825 12.3863 4.50501 12.4155C4.58177 12.4448 4.65201 12.4889 4.71172 12.5454C5.60527 13.3883 6.72742 13.9493 7.93796 14.1582C9.14851 14.367 10.3938 14.2145 11.5181 13.7197C12.6425 13.2249 13.5961 12.4097 14.2598 11.376C14.9236 10.3424 15.2679 9.13599 15.25 7.90769C15.232 6.67939 14.8524 5.48362 14.1587 4.46981C13.465 3.45599 12.488 2.66907 11.3496 2.20739C10.2112 1.7457 8.96203 1.62972 7.75812 1.87394C6.5542 2.11815 5.44895 2.71174 4.58047 3.58052C4.30469 3.85942 4.04531 4.13364 3.79297 4.4063L5.06719 5.68286C5.1547 5.77027 5.2143 5.88168 5.23846 6.00298C5.26261 6.12428 5.25023 6.25003 5.20289 6.36429C5.15554 6.47856 5.07536 6.5762 4.97249 6.64487C4.86962 6.71354 4.74869 6.75014 4.625 6.75005H1.5C1.33424 6.75005 1.17527 6.6842 1.05806 6.56699C0.940848 6.44978 0.875 6.29081 0.875 6.12505V3.00005C0.874903 2.87636 0.911506 2.75543 0.980175 2.65256C1.04884 2.54969 1.14649 2.4695 1.26076 2.42216C1.37502 2.37481 1.50076 2.36243 1.62207 2.38659C1.74337 2.41075 1.85478 2.47035 1.94219 2.55786L2.90625 3.52348C3.15781 3.25083 3.41719 2.97661 3.69219 2.69927C4.74069 1.64897 6.07723 0.933359 7.53262 0.642999C8.98801 0.352638 10.4968 0.500585 11.8681 1.06811C13.2394 1.63564 14.4114 2.59724 15.236 3.83119C16.0605 5.06514 16.5004 6.51597 16.5 8.00005ZM9 3.62505C8.83424 3.62505 8.67527 3.69089 8.55806 3.8081C8.44085 3.92531 8.375 4.08429 8.375 4.25005V8.00005C8.37497 8.10795 8.40287 8.21402 8.45599 8.30793C8.50911 8.40185 8.58563 8.48042 8.67812 8.53598L11.8031 10.411C11.8735 10.4533 11.9515 10.4812 12.0327 10.4934C12.1139 10.5055 12.1967 10.5015 12.2764 10.4816C12.356 10.4617 12.431 10.4264 12.497 10.3775C12.563 10.3287 12.6187 10.2673 12.6609 10.1969C12.7032 10.1265 12.7312 10.0485 12.7433 9.96733C12.7554 9.88613 12.7514 9.80334 12.7316 9.72368C12.7117 9.64403 12.6763 9.56907 12.6275 9.50308C12.5786 9.4371 12.5173 9.38138 12.4469 9.33911L9.625 7.64614V4.25005C9.625 4.08429 9.55915 3.92531 9.44194 3.8081C9.32473 3.69089 9.16576 3.62505 9 3.62505Z" fill="black" />
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
                    title={`${isEditing ? "Edit" : "Add"} Customer`}
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
                            <InputField
                                label="Customer Name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter rate"
                                required
                            />
                        </div>
                        <div className="inputs-row">

                            <InputField
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter rate"
                                required
                            />

                            <InputField
                                label="Phone"
                                type="text"
                                format={"###-###-####"}
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="Enter rate"
                                required
                            />
                            <InputField
                                label="Date of birth"
                                type="text"
                                format={"##/##/##"}
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                placeholder="MM/DD/YY"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Anniversarry"
                                type="text"
                                format={"##/##/##"}
                                value={anniversary}
                                onChange={(e) => setAnniversary(e.target.value)}
                                placeholder="MM/DD/YY"
                                required
                            />
                            <InputField
                                label="street"
                                type="text"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="MM/DD/YY"
                                required
                            />
                            <InputField
                                label="city"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="MM/DD/YY"
                                required
                            />
                        </div>
                        <div className="inputs-row">

                            <InputField
                                label="state"
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="MM/DD/YY"
                                required
                            />
                            <InputField
                                label="Zip"
                                type="text"
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                placeholder="MM/DD/YY"
                                required
                            />

                            <InputField
                                label="Country"
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="MM/DD/YY"
                                required
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
            {
                showModel &&
                <Popup
                    title={`Select Brand`}
                    closePopup={() => { setSelectedBrand(null); setSelectedOutlet(null); setBulkData([]); setSelectedFile(""); setSelectedFileName(''); setShowModel(false); }}
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
                    </div>
                    <div className="action-btns-container">
                        <GradientButton clickAction={uploadCustomers}>Upload</GradientButton>
                        <Button clickAction={() => { setSelectedBrand(null); setSelectedOutlet(null); setBulkData([]); setSelectedFile(""); setSelectedFileName(''); setShowModel(false); }}>Close</Button>
                    </div>
                </Popup>
            }
            {
                showSMSModel &&
                <SMSPortal hideSMSModel={hideSMSModel} customer={selectedCustomer}/>
            }
        </>
    )
}

export default Customer;
