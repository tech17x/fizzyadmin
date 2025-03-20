import React, { useState } from "react";
// import "./TableStyles.css";

const InputField = ({ type, value, onChange, placeholder, required }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} required className="input-field" />
);

const SelectInput = ({ options, value, onChange }) => (
  <select value={value} onChange={onChange} className="select-field">
    {options.map((option, index) => (
      <option key={index} value={option}>{option}</option>
    ))}
  </select>
);

const TableComponent = () => {
  const [data, setData] = useState(
    Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      menuName: "Fries",
      price: "5.99",
      category: "Momos",
      type: "Veg",
      status: "Active",
    }))
  );

  return (
    <div className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Menu Name</th>
            <th>Sale Price</th>
            <th>Category</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>
                <InputField type="text" value={row.menuName} onChange={(e) => console.log(e.target.value)} placeholder="Enter menu name" required />
              </td>
              <td>
                <InputField type="text" value={row.price} onChange={(e) => console.log(e.target.value)} placeholder="Enter sale price" required />
              </td>
              <td>
                <SelectInput options={["Momos", "Pizza", "Burger"]} value={row.category} onChange={(e) => console.log(e.target.value)} />
              </td>
              <td>
                <SelectInput options={["Veg", "Non-Veg"]} value={row.type} onChange={(e) => console.log(e.target.value)} />
              </td>
              <td>
                <div className={`status ${row.status.toLowerCase()}`}>{row.status}</div>
              </td>
              <td>
                <button className="delete-btn">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;