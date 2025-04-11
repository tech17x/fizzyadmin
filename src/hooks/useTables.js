import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useTables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Fetch staff tables
    const fetchTables = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5001/api/tables/staff-tables", {
                withCredentials: true,
            });
            setTables(response.data.tables || []);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch tables.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    // ✅ Create a table
    const createTable = async (tableData) => {
        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:5001/api/tables/create",
                tableData,
                { withCredentials: true }
            );
            setTables((prev) => [...prev, response.data.table]);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to create table.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Update a table
    const updateTable = async (tableId, updatedData) => {
        setLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:5001/api/tables/update/${tableId}`,
                updatedData,
                { withCredentials: true }
            );
            const updatedTable = response.data.table;
            setTables((prev) =>
                prev.map((table) => (table._id === tableId ? updatedTable : table))
            );
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update table.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete a table
    const deleteTable = async (tableId) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5001/api/tables/delete/${tableId}`, {
                withCredentials: true,
            });
            setTables((prev) => prev.filter((table) => table._id !== tableId));
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete table.");
        } finally {
            setLoading(false);
        }
    };

    return {
        tables,
        loading,
        error,
        fetchTables,
        createTable,
        updateTable,
        deleteTable,
    };
};

export default useTables;
