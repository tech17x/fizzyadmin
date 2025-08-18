import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DiscountForm = ({ token, API, onCreated }) => {
  const [formData, setFormData] = useState({
    brand_id: "",
    outlet_id: "",
    name: "",
    apply_type: "discount", // discount | coupon | extra_charge
    type: "percentage", // fixed | percentage
    rate: "",
    apply_on_all_order_types: false,
    order_type: [],
    apply_on_all_menus: false,
    menu: [],
    apply_on_all_categories: false,
    category: [],
    apply_on_all_items: false,
    item: [],
    day: "all_week",
    start_time: "",
    end_time: "",
    code: "",
    status: "active",
  });

  const [orderTypes, setOrderTypes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // ✅ Load order types initially
  useEffect(() => {
    axios
      .get(`${API}/api/order-type/by-brand-outlet`, {
        params: { brand_id: "6822b72615fe200295fcb3f7", outlet_id: "6822c5424bd1d8d236d8a293" },
        withCredentials: true,
      })
      .then(res => setOrderTypes(res.data.orderTypes))
      .catch(err => console.error("Error fetching order types:", err));
  }, [token]);

  // ✅ Load menus when order_type changes
  useEffect(() => {
    if (formData.order_type.length > 0 && !formData.apply_on_all_order_types) {
      axios
        .post("/api/menus/by-order-types", { orderTypes: formData.order_type }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setMenus(res.data))
        .catch(err => console.error("Error fetching menus:", err));
    }
  }, [formData.order_type, formData.apply_on_all_order_types, token]);

  // ✅ Load categories when menu changes
  useEffect(() => {
    if (formData.menu.length > 0 && !formData.apply_on_all_menus) {
      axios
        .post("/api/categories/by-menus", { menus: formData.menu }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setCategories(res.data))
        .catch(err => console.error("Error fetching categories:", err));
    }
  }, [formData.menu, formData.apply_on_all_menus, token]);

  // ✅ Load items when category changes
  useEffect(() => {
    if (formData.category.length > 0 && !formData.apply_on_all_categories) {
      axios
        .post("/api/items/by-categories", { categories: formData.category }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setItems(res.data))
        .catch(err => console.error("Error fetching items:", err));
    }
  }, [formData.category, formData.apply_on_all_categories, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleMultiSelect = (e, field) => {
    const values = Array.from(e.target.selectedOptions, opt => opt.value);
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/discounts/create",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Discount created successfully!");
      if (onCreated) onCreated(res.data.discount);
      setFormData({ ...formData, name: "", rate: "", code: "" });
    } catch (error) {
      console.error("Error creating discount:", error);
      alert("Failed to create discount!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md max-w-lg space-y-4">
      <h2 className="text-xl font-bold">Create Discount / Coupon / Extra Charge</h2>

      {/* Name */}
      <input
        type="text"
        name="name"
        placeholder="Discount Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
        required
      />

      {/* Apply Type */}
      <select name="apply_type" value={formData.apply_type} onChange={handleChange} className="w-full border px-2 py-1 rounded">
        <option value="discount">Discount</option>
        <option value="coupon">Coupon</option>
        <option value="extra_charge">Extra Charge</option>
      </select>

      {/* Type + Rate */}
      <div className="flex space-x-2">
        <select name="type" value={formData.type} onChange={handleChange} className="flex-1 border px-2 py-1 rounded">
          <option value="fixed">Fixed</option>
          <option value="percentage">Percentage</option>
        </select>
        <input
          type="number"
          name="rate"
          placeholder="Rate"
          value={formData.rate}
          onChange={handleChange}
          className="flex-1 border px-2 py-1 rounded"
          required
        />
      </div>

      {/* Order Type */}
      <label className="block font-medium">Order Types</label>
      <select multiple disabled={formData.apply_on_all_order_types}
        onChange={(e) => handleMultiSelect(e, "order_type")}
        className="w-full border px-2 py-1 rounded">
        {orderTypes.map(ot => (
          <option key={ot._id} value={ot._id}>{ot.name}</option>
        ))}
      </select>
      <label>
        <input type="checkbox" name="apply_on_all_order_types" checked={formData.apply_on_all_order_types} onChange={handleChange} />
        Apply on all order types
      </label>

      {/* Menu */}
      {!formData.apply_on_all_order_types && (
        <>
          <label className="block font-medium">Menus</label>
          <select multiple disabled={formData.apply_on_all_menus}
            onChange={(e) => handleMultiSelect(e, "menu")}
            className="w-full border px-2 py-1 rounded">
            {menus.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <label>
            <input type="checkbox" name="apply_on_all_menus" checked={formData.apply_on_all_menus} onChange={handleChange} />
            Apply on all menus
          </label>
        </>
      )}

      {/* Category */}
      {!formData.apply_on_all_menus && (
        <>
          <label className="block font-medium">Categories</label>
          <select multiple disabled={formData.apply_on_all_categories}
            onChange={(e) => handleMultiSelect(e, "category")}
            className="w-full border px-2 py-1 rounded">
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <label>
            <input type="checkbox" name="apply_on_all_categories" checked={formData.apply_on_all_categories} onChange={handleChange} />
            Apply on all categories
          </label>
        </>
      )}

      {/* Items */}
      {!formData.apply_on_all_categories && (
        <>
          <label className="block font-medium">Items</label>
          <select multiple disabled={formData.apply_on_all_items}
            onChange={(e) => handleMultiSelect(e, "item")}
            className="w-full border px-2 py-1 rounded">
            {items.map(i => (
              <option key={i._id} value={i._id}>{i.name}</option>
            ))}
          </select>
          <label>
            <input type="checkbox" name="apply_on_all_items" checked={formData.apply_on_all_items} onChange={handleChange} />
            Apply on all items
          </label>
        </>
      )}

      {/* Day */}
      <select name="day" value={formData.day} onChange={handleChange} className="w-full border px-2 py-1 rounded">
        <option value="all_week">All Week</option>
        <option value="sunday">Sunday</option>
        <option value="monday">Monday</option>
        <option value="tuesday">Tuesday</option>
        <option value="wednesday">Wednesday</option>
        <option value="thursday">Thursday</option>
        <option value="friday">Friday</option>
        <option value="saturday">Saturday</option>
      </select>

      {/* Time */}
      <div className="flex space-x-2">
        <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="flex-1 border px-2 py-1 rounded" />
        <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="flex-1 border px-2 py-1 rounded" />
      </div>

      {/* Code */}
      {formData.apply_type === "coupon" && (
        <input
          type="text"
          name="code"
          placeholder="Coupon Code"
          value={formData.code}
          onChange={handleChange}
          className="w-full border px-2 py-1 rounded"
        />
      )}

      {/* Status */}
      <select name="status" value={formData.status} onChange={handleChange} className="w-full border px-2 py-1 rounded">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <button type="submit" className="w-full bg-black text-white py-2 rounded">
        Save Discount
      </button>
    </form>
  );
};

export default DiscountForm;
