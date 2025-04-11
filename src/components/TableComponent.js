import React, { useState, useImperativeHandle, forwardRef } from "react";
import Checkbox from "./Checkbox";
import "./TableComponent.css";
import { toast } from "react-toastify"; // add this if not imported

const generateUniqueId = () => `row-${Date.now()}-${Math.random()}`;

const TableComponent = forwardRef(({ items = [] }, ref) => {
  const [updatedItems, setUpdatedItems] = useState(
    items.map((item) => ({
      ...item,
      preview: "",
      changedFields: {},
      type: item.type || "Veg", // default fallback
    }))
  );

  useImperativeHandle(ref, () => ({
    addNewRow: () => { /* same as before */ },
    importBulkRows: (rows) => {
      const formatted = rows.map((row) => {
        return {
          id: generateUniqueId(),
          image: row.image || "",
          menuName: row.menuName || "",
          price: row.price || "",
          category: row.category || "",
          type: row.type || "Veg",
          status: "Active",
          preview: row.image || "",
          changedFields: { menuName: true, price: true, category: true, type: true, image: true }
        };
      });
      setUpdatedItems((prev) => [...formatted, ...prev]);
      toast.success("Items imported successfully.");
    },
    getUpdatedChanges: () => {
      return updatedItems.filter(item => Object.keys(item.changedFields).length > 0);
    },
    getNewRows: () => {
      return updatedItems.filter(item => !items.some(existing => existing.id === item.id));
    }
  }));

  const handleImageChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      setUpdatedItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                preview: URL.createObjectURL(file),
                file,
                changedFields: { ...item.changedFields, image: true }
              }
            : item
        )
      );
    }
  };

  const handleFieldChange = (id, field, value) => {
    setUpdatedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              changedFields: { ...item.changedFields, [field]: true }
            }
          : item
      )
    );
  };

  return (
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
          {updatedItems.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>
                <div className="image-upload">
                  {(row.preview || row.image) && (
                    <img
                      src={row.preview || row.image}
                      alt="preview"
                      className="preview-image"
                    />
                  )}
                  <label htmlFor={`file-upload-${row.id}`}>Update</label>
                  <input
                    id={`file-upload-${row.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, row.id)}
                  />
                </div>
              </td>
              <td>
                <input
                  type="text"
                  value={row.menuName}
                  onChange={(e) => handleFieldChange(row.id, "menuName", e.target.value)}
                  placeholder="Enter menu name"
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.price}
                  onChange={(e) => handleFieldChange(row.id, "price", e.target.value)}
                  placeholder="Enter sale price"
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.category}
                  onChange={(e) => handleFieldChange(row.id, "category", e.target.value)}
                  placeholder="Enter category"
                />
              </td>
              <td>
                <select
                  value={row.type}
                  onChange={(e) => handleFieldChange(row.id, "type", e.target.value)}
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </td>
              <td>{row.status}</td>
              <td>
                <button className="delete-btn">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default TableComponent;
