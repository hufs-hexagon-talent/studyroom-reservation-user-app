import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logoCes.png';
import { useMyInfo } from '../../api/user.api';

const MyPage = () => {
  const navigate = useNavigate();
  const { data: me } = useMyInfo();
  return (
    <>
      <div className="flex justify-center items-center space-x-24 py-16 flex-row">
        <img src={Logo} className="w-36 h-36" alt="cse logo" />
        <div>
          <div className="font-bold text-2xl py-1">{me?.name}</div>
          <div className="text-2xl pb-1">{me?.serial} | 컴퓨터공학부</div>
          <div className="text-2xl pb-1">{me?.email}</div>
        </div>
      </div>
      {/* 메뉴 */}
      <div className="px-24">
        <div
          className="text-2xl cursor-pointer border-b flex items-center p-4"
          onClick={() => navigate('/check')}>
          내 신청 현황
        </div>
        <div
          className="text-2xl cursor-pointer border-b flex items-center p-4"
          onClick={() => navigate('/noshow')}>
          내 노쇼 현황
        </div>
        <div
          className="text-2xl cursor-pointer border-b flex items-center p-4"
          onClick={() => navigate('/password')}>
          비밀번호 변경
        </div>
        <div
          className="text-2xl cursor-pointer border-b flex items-center p-4"
          onClick={() =>
            window.open(
              'https://hwangbbang.notion.site/1ac6628bcfd1802aa2fef92695b8b378',
            )
          }>
          세미나실 예약 정정 요청
        </div>
        <div
          className="text-2xl cursor-pointer border-b flex items-center p-4"
          onClick={() =>
            window.open(
              'https://hwangbbang.notion.site/ebd/1ac6628bcfd1807a93a1eed927f37595',
            )
          }>
          의견 및 개선 사항 제출
        </div>
      </div>
    </>
  );
};

export default MyPage;
