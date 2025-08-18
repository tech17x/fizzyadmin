import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";
import DiscountForm from "./DiscountForm"; // reuse the form you built
const API = process.env.REACT_APP_API_URL;

const DiscountManager = ({ token }) => {

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // ✅ Fetch all discounts/coupons/charges
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/discounts/accessible`, {
        withCredentials: true,
      });
      setDiscounts(response.data.discounts || []);
    } catch (err) {
      console.error("Error fetching discounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [token]);

  // ✅ Delete discount
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this discount?")) return;
    try {
      await axios.delete(`/api/discounts/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Error deleting discount:", err);
      alert("Failed to delete discount");
    }
  };

  // ✅ Add or update discount in list
  const handleCreatedOrUpdated = (discount) => {
    if (editData) {
      // update
      setDiscounts((prev) =>
        prev.map((d) => (d._id === discount._id ? discount : d))
      );
    } else {
      // add new
      setDiscounts((prev) => [discount, ...prev]);
    }
    setShowForm(false);
    setEditData(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Discounts / Coupons / Charges</h1>
        <button
          onClick={() => {
            setShowForm((prev) => !prev);
            setEditData(null);
          }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded shadow"
        >
          <Plus /> {showForm ? "Close Form" : "Add New"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <DiscountForm
          token={token}
          API={API}
          onCreated={handleCreatedOrUpdated}
          editData={editData}
        />
      )}

      {/* Discounts Table */}
      <div className="mt-6">
        {loading ? (
          <p>Loading discounts...</p>
        ) : discounts.length === 0 ? (
          <p>No discounts or coupons found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Apply Type</th>
                <th className="border p-2">Code</th>
                <th className="border p-2">Day</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d._id}>
                  <td className="border p-2">{d.name}</td>
                  <td className="border p-2">{d.type}</td>
                  <td className="border p-2">{d.rate}</td>
                  <td className="border p-2">{d.apply_type}</td>
                  <td className="border p-2">{d.code || "-"}</td>
                  <td className="border p-2">{d.day}</td>
                  <td className="border p-2">
                    {d.start_time} - {d.end_time}
                  </td>
                  <td className="border p-2">{d.status}</td>
                  <td className="border p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditData(d);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DiscountManager;
