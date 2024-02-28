import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
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
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} /> {/* 소개 페이지 */}
        <Route path="/login" element={<LoginPage />} /> {/* 로그인 페이지 */}
        <Route path="/rooms" element={<RoomsPage />} /> {/* Room 목록 */}
        <Route path="/rooms/:roomName/roompage" element={<RoomPage />} /> {/*Room*/}
        <Route path="/:roomNumber/:roomId/reservations" element={<ReservationsPage />} />
        <Route path="/check" element={<Check />} />
        <Route path='/notice' element={<Notice/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
