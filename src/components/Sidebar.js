import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import AuthContext from "../context/AuthContext";
import menuItems from "./menuItems";

const Header = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) => {
  const { staff } = useContext(AuthContext) || {};
  const location = useLocation();
  const navigate = useNavigate();

  const initials = staff?.name
    ? staff.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "A";

  const toggleMenu = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 shadow-xl border-b border-[#2C2C2E]/50
        bg-gradient-to-br from-[#0B0B0D] via-[#141414] to-[#1B1B1D]
        text-slate-100 backdrop-blur-md transition-all duration-300`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
        {/* Left side - logo or profile */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMenu}
            className="lg:hidden text-slate-400 hover:text-[#EFA280] transition"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Avatar / Profile */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full border border-[#DF6229] flex items-center justify-center text-[#EFA280] bg-[#1B1B1D]/80 font-semibold shadow-inner group-hover:scale-105 transition-transform duration-200">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white group-hover:text-[#EFA280] transition">
                {staff?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-400">
                {staff?.role?.name || "Administrator"}
              </p>
            </div>
          </div>
        </div>

        {/* Center menu (desktop) */}
        <nav className="hidden lg:flex items-center gap-8">
          {menuItems.map((item, i) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={i}
                to={item.path}
                className={`text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-[#EFA280] border-b-2 border-[#DF6229] pb-1"
                    : "text-slate-300 hover:text-[#EFA280]"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-[#EFA280] transition-all duration-200"
          >
            {collapsed ? (
              <>
                <ChevronsRight size={16} />
                <span className="text-sm">Expand</span>
              </>
            ) : (
              <>
                <ChevronsLeft size={16} />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>

          <button
            onClick={() => alert("Logout clicked")}
            className="flex items-center gap-2 text-slate-400 hover:text-[#DF6229] transition-colors duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium hidden sm:block">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {sidebarOpen && (
        <div className="lg:hidden bg-[#111111]/95 backdrop-blur-xl border-t border-[#2C2C2E]/50 px-6 py-4">
          <nav className="flex flex-col gap-3">
            {menuItems.map((item, i) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`text-base font-medium transition-all duration-200 ${
                    active
                      ? "text-[#EFA280]"
                      : "text-slate-300 hover:text-[#DF6229]"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
