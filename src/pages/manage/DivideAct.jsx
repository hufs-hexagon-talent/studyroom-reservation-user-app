import React from 'react';
import { useNavigate } from 'react-router-dom';

const DivideAct = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="flex font-bold justify-center w-screen text-2xl text-center mt-20 mb-5">
        관리자 페이지
      </h3>
      <div className="flex flex-col justify-center items-center mt-16">
        <p
          onClick={() => navigate('/schedule')}
          className="inline-block text-xl hover:underline cursor-pointer pb-10">
          스케줄 설정하러 가기 &gt;
        </p>
        <p
          onClick={() => navigate('/selectPartition')}
          className="inline-block text-xl hover:underline cursor-pointer pb-10">
          예약 조회 및 출석 상태 수정 &gt;
        </p>
        <p
          onClick={() => navigate('/serialCheck')}
          className="inline-block text-xl hover:underline cursor-pointer pb-10">
          학번으로 사용자 정보 조회 &gt;
        </p>
        <p
          onClick={() => navigate('/blocked')}
          className="inline-block text-xl hover:underline cursor-pointer pb-10">
          블락 사용자 조회하러 가기 &gt;
        </p>
      </div>
    </div>
  );
};

export default DivideAct;
