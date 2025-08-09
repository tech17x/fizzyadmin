import axios from "axios"
import { useContext, useEffect, useState } from "react"
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
                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);

                // Current data
                const res = await axios.get(`${API}/api/payroll`, {
                    params: {
                        brand_id: selectedBrand.value,
                        outlet_id: selectedOutlet.value,
                        start_date: start.toISOString(),
                        end_date: end.toISOString()
                    },
                    withCredentials: true,
                });

                console.log('____________')

                console.log(res);

                console.log('____________');
            } catch (error) {
                toast.error('Failed to fetch sales data');
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
        </>
    )
}