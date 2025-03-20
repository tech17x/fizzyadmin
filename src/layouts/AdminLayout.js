// src/layouts/AdminLayout.js

import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Header with full width on top */}
      <Header />

      {/* Container for sidebar and main content */}
      <div className="admin-body">
        <aside className="admin-sidebar">
          <Sidebar />
        </aside>
        
        <main className="admin-main-content">
          <Outlet /> {/* Nested route components go here */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
