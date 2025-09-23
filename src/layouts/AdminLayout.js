import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import './AdminLayout.css';
import { HamIcon } from 'lucide-react';

const AdminLayout = () => {

  const [toggleMenu, setToggleMenu] = useState(false);

  const updateToggleMenu = (state) => {
    setToggleMenu(state);
  }

  return (
    <div className="admin-body">
      {/* Bubbles container */}
      <div className="bubbles-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bubble"></div>
        ))}
      </div>

      <aside className={`admin-sidebar ${window.innerWidth < 768 ? toggleMenu ? 'mobile-menu' : 'hidden' : ''}`}>
        <Sidebar updateToggleMenu={updateToggleMenu} />
      </aside>

      <main className="admin-main-content">
        <Outlet updateToggleMenu={updateToggleMenu} />
      </main>
    </div>
  );
};

export default AdminLayout;
