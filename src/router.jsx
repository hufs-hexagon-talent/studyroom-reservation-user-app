import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import Footer from './components/footer/Footer';
import NavigationBar from './components/Navbar/NavigationBar';
import Check from './pages/check/CheckRoom';
import LoginPage from './pages/login/LoginPage';
import Notice from './pages/notice/notice';
import OtpPage from './pages/OtpPage/OtpPage';
import RoomPage from './pages/rooms/room/RoomPage';
import useAuth from './hooks/useAuth';
import CheckVisit from './pages/manage/checkVisit';
import SelectRoom from './pages/manage/SelectRoom';

const Router = () => {
  const { loggedIn } = useAuth();

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || '/'}>
      <div className="flex flex-col">
        <NavigationBar />
        <div>
          <Routes>
            <Route path="/" element={<Notice />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/roompage" element={<RoomPage />} />
            <Route path="/visit" element={<CheckVisit />} />
            <Route path="/selectRoom" element={<SelectRoom />} />
            {loggedIn && (
              <>
                <Route path="/check" element={<Check />} />
                <Route path="/otp" element={<OtpPage />} />
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
