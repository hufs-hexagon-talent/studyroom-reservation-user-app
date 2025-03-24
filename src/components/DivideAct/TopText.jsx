import React from 'react';
import Github from '../../assets/icons/github.png';

const TopText = () => {
  const githubUrl = 'https://github.com/orgs/hufs-hexagon-talent/repositories';
  return (
    <>
      <div className="flex justify-between font-bold text-left pt-10 px-5 mb-5">
        <h3 className="text-3xl">
          <div className="flex flex-row">
            <div>관리자 페이지.</div>
            <div className="text-gray-600">세미나실 예약 시스템을</div>
          </div>
          <div className="text-gray-600">지금 바로 운영해보세요.</div>
        </h3>
        <div className="flex flex-row">
          <img className="w-8 h-8 mr-3" src={Github} />
          <div>
            <div className="mb-1 text-xs">
              Github Repository로 가고 싶다면 ?
            </div>
            <div
              onClick={() => window.open(githubUrl, '_blank')}
              className="text-blue-500 text-xs font-medium cursor-pointer">
              Github로 이동하기 &gt;
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default TopText;
