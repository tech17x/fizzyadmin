import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SelectInput from '../components/SelectInput';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import InputField from '../components/InputField';
import './WhatsAppSetupPage.css';
import useFilteredData from '../hooks/filterData';
import Checkbox from '../components/Checkbox';
import Loader from '../components/Loader';
import TopBar from '../components/TopBar';
import AuthContext from '../context/AuthContext';
import HeadingText from '../components/HeadingText';

const WhatsAppSetupPage = () => {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);

    const [data, setData] = useState([]);
    const [whatsAppApiUrl] = useState('https://graph.facebook.com/v17.0');

    const [name, setName] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [phoneNumberId, setPhoneNumberId] = useState('');
    const [businessAccountId, setBusinessAccountId] = useState('');
    const [status, setStatus] = useState('');
    const [id, setId] = useState(null);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (staff.permissions?.includes('whatsapp_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    const fetchWhatsAppCredentials = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/whatsapp/accessible`, { withCredentials: true });
            setData(response.data.credentials || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to fetch WhatsApp credentials");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchWhatsAppCredentials();
    }, [fetchWhatsAppCredentials]);

    const handleBrandSelection = (brand) => {
        setSelectedBrand(brand);
        const filtered = outlets.filter(outlet => outlet.brand_id === brand.value);
        setFilteredOutlets(filtered);
        setSelectedOutlet(null);
        if (filtered.length === 0) toast.error('Selected brand has no outlets.');
    };

    const handleOutletSelection = (outlet) => {
        setSelectedOutlet(outlet);
    };

    const handleEdit = (item) => {
        setLoading(true);
        setIsEditing(true);
        setId(item._id);
        setName(item.name);
        setAccessToken(item.accessToken);
        setBusinessAccountId(item.businessAccountId);
        setPhoneNumberId(item.phoneNumberId);
        setStatus(item.status === 'active');
        const selectedBrand = brands.find(brand => brand._id === (item.brand_id?._id || item.brand_id));
        // Step 1: Handle Brand First

        if (selectedBrand) {
            handleBrandSelection({ label: selectedBrand.full_name, value: selectedBrand._id });
        }

        const selectedOutlet = outlets.find(outlet => outlet._id === item.outlet_id?._id);
        if (selectedOutlet) {
            handleOutletSelection({ label: selectedOutlet.name, value: selectedOutlet._id });
        } else {
            handleOutletSelection(null);
        }

        setShowPopup(true);
        setLoading(false);
    };

    const handleAdd = () => {
        setIsEditing(false);
        setId(null);
        setName('');
        setAccessToken('');
        setBusinessAccountId('');
        setPhoneNumberId('');
        setStatus(true);
        setSelectedBrand(null);
        setSelectedOutlet(null);
        setShowPopup(true);
    };

    const handleFetchTemplates = async () => {
        try {
            if (!accessToken || !phoneNumberId || !businessAccountId) {
                toast.error('Please fill all fields!');
                return false;
            }

            const res = await axios.get(`${whatsAppApiUrl}/${businessAccountId}/message_templates`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const fetchedTemplates = res.data.data;
            if (fetchedTemplates.length === 0) {
                toast.error('No templates found!');
                return false;
            }

            toast.success('Templates fetched successfully!');
            return true;
        } catch (error) {
            toast.error('Failed to fetch templates!');
            return false;
        }
    };

    const handleSave = async () => {
        setLoading(true);
        if (!selectedBrand || !selectedOutlet || !name || !accessToken || !businessAccountId || !phoneNumberId) {
            toast.error('All fields are required.');
            setLoading(false);
            return;
        }

        const templatesFetched = await handleFetchTemplates();
        if (!templatesFetched) {
            setLoading(false);
            return;
        }

        const payload = {
            whatsAppApiUrl,
            name,
            accessToken,
            businessAccountId,
            phoneNumberId,
            brand_id: selectedBrand.value,
            outlet_id: selectedOutlet.value,
            status: status ? 'active' : 'inactive',
        };

        try {
            if (isEditing) {
                await axios.put(`${API}/api/whatsapp/update/${id}`, payload, { withCredentials: true });
                toast.success('WhatsApp credentials updated successfully.');
            } else {
                await axios.post(`${API}/api/whatsapp/create`, payload, { withCredentials: true });
                toast.success('WhatsApp credentials added successfully.');
            }
            fetchWhatsAppCredentials();
            setShowPopup(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save credentials.');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useFilteredData({
        data,
        searchTerm: search,
        searchKeys: ['name', 'brand_id.short_name', 'outlet_id.name'],
        filters: { status: filterStatus },
    });

    return (
        <>
            {loading && <Loader />}

            {
                showPopup ?
                    <div className='card'>
                        <HeadingText title={`${isEditing ? "Edit" : "Add"} Whatsapp Credentials`} />
                        <div className="inputs-container">
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
                                    placeholder="Enter Name"
                                    required
                                />
                                <InputField
                                    label="Access Token"
                                    type="text"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    placeholder="Enter token"
                                    required
                                />
                            </div>
                            <div className="inputs-row">
                                <InputField
                                    label="Business ID"
                                    type="text"
                                    value={businessAccountId}
                                    onChange={(e) => setBusinessAccountId(e.target.value)}
                                    placeholder="Enter business id"
                                    required
                                />
                                <InputField
                                    label="Number ID"
                                    type="text"
                                    value={phoneNumberId}
                                    onChange={(e) => setPhoneNumberId(e.target.value)}
                                    placeholder="Enter phone id"
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
                                        /> : null
                                }
                            </div>
                        </div>

                        <div className="action-btns-container">
                            <GradientButton clickAction={handleSave}>
                                {
                                    isEditing ? "Update" : "Add"
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
                            selectedFilter={filterStatus}
                            setSelectedFilter={setFilterStatus}
                        />
                        <div className="add-new-staff-info card">
                            <GradientButton clickAction={handleAdd}>Add Whatsapp Credentials</GradientButton>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sr No</th>
                                            <th>Name</th>
                                            <th>Brand</th>
                                            <th>Outlet</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item, index) => (
                                            <tr key={item._id}>
                                                <td>{index + 1}</td>
                                                <td>{item.name}</td>
                                                <td>{item.brand_id?.name}</td>
                                                <td>{item.outlet_id?.name}</td>
                                                <td><span className={`status ${item.status}`}>{item.status}</span></td>
                                                <td>
                                                    <button onClick={() => handleEdit(item)}>
                                                        <svg width="14" height="14" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M18 10V17.5C18 17.8978 17.842 18.2794 17.5607 18.5607C17.2794 18.842 16.8978 19 16.5 19H1.5C1.10218 19 0.720644 18.842 0.43934 18.5607C0.158035 18.2794 0 17.8978 0 17.5V2.50001C0 2.10219 0.158035 1.72065 0.43934 1.43935C0.720644 1.15805 1.10218 1.00001 1.5 1.00001H9C9.19891 1.00001 9.38968 1.07903 9.53033 1.21968C9.67098 1.36033 9.75 1.5511 9.75 1.75001C9.75 1.94892 9.67098 2.13969 9.53033 2.28034C9.38968 2.42099 9.19891 2.50001 9 2.50001H1.5V17.5H16.5V10C16.5 9.8011 16.579 9.61033 16.7197 9.46968C16.8603 9.32903 17.0511 9.25001 17.25 9.25001C17.4489 9.25001 17.6397 9.32903 17.7803 9.46968C17.921 9.61033 18 9.8011 18 10ZM18.5306 4.53064L9.53063 13.5306C9.46092 13.6003 9.37818 13.6555 9.28714 13.6931C9.19609 13.7308 9.09852 13.7501 9 13.75H6C5.80109 13.75 5.61032 13.671 5.46967 13.5303C5.32902 13.3897 5.25 13.1989 5.25 13V10C5.24992 9.90149 5.26926 9.80392 5.3069 9.71287C5.34454 9.62183 5.39975 9.53909 5.46937 9.46939L14.4694 0.469385C14.539 0.399653 14.6217 0.344333 14.7128 0.30659C14.8038 0.268847 14.9014 0.24942 15 0.24942C15.0986 0.24942 15.1962 0.268847 15.2872 0.30659C15.3783 0.344333 15.461 0.399653 15.5306 0.469385L18.5306 3.46938C18.6004 3.53904 18.6557 3.62176 18.6934 3.71281C18.7312 3.80385 18.7506 3.90145 18.7506 4.00001C18.7506 4.09857 18.7312 4.19617 18.6934 4.28722C18.6557 4.37826 18.6004 4.46098 18.5306 4.53064ZM16.9369 4.00001L15 2.06032L13.8103 3.25001L15.75 5.1897L16.9369 4.00001Z" fill="black" />
                                                        </svg>
                                                    </button>
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
    );
};

export default WhatsAppSetupPage;
