import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useFloors = () => {
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Fetch staff floors
    const fetchFloors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5001/api/floors/staff-floors", {
                withCredentials: true,
            });
            setFloors(response.data.floors || []);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch floors.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFloors();
    }, [fetchFloors]);

    // ✅ Create a floor
    const createFloor = async (floorData) => {
        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:5001/api/floors/create",
                floorData,
                { withCredentials: true }
            );
            setFloors((prev) => [...prev, response.data.floor]);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to create floor.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Update a floor
    const updateFloor = async (floorId, updatedData) => {
        setLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:5001/api/floors/update/${floorId}`,
                updatedData,
                { withCredentials: true }
            );
            const updatedFloor = response.data.floor;
            setFloors((prev) =>
                prev.map((floor) => (floor._id === floorId ? updatedFloor : floor))
            );
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update floor.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete a floor
    const deleteFloor = async (floorId) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5001/api/floors/delete/${floorId}`, {
                withCredentials: true,
            });
            setFloors((prev) => prev.filter((floor) => floor._id !== floorId));
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete floor.");
        } finally {
            setLoading(false);
        }
    };

    return {
        floors,
        loading,
        error,
        fetchFloors,
        createFloor,
        updateFloor,
        deleteFloor,
    };
};

export default useFloors;
