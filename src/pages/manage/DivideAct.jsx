import React from 'react';
import TopText from '../../components/admin/TopText';
import ShortCut from '../../components/admin/ShortCut';
import DashBoard from '../../components/admin/dashboard/DashBoard';
import SideBar from '../../components/sidebar/Sidebar';

const DivideAct = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-md flex-shrink-0">
        <SideBar />
      </div>
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {/* 상단 제목 */}
        <TopText />
        {/* 바로 가기 */}
        <ShortCut />
        {/* 대시보드 */}
        <DashBoard />
      </div>
    </div>
  );
};

export default DivideAct;
