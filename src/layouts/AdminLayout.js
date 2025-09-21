import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
          <Sidebar />
        </aside>
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
