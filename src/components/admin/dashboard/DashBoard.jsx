import React from 'react';
import DashBoardSchedule from '../schedule/Schedule';

const DashBoard = () => {
  return (
    <div>
      <div className="font-bold text-3xl text-gray-700 p-8">DashBoard</div>
      <div className="px-4">
        {/* 스케줄 설정 */}
        <DashBoardSchedule />
      </div>
    </div>
  );
};

export default DashBoard;
