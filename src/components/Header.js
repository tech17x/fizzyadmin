// src/components/Header.js

import React, { useContext, useState } from 'react';
import './Header.css';
import logo from "../assets/Logo.png";
import downArrow from "../assets/downArrow.png";
import AuthContext from "../context/AuthContext";

const Header = () => {
  const { staff, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown state

  const handleDropdownToggle = () => {
    setDropdownOpen(prevState => !prevState); // Toggle dropdown visibility
  };

  const handleLogout = () => {
    logout(); // Call logout function passed from AuthContext
  };

  return (
    <header className="header">
      <div className="left-side">
        <img src={logo} alt="POS logo" />
        <h1>Fizzy</h1>
      </div>
      <div className="right-side">
        <div className="profile-image">
          <img src={staff.image} alt="user profile" onError={(e) => e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} />
        </div>
        <div>
          <p className="name">{staff.name}</p>
          <p className="role">{staff.role.name}</p>
        </div>
        <button onClick={handleDropdownToggle}>
          <img src={downArrow} alt="down arrow btn" />
        </button>

        {/* Show dropdown when dropdownOpen is true */}
        {dropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
