import React from 'react';
import TopText from '../../components/admin/TopText';
import ShortCut from '../../components/admin/ShortCut';
import DashBoard from '../../components/admin/dashboard/DashBoard';

const DivideAct = () => {
  return (
    <div className="bg-gray-100">
      {/* 상단 */}
      <TopText />
      {/* 바로가기 */}
      <ShortCut />
      {/* 대시보드 */}
      <DashBoard />
    </div>
  );
};

export default DivideAct;
