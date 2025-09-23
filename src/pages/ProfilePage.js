import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LogOut, Pencil } from "lucide-react";
import AuthContext from "../context/AuthContext";

const ProfilePage = () => {
  const { staff, logout } = useContext(AuthContext);

  return (
    <main className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg select-none">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-800 mb-4">Profile</h1>
        <div className="w-full h-[2px] rounded-full bg-gray-300"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Left panel: Basic info */}
        <div className="md:basis-1/3">
          <div className="flex flex-col gap-5 bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-4 items-center">
              <img
                src={staff.image}
                alt="Profile"
                onError={(e) =>
                  (e.target.src =
                    "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png")
                }
                className="w-36 h-36 rounded-xl object-cover border border-gray-300"
              />
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-gray-800">{staff.name}</h2>
                <div className="text-gray-600 text-sm font-medium leading-tight">
                  <p>{staff.email}</p>
                  <p>{staff.phone}</p>
                </div>
                <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-600 font-semibold text-sm tracking-wide mt-2 select-none">
                  {staff.status.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 justify-center bg-gradient-to-tr from-orange-300 to-orange-600 text-white rounded-full px-6 py-2 text-sm font-bold cursor-pointer transition-opacity hover:opacity-90"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Right panel: Detailed info */}
        <div className="md:basis-2/3 flex flex-col gap-10">
          <section>
            <h3 className="text-base font-semibold text-gray-700 mb-4">Role &amp; Permissions</h3>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="font-semibold text-gray-700 mb-3">
                Role: <span className="font-normal">{staff.role.name}</span>
              </p>
              <strong className="block mb-2 text-gray-700">Permissions:</strong>
              <div className="flex flex-wrap gap-2">
                {staff.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg text-gray-500 font-medium text-xs select-none"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-700 mb-4">Assigned Brands</h3>
            <div className="flex flex-col gap-4">
              {staff.brands.map((brand) => (
                <div
                  key={brand._id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-1"
                >
                  <p className="font-semibold">{brand.name || "N/A"}</p>
                  <p className="text-sm text-gray-600">Email: {brand.email || "N/A"}</p>
                  <p className="text-sm text-gray-600">Phone: {brand.phone || "N/A"}</p>
                  <p className="text-sm text-gray-600">
                    Location: {brand.city || ""}, {brand.state || ""}, {brand.country || ""}
                  </p>
                  <p className="text-sm text-gray-600">GST: {brand.gst_no || "N/A"}</p>
                  <p className="text-sm text-gray-600">License: {brand.license_no || "N/A"}</p>
                  <p className="text-sm text-gray-600">Food License: {brand.food_license || "N/A"}</p>
                  <p className="text-sm text-orange-600 hover:underline">
                    <Link to={brand.website} target="_blank" rel="noopener noreferrer">
                      {brand.website}
                    </Link>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-700 mb-4">Assigned Outlets</h3>
            <div className="flex flex-col gap-4">
              {staff.outlets.map((outlet) => (
                <div
                  key={outlet._id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-1"
                >
                  <p className="font-semibold">{outlet.name || "N/A"}</p>
                  <p className="text-sm text-gray-600">Code: {outlet.code || "N/A"}</p>
                  <p className="text-sm text-gray-600">Email: {outlet.email || "N/A"}</p>
                  <p className="text-sm text-gray-600">Phone: {outlet.phone || "N/A"}</p>
                  <p className="text-sm text-orange-600 hover:underline">
                    <Link to={outlet.website} target="_blank" rel="noopener noreferrer">
                      {outlet.website}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: {outlet.street || ""}, {outlet.city || ""}, {outlet.state || ""}, {outlet.country || ""} - {outlet.postal_code || ""}
                  </p>
                  <p className="text-sm text-gray-600">Opening Time: {outlet.opening_time || "N/A"}</p>
                  <p className="text-sm text-gray-600">Closing Time: {outlet.closing_time || "N/A"}</p>
                  <p className="text-sm text-gray-600">Timezone: {outlet.timezone?.label || "N/A"}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
