import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import CustomSidebar from '../../components/sidebar/SideBar';

const AdminPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.metaKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex">
      <AnimatePresence>
        {isSidebarOpen && <CustomSidebar key="sidebar" />}
      </AnimatePresence>
      <div className="flex-grow p-6 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPage;
