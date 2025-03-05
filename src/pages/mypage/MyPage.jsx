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
          <div className="font-bold">{me?.name}</div>
          <div>
            {me?.serial} | {department}
          </div>
          <div>{me?.email}</div>
        </div>
      </div>

      {/* 메뉴 */}
      <div id="menu">
        <div className="menu-section">
          <div className="menu-title">내 계정 관리</div>
          <div className="menu-item" onClick={() => navigate('/password')}>
            비밀번호 변경
          </div>
          <div className="menu-item" onClick={() => navigate('/emailSend')}>
            이메일 변경
          </div>
        </div>
        <div className="menu-section">
          <div className="menu-title">내 예약 관리</div>
          <div className="menu-items">
            <div className="menu-item" onClick={() => navigate('/check')}>
              신청 현황 조회
            </div>
            <div
              className="menu-item"
              onClick={() =>
                window.open(
                  'https://hwangbbang.notion.site/1ac6628bcfd1802aa2fef92695b8b378',
                )
              }>
              예약 정정 요청
            </div>
            <div className="menu-item" onClick={() => navigate('/otp')}>
              내 QR코드
            </div>
          </div>
        </div>
        <div className="menu-section">
          <div className="menu-title">문의 및 건의</div>
          <div
            className="menu-item"
            onClick={() =>
              window.open(
                'https://hwangbbang.notion.site/ebd/1ac6628bcfd1807a93a1eed927f37595',
                '_blank', // 새 탭에서 열기
                'noopener,noreferrer', // 보안 속성 추가
              )
            }>
            의견 보내기
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPage;
