// src/pages/Brand.js

import { useCallback, useEffect, useState } from 'react';
import HeadingText from '../components/HeadingText';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import './Tax.css';
import './Table.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import InputField from '../components/InputField';
import Popup from '../components/Popup';
import Checkbox from '../components/Checkbox';
import SearchFilterBar from '../components/SearchFilterBar';
import useFetchBrands from '../hooks/useFetchBrands';
import useFetchOutlets from '../hooks/useFetchOutlets';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../components/Loader';

const tableTypes = [
    { label: "square", value: "square" },
    { label: "rectangle", value: "rectangle" },
    { label: "circle", value: "circle" },
    { label: "other", value: "other" },
]

const Table = () => {
    const API = process.env.REACT_APP_API_URL;
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();
    const [tables, setTables] = useState([]);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const [floors, setFloors] = useState([]);
    const [filteredFloors, setFilteredFloors] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showPopup, setShowPopup] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [tableName, setTableName] = useState("");
    const [sitting, setSitting] = useState(0);
    const [selectedType, setSelectedType] = useState(null);
    const [tableStatus, setTableStatus] = useState(null);
    const [tableId, setTableId] = useState(null);

    // ✅ Fetch staff floors
    const fetchTables = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/api/tables/staff-tables`, {
                withCredentials: true,
            });
            setTables(response.data.tables || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch floors.");
        } finally {
            setLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    useEffect(() => {
        fetchFloorsShort();
    }, [])

    const fetchFloorsShort = async () => {
        try {
            const response = await axios.get("http://localhost:5002/api/floors/staff-floors/shorts", {
                withCredentials: true,
            });
            setFloors(response.data.floors || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error(error.response?.data?.message || "Failed to fetch floors.");
        }
    }


    const handleAddTable = () => {
        setIsEditing(false);
        setSelectedOutlet(null);
        setSelectedBrand(null);
        setSelectedFloor(null);
        setTableName("");
        setSitting(0);
        setSelectedType(null);
        setTableStatus(true);
        setTableId(null);
        setShowPopup(true);
    }

    const handleEditTable = (table) => {
        setIsEditing(true);
        setTableName(table.table_name);
        setTableId(table._id);
        setSitting(table.sitting);
        setTableStatus(table.status === "active" ? true : false);
        handleBrandSelection(table.brand_id);
        handleTableTypeSelection(tableTypes.find(type => type.value === table.type));
        handleFloorSelection(floors.find(floor => floor._id === table.floor_id?._id));
        const selectedOutlet = outlets.find(outlet => outlet._id === table.outlet_id?._id);
        if (selectedOutlet) {
            handleOutletSelection({
                label: selectedOutlet.name,
                value: selectedOutlet._id,
            });
        } else {
            handleOutletSelection(null); // In case outlet not found
        }
        setShowPopup(true);
    }

    const handleSave = async () => {
        setLoading(true);
        if (!selectedBrand || !selectedOutlet || !selectedType || !selectedFloor || !tableName || !sitting) {
            toast.error("Please fill all required fields.");
            setLoading(false);
            return;
        }

        const isDuplicate = (field) => {
            return tables?.some((type) => {
                return (
                    type.floor_id._id === selectedFloor?.value &&
                    type[field]?.trim().toLowerCase() === tableName?.trim().toLowerCase() &&
                    type._id !== tableId // exclude self if editing
                );
            });
        };

        if (isDuplicate('table_name')) {
            toast.error("Same name table already exist for the floor.");
            setLoading(false);
            return
        }

        const payload = {
            brand_id: selectedBrand._id,
            outlet_id: selectedOutlet?.value,
            floor_id: selectedFloor?.value,
            table_name: tableName,
            sitting: sitting,
            type: selectedType.value,
            status: tableStatus ? "active" : "inactive",
        };

        try {
            if (isEditing && tableId) {
                await updateTable(tableId, payload);
                toast.success("Table updated successfully");
            } else {
                await createTable(payload);
                toast.success("Floor added successfully");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

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
        setSelectedOutlet(outlet);
        const filteredFloors = floors.filter(floor => floor.outlet_id === outlet.value);
        setFilteredFloors(filteredFloors);
        setSelectedFloor(null);
    }

    const handleTableTypeSelection = (type) => {
        setSelectedType(type);
    }

    const handleFloorSelection = (floor) => {
        setSelectedFloor(floor);
    }

    const filteredTable = tables.filter((table) => {
        const searchLower = search.toLowerCase();
        const statusLower = status?.toLowerCase();

        // Check if order type name matches
        const matchesName = table.table_name?.toLowerCase().includes(searchLower);

        // Check if associated brand name or short_name matches
        const matchesBrand = table.brand_id &&
            (
                table.brand_id.name?.toLowerCase().includes(searchLower) ||
                table.brand_id.short_name?.toLowerCase().includes(searchLower)
            );

        // Check if associated outlet name matches
        const matchesOutlet = table.outlet_id &&
            table.outlet_id.name?.toLowerCase().includes(searchLower);

        const matchesSearch = matchesName || matchesBrand || matchesOutlet;

        // Check if order type status matches (or no status filter applied)
        const matchesStatus = !status || table.status?.toLowerCase() === statusLower;

        return matchesSearch && matchesStatus;
    });

    // ✅ Create a table
    const createTable = async (tableData) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${API}/api/tables/create`,
                tableData,
                { withCredentials: true }
            );
            setTables((prev) => [...prev, response.data.table]);
            setShowPopup(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create table.");
        }
    };

    // ✅ Update a table
    const updateTable = async (tableId, updatedData) => {
        setLoading(true);
        try {
            const response = await axios.put(
                `${API}/api/tables/update/${tableId}`,
                updatedData,
                { withCredentials: true }
            );
            const updatedTable = response.data.table;
            setTables((prev) =>
                prev.map((table) => (table._id === tableId ? updatedTable : table))
            );
            setShowPopup(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update table.");
        }
    };

    return (
        <>
            {
                loading && <Loader />
            }
            <HeadingText>Table</HeadingText>
            <SearchFilterBar
                placeholder="Search Brand, Outlet, Tables..."
                searchValue={search}
                onSearchChange={setSearch}
                statusValue={status}
                onStatusChange={setStatus}
            />
            <div className="add-new-staff-info">
                <GradientButton clickAction={handleAddTable}>Add Table</GradientButton>
                {
                    tables.length > 0 ?
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sr No</th>
                                        <th>Table Name</th>
                                        <th>Outlet Name</th>
                                        <th>Floor</th>
                                        <th>Sitting</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        filteredTable.map((table, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{table.table_name}</td>
                                                <td>{table.outlet_id.name}</td>
                                                <td>{table.floor_id.floor_name}</td>
                                                <td>{table.sitting}</td>
                                                <td><div className={`status ${table.status}`}>{table.status}</div></td>
                                                <td>
                                                    <div className="tax-action-btns">
                                                        <button onClick={() => handleEditTable(table)}>
                                                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M18 10V17.5C18 17.8978 17.842 18.2794 17.5607 18.5607C17.2794 18.842 16.8978 19 16.5 19H1.5C1.10218 19 0.720644 18.842 0.43934 18.5607C0.158035 18.2794 0 17.8978 0 17.5V2.50001C0 2.10219 0.158035 1.72065 0.43934 1.43935C0.720644 1.15805 1.10218 1.00001 1.5 1.00001H9C9.19891 1.00001 9.38968 1.07903 9.53033 1.21968C9.67098 1.36033 9.75 1.5511 9.75 1.75001C9.75 1.94892 9.67098 2.13969 9.53033 2.28034C9.38968 2.42099 9.19891 2.50001 9 2.50001H1.5V17.5H16.5V10C16.5 9.8011 16.579 9.61033 16.7197 9.46968C16.8603 9.32903 17.0511 9.25001 17.25 9.25001C17.4489 9.25001 17.6397 9.32903 17.7803 9.46968C17.921 9.61033 18 9.8011 18 10ZM18.5306 4.53064L9.53063 13.5306C9.46092 13.6003 9.37818 13.6555 9.28714 13.6931C9.19609 13.7308 9.09852 13.7501 9 13.75H6C5.80109 13.75 5.61032 13.671 5.46967 13.5303C5.32902 13.3897 5.25 13.1989 5.25 13V10C5.24992 9.90149 5.26926 9.80392 5.3069 9.71287C5.34454 9.62183 5.39975 9.53909 5.46937 9.46939L14.4694 0.469385C14.539 0.399653 14.6217 0.344333 14.7128 0.30659C14.8038 0.268847 14.9014 0.24942 15 0.24942C15.0986 0.24942 15.1962 0.268847 15.2872 0.30659C15.3783 0.344333 15.461 0.399653 15.5306 0.469385L18.5306 3.46938C18.6004 3.53904 18.6557 3.62176 18.6934 3.71281C18.7312 3.80385 18.7506 3.90145 18.7506 4.00001C18.7506 4.09857 18.7312 4.19617 18.6934 4.28722C18.6557 4.37826 18.6004 4.46098 18.5306 4.53064ZM16.9369 4.00001L15 2.06032L13.8103 3.25001L15.75 5.1897L16.9369 4.00001Z" fill="black" />
                                                            </svg>
                                                        </button>
                                                        {/* <button>
                                                                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        </div> : null
                }
            </div>
            {
                showPopup &&
                <Popup
                    title={"Table Information"}
                    closePopup={() => setShowPopup(false)}
                >
                    <div className="inputs-container">
                        <div className="inputs-row">
                            <SelectInput
                                label="Select Brand"
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
                                label="Floor"
                                selectedOption={selectedFloor}
                                onChange={(floor) => handleFloorSelection(floor)}
                                options={filteredFloors.map(f => ({ label: f.floor_name, value: f._id }))}
                            />
                            <InputField
                                label="Table Name"
                                type="text"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                placeholder="Enter Table name"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Table Sitting"
                                type="number"
                                value={sitting}
                                onChange={(e) => setSitting(e.target.value)}
                                placeholder="Enter Table Sitting"
                                required
                            />
                            <SelectInput
                                label="Table Type"
                                selectedOption={selectedType}
                                onChange={(type) => handleTableTypeSelection(type)}
                                options={tableTypes}
                            />
                        </div>
                        <div className="checkbox-container">
                            {
                                isEditing ?
                                    <Checkbox
                                        label="Status"
                                        checked={tableStatus}
                                        onChange={() => setTableStatus(!tableStatus)}
                                    /> : null
                            }
                        </div>

                    </div>

                    <div className="action-btns-container">
                        <GradientButton clickAction={handleSave}>
                            {isEditing ? "Update" : "Create"}
                        </GradientButton>
                        <Button clickAction={() => setShowPopup(false)}>Close</Button>
                    </div>
                </Popup>
            }
        </>
    )
}

export default Table;
