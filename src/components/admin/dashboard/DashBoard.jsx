import React, { useState } from 'react';
import ShortCut from '../ShortCut';
import TopText from '../TopText';
import DashBoardStatics from '../statics/DashBoardStatics';

import underArrow from '../../../assets/icons/under_arrow.png';

const DashBoard = () => {
  return (
    <div>
      {/* 상단 제목 */}
      <TopText />

      {/* 바로 가기 */}
      <ShortCut />

      {/* 대시보드 */}
      <div className="font-bold text-3xl text-black p-8">DashBoard</div>
      {/* Statics 영역 */}
      <div
        id="statics"
        className="inline-flex flex-row pl-8 pb-2 items-center gap-x-2">
        <div className="font-bold text-2xl text-gray-700 cursor-pointer">
          Statics
        </div>
      </div>
      <div className="px-4 py-4">
        <DashBoardStatics />
      </div>
    </div>
  );
};

export default DashBoard;
