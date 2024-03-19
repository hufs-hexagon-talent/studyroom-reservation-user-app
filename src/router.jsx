import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import NavigationBar from './components/Navbar/NavigationBar';
import Check from './pages/check/CheckRoom';
import LoginPage from './pages/login/LoginPage';
import Notice from './pages/notice/notice';
import ReservationsPage from './pages/reservations/ReservationsPage';
import Responsive from './pages/Responsive';
import RoomPage from './pages/rooms/room/RoomPage';

const Router = () => {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || '/'}>
      <div>
        <NavigationBar />
        <div>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/rooms/:roomName/roompage" element={<RoomPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/check" element={<Check />} />
            <Route path="/" element={<Notice />} />
            <Route path="/responsive" element={<Responsive />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default Router;
