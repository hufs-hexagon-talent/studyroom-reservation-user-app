import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import Footer from './components/footer/Footer';
import NavigationBar from './components/Navbar/NavigationBar';
import Check from './pages/check/CheckRoom';
import LoginPage from './pages/login/LoginPage';
import Notice from './pages/notice/notice';
import Qrcode from './pages/qrcode/qrcodePage';
import RoomPage from './pages/rooms/room/RoomPage';

const Router = () => {
  const isAuthorized = true;

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || '/'}>
      <div>
        <NavigationBar />
        <div>
          <Routes>
            <Route path="/" element={<Notice />} />
            <Route path="/login" element={<LoginPage />} />

            {isAuthorized && (
              <>
                <Route path="/roompage" element={<RoomPage />} />
                <Route path="/check" element={<Check />} />
                <Route path="/otp" element={<Qrcode />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default Router;
