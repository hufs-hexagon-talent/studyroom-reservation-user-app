import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo/logoCes.png';
import { useMyInfo } from '../../api/user.api';
import { useLatestReservation } from '../../api/reservation.api';
import { format } from 'date-fns';
import './MyPage.css';
import useIsMobile from '../../hooks/useIsMobile';
import ClockGreen from '../../assets/clock_icon/clock Green.png';
import ClockGray from '../../assets/clock_icon/clock gray.png';

const MyPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: me } = useMyInfo();
  const { data: latest } = useLatestReservation();
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
          <div className="pb-1">{me?.email}</div>
          {latest?.length > 0 ? (
            <div>
              {isMobile ? (
                <div className="flex flex-row border-t-2 pt-1">
                  <img className="w-4 h-4 mt-1" src={ClockGreen} />
                  <div>
                    <div
                      style={{ fontSize: 15 }}
                      className="whitespace-normal break-keep ml-2">
                      {`${format(latest[0].reservationStartTime, 'MM월 dd일 HH:mm')} ~ ${format(latest[0].reservationEndTime, 'HH:mm')}`}
                    </div>
                    <div
                      style={{ fontSize: 15 }}
                      className="whitespace-normal break-keep ml-2">
                      {`${latest[0].roomName}-${latest[0].partitionNumber}호`}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row justify-center items-center border-t-2 pt-2">
                  <div className="flex flex-row items-start bg-[#dfebde] px-2 py-1 rounded-2xl">
                    <div className="bg-[#6d9711] w-2 h-2 inline-block mr-2 mt-1.5 ml-1 rounded-full aspect-square"></div>
                    <div
                      style={{ fontSize: 14 }}
                      className="whitespace-normal break-keep text-left">
                      현재 예약
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 15 }}
                    className="whitespace-normal break-keep ml-2">
                    {`${latest[0].roomName}-${latest[0].partitionNumber}호 / ${format(latest[0].reservationStartTime, 'MM월 dd일 HH:mm')} ~ ${format(latest[0].reservationEndTime, 'HH:mm')}`}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="flex flex-row border-t-2 pt-1">
                  <img className="w-4 h-4 mt-1" src={ClockGray} />
                  <div
                    style={{ fontSize: 15 }}
                    className="whitespace-normal break-keep ml-2">
                    현재 출석 해야 할 예약이 없습니다.
                  </div>
                </div>
              ) : (
                <div className="flex flex-row justify-center items-center border-t-2 pt-2">
                  <div className="inline-block bg-gray-300 px-2 py-0.5 rounded-2xl">
                    <div className="flex flex-row items-start">
                      <div className="bg-gray-500 w-2 h-2 inline-block mr-2 mt-1.5 ml-1 rounded-full aspect-square "></div>
                      <div
                        className="whitespace-normal break-keep"
                        style={{ fontSize: 14 }}>
                        현재 예약
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 15 }}
                    className="whitespace-normal break-keep ml-2">
                    현재 출석 해야 할 예약이 없습니다.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 메뉴 */}
      <div id="menu">
        {/* 내 예약 관리 */}
        <div className="menu-section">
          <div className="menu-title">내 예약 관리</div>
          <div className="menu-items">
            <div className="menu-item" onClick={() => navigate('/otp')}>
              내 QR코드
            </div>
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
          </div>
        </div>
        {/* 내 계정 관리 */}
        <div className="menu-section">
          <div className="menu-title">내 계정 관리</div>
          <div className="menu-item" onClick={() => navigate('/password')}>
            비밀번호 변경
          </div>
          <div className="menu-item" onClick={() => navigate('/emailSend')}>
            이메일 변경
          </div>
        </div>
        {/* 문의 및 건의 */}
        <div className="menu-section">
          <div className="menu-title">문의 및 건의</div>
          <div
            className="menu-item"
            onClick={() =>
              window.open(
                'https://hwangbbang.notion.site/ebd/1ac6628bcfd1807a93a1eed927f37595',
                '_blank',
                'noopener,noreferrer',
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
