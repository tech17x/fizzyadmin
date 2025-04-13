import React from "react";
import './TableComponent.css';

const TableRow = ({ item, index, onFieldChange, onImageChange, onDelete }) => {
  return (
    <tr key={item._id}>
      <td>{index + 1}</td>
      <td>
        <div className="image-upload">
          {(item.preview || item.image) && (
            <img
              src={item.preview || item.image}
              alt="preview"
              className="preview-image"
            />
          )}
          <label htmlFor={`file-upload-${item._id}`}>Update</label>
          <input
            id={`file-upload-${item._id}`}
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e, item._id)}
          />
        </div>
      </td>
      <td>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onFieldChange(item._id, "name", e.target.value)}
          placeholder="Enter menu name"
          required
        />
      </td>
      <td>
        <input
          type="text"
          value={item.price}
          onChange={(e) => onFieldChange(item._id, "price", e.target.value)}
          placeholder="Enter sale price"
          required
        />
      </td>
      <td>
        <input
          type="text"
          value={item.category_id?.name || item.category_name || ''}
          onChange={(e) =>
            onFieldChange(item._id, "category_name", e.target.value)
          }
          placeholder="Enter category name"
        />
      </td>
      <td>
        <select
          value={item.food_type}
          onChange={(e) => onFieldChange(item._id, "food_type", e.target.value)}
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="vegan">Vegan</option>
        </select>
      </td>
      <td>
        <select
          value={item.status}
          onChange={(e) => onFieldChange(item._id, "status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </td>
      <td>
        <button className="delete-btn" onClick={() => onDelete(item._id)}>
          🗑️
        </button>
      </td>
    </tr>
  );
};

export default TableRow;
