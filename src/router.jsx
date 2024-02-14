import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import App from './pages/App';
import Check from './pages/check/CheckRoom';
import LoginPage from './pages/login/LoginPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import RoomPage from './pages/rooms/room/RoomPage';
import RoomsPage from './pages/rooms/RoomsPage';
import Status from './pages/status/Status';

const Router = () => {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || '/'}>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} /> {/* 소개 페이지 */}
        <Route path="/login" element={<LoginPage />} /> {/* 로그인 페이지 */}
        <Route path="/rooms" element={<RoomsPage />} /> {/* Room 목록 */}
        <Route path="/rooms/:roomName/:roomId" element={<RoomPage />} /> {/*Room*/}
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/check" element={<Check />} />
        <Route path='/status' element={<Status/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
