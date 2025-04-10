import React from 'react';
import { Outlet } from 'react-router-dom';
import DashBoard from '../../components/admin/dashboard/DashBoard';
import SideBar from '../../components/sidebar/Sidebar';

const DivideAct = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-grow">
        {/* 왼쪽 사이드바 */}
        <div className="w-64">
          <SideBar />
        </div>

        {/* 오른쪽 메인 콘텐츠 */}
        <div className="flex-grow p-6 bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DivideAct;
