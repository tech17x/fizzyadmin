import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const useBrands = () => {
    const { staff } = useContext(AuthContext);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Fetch brands based on staff.brands (Array of brand IDs)
    const fetchBrands = useCallback(async () => {
        if (!staff || !staff.brands.length) {
            setBrands([]); // Reset if no brands assigned
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5001/api/brands`, {
                params: { brandIds: staff.brands.join(",") }, // Convert array to CSV
                withCredentials: true,
            });
            setBrands(response.data);
            setError(""); // Clear error on success
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch brands.");
        }
        setLoading(false);
    }, [staff]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // ✅ Create a new brand
    const createBrand = async (brandData) => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5001/api/brands", brandData, {
                withCredentials: true,
            });
            setBrands((prevBrands) => [...prevBrands, response.data.brand]); // Append new brand
            setError(""); // Clear error on success
        } catch (error) {
            setError(error.response?.data?.message || "Failed to create brand.");
        }
        setLoading(false);
    };

    // ✅ Update an existing brand
    const updateBrand = async (brandId, updatedData) => {
        setLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:5001/api/brands/${brandId}`,
                updatedData,
                { withCredentials: true }
            );
    
            // Extract updated brand from response
            const updatedBrand = response.data.brand;
    
            setBrands((prevBrands) =>
                prevBrands.map((brand) =>
                    brand._id === brandId ? updatedBrand : brand
                )
            );
    
            setError(""); // Clear error on success
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update brand.");
        }
        setLoading(false);
    };    

    // ✅ Delete a brand
    const deleteBrand = async (brandId) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5001/api/brands/${brandId}`, {
                withCredentials: true,
            });
            setBrands((prevBrands) => prevBrands.filter((brand) => brand._id !== brandId));
            setError(""); // Clear error on success
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete brand.");
        }
        setLoading(false);
    };

    return { brands, loading, error, fetchBrands, createBrand, updateBrand, deleteBrand };
};

export default useBrands;
