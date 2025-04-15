import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const useOutlets = () => {
    const { staff } = useContext(AuthContext);
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Fetch outlets based on staff.outlets (Array of outlet IDs)
    const fetchOutlets = useCallback(async () => {
        console.log("Staff inside useOutlets:", staff);
        if (!staff || !staff.outlets.length) {
            setOutlets([]); // Reset if no outlets assigned
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get("http://88.222.244.251:5001/api/outlets", {
                withCredentials: true,
            });
            setOutlets(response.data);
            setError(""); // Clear error on success
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch outlets.");
        }
        setLoading(false);
    }, [staff]);

    useEffect(() => {
        console.log("Calling fetchOutlets...");
        fetchOutlets();
    }, [fetchOutlets]);

    // ✅ Create a new outlet
    const createOutlet = async (outletData) => {
        setLoading(true);
        try {
            const response = await axios.post("http://88.222.244.251:5001/api/outlets", outletData, {
                withCredentials: true,
            });
            setOutlets((prevOutlets) => [...prevOutlets, response.data.outlet]); // Append new outlet
            setError(""); // Clear error on success
        } catch (error) {
            setError(error.response?.data?.message || "Failed to create outlet.");
        }
        setLoading(false);
    };

    // ✅ Update an existing outlet
    const updateOutlet = async (outletId, updatedData) => {
        setLoading(true);
        try {
            const response = await axios.put(
                `http://88.222.244.251:5001/api/outlets/${outletId}`,
                updatedData,
                { withCredentials: true }
            );
    
            // Extract updated outlet from response
            const updatedOutlet = response.data.outlet;
    
            setOutlets((prevOutlets) =>
                prevOutlets.map((outlet) =>
                    outlet._id === outletId ? updatedOutlet : outlet
                )
            );
    
            setError(""); // Clear error on success
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update outlet.");
            setLoading(false);
            return;
        }
    };

    return { outlets, loading, error, fetchOutlets, createOutlet, updateOutlet };
};

export default useOutlets;
