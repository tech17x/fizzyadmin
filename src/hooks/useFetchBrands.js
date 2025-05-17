import { useState, useEffect } from "react";
import axios from "axios";

const useFetchBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBrandNames = async () => {
            try {
                const response = await axios.get(`https://api.techseventeen.com/api/brands/assigned/short`, {
                    withCredentials: true,
                });
                setBrands(response.data);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch brands.");
            } finally {
                setLoading(false);
            }
        };

        fetchBrandNames();
    }, []);

    return { brands, loading, error };
};

export default useFetchBrands;
