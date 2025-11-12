import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Store, Building } from "lucide-react";
import AuthContext from "../context/AuthContext";

const ProfilePage = () => {
  const { staff, logout } = useContext(AuthContext);
  if (!staff) return null;

  const placeholderImg =
    "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png";

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#111] font-[Inter]">
      {/* === Profile Hero === */}
      <section className="relative overflow-hidden">
        {/* Subtle Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF6F2] via-[#FFFFFF] to-[#F9F9F9]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#DF6229]/10 to-[#EFA280]/5 blur-[100px]"></div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-12 py-28 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Avatar + Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-[#DF6229]/20 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <img
                src={staff.image || placeholderImg}
                alt={staff.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 tracking-tight text-[#111] leading-tight">
              {staff.name}
            </h1>
            <p className="text-[#555] text-lg mt-1 font-medium">
              {staff.role?.name || "Administrator"}
            </p>
            <p className="text-[#777] text-sm mt-1">
              {staff.email} · {staff.country_code} {staff.phone}
            </p>

            <span className="mt-5 inline-block px-5 py-1.5 text-xs font-semibold rounded-full bg-[#FFE8E1] text-[#DF6229] uppercase tracking-wider shadow-sm">
              {staff.status || "Active"}
            </span>
          </div>

          {/* Right Section: Quick Stats + Logout */}
          <div className="flex flex-col items-center md:items-end gap-8">
            <div className="grid grid-cols-3 gap-5">
              {[
                { label: "Brands", value: staff.brands?.length || 0 },
                { label: "Outlets", value: staff.outlets?.length || 0 },
                { label: "Permissions", value: staff.permissions?.length || 0 },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all"
                >
                  <h3 className="text-3xl font-bold text-[#111] leading-none">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-[#777] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-full text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              style={{
                background: "linear-gradient(90deg, #DF6229 0%, #EFA280 100%)",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* === Main Content === */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-20 space-y-20">
        {/* Permissions */}
        <div className="rounded-3xl bg-white p-10 shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all border border-[#f3f3f3]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#DF6229] to-[#EFA280] flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <h2 className="text-2xl font-semibold text-[#111] tracking-tight">
              Role & Permissions
            </h2>
          </div>
          <p className="text-[#555] text-sm mb-8 leading-relaxed max-w-2xl">
            Your access level defines which features and data you can view or
            modify. Below are your granted permissions across the system.
          </p>

          <div className="flex flex-wrap gap-2">
            {staff.permissions?.map((perm, i) => (
              <span
                key={i}
                className="px-4 py-1.5 bg-[#FAFAFA] text-[#444] text-xs font-medium rounded-full border border-[#eee] hover:bg-[#DF6229]/10 hover:text-[#DF6229] transition-all"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* === Brands & Outlets Split Grid === */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Brands */}
          <div className="rounded-3xl bg-white p-10 shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all border border-[#f3f3f3]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#DF6229] to-[#EFA280] flex items-center justify-center text-white">
                <Building size={20} />
              </div>
              <h2 className="text-2xl font-semibold text-[#111] tracking-tight">
                Assigned Brands
              </h2>
            </div>
            <p className="text-[#555] text-sm mb-8 leading-relaxed">
              Brands under your supervision, including business and contact info.
            </p>

            <div className="space-y-6">
              {staff.brands?.map((brand) => (
                <div
                  key={brand._id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#FAFAFA] border border-[#eee] hover:border-[#EFA280]/40 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold mb-1 text-[#111]">
                    {brand.full_name}
                  </h3>
                  <p className="text-sm text-[#888] mb-4 italic">
                    {brand.short_name || "—"}
                  </p>
                  <div className="text-sm text-[#555] space-y-1.5">
                    <p>
                      <span className="font-semibold">Email:</span> {brand.email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {brand.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Location:</span>{" "}
                      {brand.city}, {brand.state}, {brand.country}
                    </p>
                    {brand.website && (
                      <Link
                        to={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-[#DF6229] text-sm font-medium hover:underline"
                      >
                        Visit Website →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outlets */}
          <div className="rounded-3xl bg-white p-10 shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all border border-[#f3f3f3]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#DF6229] to-[#EFA280] flex items-center justify-center text-white">
                <Store size={20} />
              </div>
              <h2 className="text-2xl font-semibold text-[#111] tracking-tight">
                Assigned Outlets
              </h2>
            </div>
            <p className="text-[#555] text-sm mb-8 leading-relaxed">
              The outlets linked to your assigned brands, with operational and
              contact details.
            </p>

            <div className="space-y-6">
              {staff.outlets?.map((outlet) => (
                <div
                  key={outlet._id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#FAFAFA] border border-[#eee] hover:border-[#EFA280]/40 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold mb-1 text-[#111]">
                    {outlet.name}
                  </h3>
                  <p className="text-sm text-[#888] mb-4 italic">
                    Code: {outlet.code}
                  </p>
                  <div className="text-sm text-[#555] space-y-1.5">
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {outlet.email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {outlet.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Address:</span>{" "}
                      {outlet.city}, {outlet.state}, {outlet.country}
                    </p>
                    <p>
                      <span className="font-semibold">Hours:</span>{" "}
                      {outlet.opening_time} – {outlet.closing_time}
                    </p>
                    {outlet.website && (
                      <Link
                        to={outlet.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-[#DF6229] text-sm font-medium hover:underline"
                      >
                        Visit Website →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
