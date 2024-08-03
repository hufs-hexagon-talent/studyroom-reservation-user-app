import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import { useServiceRole } from './api/user.api';

import Footer from './components/footer/Footer';
import NavigationBar from './components/Navbar/NavigationBar';
import Check from './pages/check/CheckRoom';
import LoginPage from './pages/login/LoginPage';
import Notice from './pages/notice/notice';
import OtpPage from './pages/OtpPage/OtpPage';
import RoomPage from './pages/rooms/room/RoomPage';
import useAuth from './hooks/useAuth';
import CheckVisit from './pages/manage/checkVisit';
import SelectPartition from './pages/manage/SelectPartition';
import QrCheck from './pages/qrcheck/QrCheck';
import LoggedInPassword from './pages/password/LoggedInPassword';
import LoggedOutPassword from './pages/password/LoggedOutPassword';
import EmailVerify from './pages/password/EmailVerify';
import SignUp from './pages/signup/SignUp';
import SelectRoom from './pages/qrcheck/SelectRoom';
import Schedule from './pages/manage/Schedule';

const RouterComponent = () => {
  const { loggedIn } = useAuth();
  const { data: serviceRole, isLoading } = useServiceRole();
  const [openSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });
  const pwResetToken = sessionStorage.getItem('pwResetToken');
  if (isLoading) return null;

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || '/'}>
      <div className="min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Notice />} />
            {serviceRole !== 'RESIDENT' && (
              <>
                <Route path="/roompage" element={<RoomPage />} />
                <Route path="/check" element={<Check />} />
                <Route path="/otp" element={<OtpPage />} />
                <Route path="/password" element={<LoggedInPassword />} />
              </>
            )}
            {serviceRole === 'ADMIN' && (
              <>
                <Route path="/selectRoom" element={<SelectRoom />} />
                <Route path="/visit" element={<CheckVisit />} />
                <Route path="/selectPartition" element={<SelectPartition />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/qrcheck" element={<QrCheck />} />
              </>
            )}
            {serviceRole === 'RESIDENT' && (
              <>
                <Route path="/selectRoom" element={<SelectRoom />} />
                <Route path="/qrcheck" element={<QrCheck />} />
              </>
            )}
            {!loggedIn && (
              <>
                <Route
                  path="/email/pwreset"
                  element={
                    pwResetToken ? <LoggedOutPassword /> : <Navigate to="/" />
                  }
                />
                <Route path="/email" element={<EmailVerify />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUp />} />
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

export default RouterComponent;
