import React, { useState, useEffect } from "react";
import axios from "axios";
import TableRow from "./TableRow";
import GradientButton from "./GradientButton";
import Button from "./Button";
import { toast } from "react-toastify";

const EditMenu = ({ menuId, brandOutletIds, closeMenuDetails }) => {
    const [items, setItems] = useState([]);
    const [initialItems, setInitialItems] = useState([]);
    const [selectedFileName, setSelectedFileName] = useState("No file chosen");
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchItems(menuId);
    }, [menuId]);

    const fetchItems = async (id) => {
        try {
            const res = await axios.get(`http://88.222.244.251:5001/api/items/menu/${id}`, {
                withCredentials: true,
            });
            setItems(res.data.items || []);
            setInitialItems(res.data.items || []); // Save the fetched items as initial state
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };


    const handleFieldChange = (id, field, value) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item._id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const handleImageChange = (e, id) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setItems((prevItems) =>
                prevItems.map((item) =>
                    item._id === id ? { ...item, image: imageUrl } : item
                )
            );
        }
    };

    const handleAddItem = () => {
        const newItem = {
            _id: Date.now(),
            name: "",
            price: "",
            category_name: "",
            food_type: "veg",
            status: "active",
            image: "",
        };
        setItems((prev) => [...prev, newItem]);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/items/delete/${id}`);
            setItems(items.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };


    const handleDownloadSample = () => {
        const sampleData = [
            ["Name", "Price", "Category", "Food Type", "Image URL", "Status"],
            ["Paneer Momos", 120, "Momos", "Veg", "https://example.com/images/paneer-momos.jpg", "active"],
            ["Spicy Chicken Pizza", 220, "Pizza", "Non-Veg", "https://example.com/images/spicy-chicken-pizza.jpg", "inactive"],
            ["Veg Cheese Burger", 150, "Burger", "Veg", "https://example.com/images/veg-cheese-burger.jpg", "active"],
            ["BBQ Chicken Burger", 180, "Burger", "Non-Veg", "https://example.com/images/bbq-chicken-burger.jpg", "inactive"],
            ["Classic Margherita", 160, "Pizza", "Veg", "https://example.com/images/margherita.jpg", "active"],
            ["Chicken Peri Peri Pizza", 240, "Pizza", "Non-Veg", "https://example.com/images/peri-peri-pizza.jpg", "active"],
            ["Corn Cheese Momos", 130, "Momos", "Veg", "https://example.com/images/corn-cheese-momos.jpg", "inactive"],
            ["Butter Chicken Momos", 170, "Momos", "Non-Veg", "https://example.com/images/butter-chicken-momos.jpg", "active"],
            ["Veggie Delight Pizza", 200, "Pizza", "Veg", "https://example.com/images/veggie-delight.jpg", "inactive"],
            ["Double Chicken Burger", 250, "Burger", "Non-Veg", "https://example.com/images/double-chicken-burger.jpg", "active"],
        ];

        const csvContent = sampleData
            .map((row) => row.map((val) => `"${val}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "menu-sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file.");
            return;
        }

        setSelectedFile(file);
        setSelectedFileName(file.name);
    };

    const handleUploadClick = () => {
        if (!selectedFile) {
            toast.warn("Please select a CSV file before uploading.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const rows = text
                .split("\n")
                .slice(1)
                .map((line) => line.replace(/"/g, "").split(","))
                .filter((row) => row.length >= 6);

            if (!rows.length) {
                toast.error("CSV format is invalid or missing required fields.");
                return;
            }

            const parsedItems = rows.map((row, index) => ({
                _id: Date.now() + index,
                name: row[0],
                price: row[1],
                category_name: row[2],
                food_type: row[3]?.toLowerCase(),
                image: row[4],
                status: row[5]?.toLowerCase(),
            }));

            setItems((prev) => [...prev, ...parsedItems]);
            toast.success("CSV data added successfully.");
        };
        reader.readAsText(selectedFile);
    };

    const handleSave = async () => {
        const changedItems = [];
        const newItems = [];

        // Function to validate item fields
        const validateItem = (item) => {
            let isValid = true;
            let errors = [];

            // Basic validation checks for required fields
            if (!item.name || item.name.trim() === "") {
                isValid = false;
                errors.push("Name is required.");
            }
            if (!item.price || isNaN(item.price) || item.price <= 0) {
                isValid = false;
                errors.push("Price should be a valid positive number.");
            }
            if (!item.category_name || item.category_name.trim() === "") {
                isValid = false;
                errors.push("Category is required.");
            }
            if (!item.food_type || !["veg", "non-veg", "vegan"].includes(item.food_type)) {
                isValid = false;
                errors.push("Food Type should be either 'veg', 'non-veg', or 'vegan'.");
            }
            if (!item.status || !["active", "inactive"].includes(item.status)) {
                isValid = false;
                errors.push("Status should be either 'active' or 'inactive'.");
            }

            return { isValid, errors };
        };

        // Compare initialItems with items to find changes and new items
        items.forEach((item) => {
            const initialItem = initialItems.find((i) => i._id === item._id);

            const { isValid, errors } = validateItem(item);

            if (!isValid) {
                // If invalid fields exist, log the errors and return early
                console.log(`Errors for item ${item._id}:`, errors);
                toast.error(`Errors found for item ${item.name}: ${errors.join(", ")}`);
                return;
            }

            // If the item exists in initialItems but has changed
            if (initialItem && JSON.stringify(initialItem) !== JSON.stringify(item)) {
                changedItems.push(item);
            }

            // If the item is new (not present in initialItems)
            if (!initialItem) {
                newItems.push(item);
            }
        });

        if (changedItems.length === 0 && newItems.length === 0) {
            toast.warn("No changes or new items to save.");
            return;
        }

        console.log("Changed Items:", changedItems);
        console.log("Newly Added Items:", newItems);

        // Prepare the data to send to the API
        const payload = {
            changedItems,
            addedItems: newItems,
            menu_id: menuId, // Ensure to pass the correct menu_id value
            brand_id: brandOutletIds.brand, // Ensure to pass the correct brand_id value
            outlet_id: brandOutletIds.outlet, // Ensure to pass the correct outlet_id value
        };

        // Handle API request for saving changed and new items
        try {
            const response = await axios.post("http://88.222.244.251:5001/api/items/upsert", payload, {
                withCredentials: true
            });
            if (response.data.successCount > 0) {
                toast.success("Items updated successfully!");
            } else {
                toast.error("No items were updated or added.");
            }
        } catch (error) {
            console.error("Error saving items:", error);
            toast.error("Error saving items");
        }
    };



    return (
        <div className="edit-menu" style={{ height: "100%", width: "100%", zIndex: "100" }}>
            <div className="row top-bar">
                <GradientButton clickAction={handleAddItem}>Add Item</GradientButton>

                <div className="file-upload">
                    <label htmlFor="fileInput" className="custom-file-label">
                        <span className="file-name">{selectedFileName}</span>
                        <span className="browse-btn">Browse</span>
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        className="hidden-file-input"
                        onChange={handleFileChange}
                    />
                    <GradientButton clickAction={handleUploadClick}>Upload CSV</GradientButton>
                    <Button clickAction={handleDownloadSample}>Download Format</Button>
                </div>
            </div>

            <div className="tables" style={{ overflowY: "auto", height: "calc(100vh - 150px)" }}>
                <div className="table-container2">
                    <table className="menu-table">
                        <thead>
                            <tr>
                                <th>Sr No</th>
                                <th>Image</th>
                                <th>Menu Name</th>
                                <th>Sale Price</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <>
                                    <TableRow
                                        key={item._id}
                                        item={item}
                                        index={index}
                                        onFieldChange={handleFieldChange}
                                        onImageChange={handleImageChange}
                                        onDelete={handleDelete}
                                    />
                                </>

                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bottom-bar" style={{ position: "absolute", bottom: 0, width: "100%", padding: "10px" }}>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Filter results using any relevant detail..."
                        className="search-input"
                        onChange={(e) => console.log("Search:", e.target.value)}
                    />
                </div>
                <div>
                    <GradientButton clickAction={handleSave}>Save</GradientButton>
                    <Button clickAction={closeMenuDetails}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default EditMenu;
