// src/components/Header.js

import React from 'react';
import './Header.css';
import logo from "../assets/Logo.png";
import user from "../assets/user.png";
import downArrow from "../assets/downArrow.png";

const Header = () => {
  return (
    <header className="header">
      <div className="left-side">
        <img src={logo} alt="POS logo" />
        <h1>Dhindu POS</h1>
      </div>
      <div className="right-side">
        <div className="profile-image">
          <img src={user} alt="user profile" />
        </div>
        <div>
          <p className="name">Lauren Smith</p>
          <p className="role">Cashier</p>
        </div>
        <button><img src={downArrow} alt="down arrow btn" /></button>
      </div>
    </header>
  );
};

export default Header;
