import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import AuthContext from "../context/AuthContext";
import FizzyLogo from "./FizzyLogo";
import menuItems from "./menuItems";

const Header = ({ isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const { staff, logout } = useContext(AuthContext) || {};
  const location = useLocation();
  const navigate = useNavigate();

  const initials = staff?.name
    ? staff.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "A";

  const handleProfileClick = () => {
    if (isMobile) setMobileMenuOpen(false);
    navigate("/profile");
  };

  return (
    <>
      {/* ======= HEADER WRAPPER ======= */}
      <header
        className="top-0 left-0 w-full z-50 flex justify-center px-4 md:px-8 py-3 md:py-4 transition-colors duration-300"
      >
        {/* ======= INNER HEADER (fixed dark glossy gradient) ======= */}
        <div
          className="max-w-[1400px] w-full flex items-center justify-between px-6 md:px-10 py-3 md:py-4
          rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/95
          border border-slate-700/40 shadow-[0_4px_40px_rgba(0,0,0,0.25)]
          backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Soft Glows */}
          <div className="absolute -top-16 -left-20 w-72 h-72 bg-[#DF6229]/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Left: Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <FizzyLogo dark={false} />
          </div>

          {/* Center Navigation (Desktop Only) */}
          {!isMobile && (
            <nav className="flex items-center gap-10 relative z-10">
              {menuItems.map((item, i) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={i}
                    to={item.path}
                    className={`relative text-sm font-semibold tracking-wide transition-all duration-300 pb-1 ${
                      active
                        ? "text-[#EFA280]"
                        : "text-slate-300 hover:text-[#DF6229]"
                    }`}
                  >
                    {item.title}
                    {active && (
                      <span className="absolute -bottom-[2px] left-0 w-full h-[2px] rounded-full bg-gradient-to-r from-[#DF6229] to-[#EFA280]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Profile or Menu Button */}
          <div className="flex items-center gap-4 relative z-10">
            {isMobile ? (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-[#EFA280] transition-all duration-200"
              >
                <Menu size={24} />
              </button>
            ) : (
              <div
                onClick={handleProfileClick}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full border border-[#EFA280]/50 bg-slate-800/80 text-[#EFA280] font-semibold flex items-center justify-center shadow-inner group-hover:scale-105 transition-all duration-200">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-[#EFA280] transition">
                    {staff?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {staff?.role?.name || "Administrator"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                  className="ml-2 text-slate-400 hover:text-[#DF6229] transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ======= MOBILE MENU (Bottom Drawer) ======= */}
      {isMobile && (
        <>
          <div
            className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out
              bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
              border-t border-slate-700/50 backdrop-blur-xl rounded-t-3xl shadow-[0_-4px_40px_rgba(0,0,0,0.3)]
              ${mobileMenuOpen ? "translate-y-0" : "translate-y-full"}`}
          >
            {/* Handle Indicator */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
            </div>

            {/* Profile Section */}
            <div
              onClick={handleProfileClick}
              className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-800/70 transition"
            >
              <div className="w-10 h-10 rounded-full border border-[#EFA280]/50 bg-slate-800/70 text-[#EFA280] font-semibold flex items-center justify-center">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {staff?.name || "Admin"}
                </p>
                <p className="text-xs text-slate-400">
                  {staff?.role?.name || "Administrator"}
                </p>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="flex flex-col gap-1 p-4">
              {menuItems.map((item, i) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={i}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                      active
                        ? "bg-[#DF6229]/15 text-[#EFA280]"
                        : "text-slate-300 hover:text-[#EFA280] hover:bg-slate-800/70"
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 w-full py-5 border-t border-slate-700/50 text-slate-400 hover:text-[#DF6229] transition-colors"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* Overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default Header;
