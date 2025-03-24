import React from 'react';
import TopText from '../../components/DivideAct/TopText';
import ShortCut from '../../components/DivideAct/ShortCut';

const DivideAct = () => {
  return (
    <div className="bg-gray-100 h-screen">
      {/* 상단 */}
      <TopText />
      {/* 바로가기 */}
      <ShortCut />
    </div>
  );
};

export default DivideAct;
