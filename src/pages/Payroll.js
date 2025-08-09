import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import SelectInput from "../components/SelectInput";
import { toast } from "react-toastify";
import DateRangeFilter from "./shared/DateRangeFilter";

export default function Payroll() {
    const API = process.env.REACT_APP_API_URL;
    const { staff, logout } = useContext(AuthContext);
    const [brands, setBrands] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredOutlets, setFilteredOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [payrollData, setPayrollData] = useState([]);

    useEffect(() => {
        if (staff.permissions?.includes('tax_manage')) {
            setOutlets(staff.outlets);
            setBrands(staff.brands);
        } else {
            logout();
        }
    }, [staff, logout]);

    useEffect(() => {
        if (!dateRange.start || !dateRange.end || !selectedBrand || !selectedOutlet) return;

        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/api/payroll`, {
                    params: {
                        brand_id: selectedBrand.value,
                        outlet_id: selectedOutlet.value,
                        // Send plain YYYY-MM-DD (no new Date(), no toISOString())
                        start_date: dateRange.start,
                        end_date: dateRange.end
                    },
                    withCredentials: true,
                });

                if (res.data.success) {
                    setPayrollData(res.data.data);
                } else {
                    toast.error("No payroll data found");
                }
            } catch (error) {
                toast.error('Failed to fetch payroll data');
                console.error(error);
            }
        };

        fetchData();
    }, [selectedBrand, selectedOutlet, dateRange, API]);

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
    };

    return (
        <>
            <h1>Payroll</h1>
            <div>
                <SelectInput
                    label="Select Brand"
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
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            <div>
                <h2>Results</h2>
                {payrollData.length === 0 && <p>No records</p>}
                {payrollData.map((item, idx) => (
                    <div key={idx}>
                        <strong>{item.date}</strong> – {item.outlet?.name}
                    </div>
                ))}
            </div>
        </>
    );
}
