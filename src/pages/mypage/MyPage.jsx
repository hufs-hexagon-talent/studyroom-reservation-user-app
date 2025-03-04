import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logoCes.png';
import { useMyInfo } from '../../api/user.api';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const { data: me } = useMyInfo();
  const department = '컴퓨터공학부';

  return (
    <>
      <div id="info">
        <img id="logo" src={Logo} alt="cse logo" />
        <div>
          <div className="name">{me?.name}</div>
          <div className="serial">
            {me?.serial} | {department}
          </div>
          <div className="email">{me?.email}</div>
        </div>
      </div>

      {/* 메뉴 */}
      <div id="menu">
        <div className="menu-item" onClick={() => navigate('/check')}>
          내 신청 현황
        </div>
        <div className="menu-item" onClick={() => navigate('/noshow')}>
          내 노쇼 현황
        </div>
        <div className="menu-item" onClick={() => navigate('/password')}>
          비밀번호 변경
        </div>
        <div
          className="menu-item"
          onClick={() =>
            window.open(
              'https://hwangbbang.notion.site/1ac6628bcfd1802aa2fef92695b8b378',
            )
          }>
          세미나실 예약 정정 요청
        </div>
        <div
          className="menu-item"
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
