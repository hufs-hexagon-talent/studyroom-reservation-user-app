import React from 'react';
import { useNavigate } from 'react-router-dom';
import Calender from '../../assets/icons/calender.png';
import Check from '../../assets/icons/check.png';
import Search from '../../assets/icons/search.png';
import Block from '../../assets/icons/block.png';
import Banner from '../../assets/icons/picture.png';

const ShortCut = () => {
  const navigate = useNavigate();

  return (
    <div id="shortcut" className="mt-8 max-w-screen-xl mx-3 flex gap-2">
      <div onClick={() => navigate('/schedule')} className="cursor-pointer">
        <img
          className="flex justify-center items-center w-16 h-16 mx-auto"
          src={Calender}
        />
        <p className="text-xs p-4 font-bold text-center inline-block">
          스케줄 설정하러 가기
        </p>
      </div>
      <div
        onClick={() => navigate('/selectPartition')}
        className="cursor-pointer">
        <img
          className="flex justify-center items-center w-16 h-16 mx-auto"
          src={Check}
        />
        <p className="text-xs inline-block text-center font-bold p-4 break-words">
          예약 조회 및 출석 상태 관리
        </p>
      </div>
      <div onClick={() => navigate('/serialCheck')} className="cursor-pointer">
        <img
          className="flex justify-center items-center w-16 h-16 mx-auto"
          src={Search}
        />
        <p className="text-xs inline-block text-center font-bold p-4 break-words">
          학번 및 이름으로 사용자 정보 조회
        </p>
      </div>
      <div onClick={() => navigate('/blocked')} className="cursor-pointer">
        <img
          className="flex justify-center items-center w-16 h-16 mx-auto"
          src={Block}
        />
        <p className="text-xs inline-block text-center font-bold p-4 break-words">
          블락 사용자 조회하러 가기
        </p>
      </div>
      <div onClick={() => navigate('/banner')} className="cursor-pointer">
        <img
          className="flex justify-center items-center w-16 h-16 mx-auto"
          src={Banner}
        />
        <p className="text-xs font-bold text-center p-4 break-words">
          배너 관리
        </p>
      </div>
    </div>
  );
};

export default ShortCut;
