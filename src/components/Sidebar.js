// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import FizzyLogo from "./FizzyLogo";
import { X, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import menuItems from "./menuItems";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024 && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sidebarOpen, setSidebarOpen]);

  const toggleSubmenu = (index) => setOpenIndex(openIndex === index ? null : index);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
      <div className="logo-section">
        <FizzyLogo className="sidebar-logo" />
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav" role="navigation">
        {menuItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="menu-group">
              <div
                className={`menu-item ${isOpen ? "active" : ""} ${item.path === location.pathname ? "active-link" : ""}`}
                onClick={() => toggleSubmenu(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" ? toggleSubmenu(index) : null)}
              >
                <div className="menu-left">
                  <span className="icon-wrap">{item.icon}</span>
                  <span className="title">{item.title}</span>
                </div>

                <div className="chev">
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {isOpen && (
                <div className="submenu">
                  {item.submenu.map((sub, i) => (
                    <Link
                      key={i}
                      to={sub.path}
                      className={`submenu-item ${location.pathname === sub.path ? "active" : ""}`}
                      onClick={handleLinkClick}
                    >
                      <span className="icon-wrap">{sub.icon}</span>
                      <span>{sub.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => { alert("Logout clicked"); }}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
