import { useState, useEffect } from "react";
import axios from "axios";

const useFetchOutlets = () => {
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const response = await axios.get(`http://88.222.244.251:5001/api/outlets/assigned/outlets`, {
                    withCredentials: true,
                });
                setOutlets(response.data);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch outlets.");
            } finally {
                setLoading(false);
            }
        };

        fetchOutlets();
    }, []);

    return { outlets, loading, error };
};

export default useFetchOutlets;