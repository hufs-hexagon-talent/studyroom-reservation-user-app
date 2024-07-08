import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';

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
import Manager from './pages/manage/Manager';
import Password from './pages/login/Password';
import PasswordReset from './pages/login/PasswordReset';

const Router = () => {
  const { loggedIn } = useAuth();
  const [openSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || '/'}>
      <div className="min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-grow">
          <Routes>
            <Route path="/password" element={<Password />} />
            <Route path="/pwreset" element={<PasswordReset />} />
            <Route path="/" element={<Notice />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/roompage" element={<RoomPage />} />
            <Route path="/visit" element={<CheckVisit />} />
            <Route path="/selectRoom" element={<SelectRoom />} />
            <Route path="/manager" element={<Manager />} />
            {loggedIn && (
              <>
                <Route path="/check" element={<Check />} />
                <Route path="/otp" element={<OtpPage />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer showSnackbar={openSnackbar} />
      </div>
    </BrowserRouter>
  );
};

export default Router;
