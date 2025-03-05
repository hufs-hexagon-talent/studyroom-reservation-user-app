import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import { useServiceRole } from './api/user.api';

import FooterCes from './components/footer/FooterCes';
import NavigationBarCes from './components/Navbar/NavigationBarCes';
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
import Schedule from './pages/manage/Schedule';
import DivideAct from './pages/manage/DivideAct';
import SerialCheck from './pages/manage/SerialCheck';
import FetchBlockedUser from './pages/manage/FetchBlockedUser';
import FetchReservations from './pages/manage/FetchReservations';
import MyPage from './pages/mypage/MyPage';
import NoShow from './pages/check/NoShow';
import EmailSend from './pages/email/EmailSend';

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <BrowserRouter basename={'/'}>
      <div className="min-h-screen flex flex-col">
        <NavigationBarCes showSnackbar={openSnackbar} />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<RoomPage />} />
            {loggedIn &&
              (serviceRole === 'USER' || serviceRole === 'BLOCKED') && (
                <>
                  <Route path="/notice" element={<Notice />} />
                  <Route path="/check" element={<Check />} />
                  <Route path="/otp" element={<OtpPage />} />
                  <Route path="/mypage" element={<MyPage />} />
                  <Route path="/noshow" element={<NoShow />} />
                  <Route path="/emailSend" element={<EmailSend />} />
                  <Route path="/password" element={<LoggedInPassword />} />
                </>
              )}
            {loggedIn && serviceRole === 'ADMIN' && (
              <>
                <Route path="/notice" element={<Notice />} />
                <Route path="/qrcheck" element={<QrCheck />} />
                <Route path="/divide" element={<DivideAct />} />
                <Route path="/check" element={<Check />} />
                <Route path="/otp" element={<OtpPage />} />
                <Route path="/password" element={<LoggedInPassword />} />
                <Route path="/selectPartition" element={<SelectPartition />} />
                <Route path="/visit" element={<CheckVisit />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/serialCheck" element={<SerialCheck />} />
                <Route path="/blocked" element={<FetchBlockedUser />} />
                <Route
                  path="/fetchReservations/:id"
                  element={<FetchReservations />}
                />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/noshow" element={<NoShow />} />
                <Route path="/emailSend" element={<EmailSend />} />
              </>
            )}
            {loggedIn && serviceRole === 'RESIDENT' && (
              <>
                <Route path="/notice" element={<Notice />} />
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
                <Route path="/notice" element={<Notice />} />
                <Route path="/email" element={<EmailVerify />} />
                <Route path="/login" element={<LoginPage />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <FooterCes showSnackbar={openSnackbar} />
      </div>
    </BrowserRouter>
  );
};

export default RouterComponent;
