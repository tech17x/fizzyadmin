// src/components/Sidebar.js

import React, { useState } from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import demoIcon from '../assets/demo.png';
import GradientText from './GradientText';

const Sidebar = () => {
  const [isBrandConfigOpen, setIsBrandConfigOpen] = useState(false);
  const [isMasterConfigOpen, setIsMasterConfigOpen] = useState(false);
  const [isMenuConfiguration, setIsMenuConfiguration] = useState(false);
  const [isCRM, setIsCRM] = useState(false);

  const toggleBrandConfig = () => {
    setIsBrandConfigOpen(!isBrandConfigOpen);
  };

  const toggleMasterConfig = () => {
    setIsMasterConfigOpen(!isMasterConfigOpen);
  };

  const toggleMenuConfig = () => {
    setIsMenuConfiguration(!isMenuConfiguration);
  };

  const toggleCRM = () => {
    setIsCRM(!isCRM);
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {/* Main Dashboard Link */}
          <li>
            <Link to={'/dashboard'}>
              <img src={demoIcon} alt="link icon" />
              <GradientText>Dashboard</GradientText>
            </Link>
          </li>

          {/* Brand Configuration Dropdown */}
          <li>
            <div className="dropdown-header" onClick={toggleBrandConfig}>
              <img src={demoIcon} alt="link icon" />
              <GradientText>Brand Configuration</GradientText>
            </div>

            {/* Submenu items */}
            {isBrandConfigOpen && (
              <ul className="submenu">
                <li>
                  <Link to={'/brand'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Brand</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/outlet'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Outlet</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/staff'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Staff</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/order-type'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Order Type</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/payment-mode'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Payment Mode</GradientText>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Master Configuration Dropdown */}
          <li>
            <div className="dropdown-header" onClick={toggleMasterConfig}>
              <img src={demoIcon} alt="link icon" />
              <GradientText>Master Configuration</GradientText>
            </div>

            {/* Submenu items */}
            {isMasterConfigOpen && (
              <ul className="submenu">
                <li>
                  <Link to={'/tax'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Tax</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/floor'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Floor</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/table'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Table</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to="/discount-charge">
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Discount/Charge</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/buy-x-get-y-item'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Buy X Get Y Item</GradientText>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Menu Configuration Dropdown */}
          <li>
            <div className="dropdown-header" onClick={toggleMenuConfig}>
              <img src={demoIcon} alt="link icon" />
              <GradientText>Menu Configuration</GradientText>
            </div>

            {/* Submenu items */}
            {isMenuConfiguration && (
              <ul className="submenu">
                <li>
                  <Link to={'/categories'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Categories</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/menu'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Menu</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/addon'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Addon</GradientText>
                  </Link>
                </li>
              </ul>
            )}
          </li>


          {/* CRM Configuration Dropdown */}
          <li>
            <div className="dropdown-header" onClick={toggleCRM}>
              <img src={demoIcon} alt="link icon" />
              <GradientText>CRM</GradientText>
            </div>

            {/* Submenu items */}
            {isCRM && (
              <ul className="submenu">
                <li>
                  <Link to={'/customer'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Customers</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/categories'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Orders</GradientText>
                  </Link>
                </li>
                <li>
                  <Link to={'/whatsapp-setup'}>
                    <img src={demoIcon} alt="link icon" />
                    <GradientText>Whatsapp API</GradientText>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
