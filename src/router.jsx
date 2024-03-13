import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import SideBar from './components/SideBar';
import App from './pages/App';
import Check from './pages/check/CheckRoom';
import LoginPage from './pages/login/LoginPage';
import Notice from './pages/notice/notice';
import ReservationsPage from './pages/reservations/ReservationsPage';
import RoomPage from './pages/rooms/room/RoomPage';
import RoomsPage from './pages/rooms/RoomsPage';

const Router = () => {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || '/'}>
      <div className="flex">
        <SideBar /> {/* 사이드 바*/}
        <div>
          <Routes>
            <Route path="/" element={<App />} /> {/* 소개 페이지 */}
            <Route path="/login" element={<LoginPage />} />{' '}
            {/* 로그인 페이지 */}
            <Route path="/rooms" element={<RoomsPage />} /> {/* Room 목록 */}
            <Route
              path="/rooms/:roomName/roompage"
              element={<RoomPage />}
            />{' '}
            {/* Room 예약 */}
            <Route
              path="/:roomNumber/:roomId/reservations"
              element={<ReservationsPage />}
            />{' '}
            {/* 예약완료 창 */}
            <Route path="/check" element={<Check />} />{' '}
            {/* 내 예약 현황 확인 페이지 */}
            <Route path="/notice" element={<Notice />} /> {/* 이용 규칙 */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default Router;
