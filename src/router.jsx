import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import { useServiceRole } from './api/user.api';
import FadeLoader from 'react-spinners/FadeLoader';

import Footer from './components/footer/Footer';
import NavigationBar from './components/navbar/NavigationBar';
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
import FetchBlocked from './components/blocked/FetchBlocked';
import FetchReservations from './pages/manage/FetchReservations';
import MyPage from './pages/mypage/MyPage';
import NoShow from './pages/check/NoShow';
import EmailSend from './pages/email/EmailSend';
import ManageBanner from './pages/manage/ManageBanner';
import DashBoard from './components/admin/dashboard/DashBoard';
import DashBoardSchedule from './components/admin/schedule/DashBoardSchedule';
import DashBoardReservation from './components/admin/reservation management/DashBoardReservation';
import DashBoardBanner from './components/banner/DashBoardBanner';

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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <FadeLoader />
      </div>
    );

  return (
    <BrowserRouter basename={'/'}>
      <div className="min-h-screen flex flex-col">
        <NavigationBar showSnackbar={openSnackbar} />

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

                <Route path="/check" element={<Check />} />
                <Route path="/otp" element={<OtpPage />} />
                <Route path="/password" element={<LoggedInPassword />} />
                <Route path="/selectPartition" element={<SelectPartition />} />
                <Route path="/visit" element={<CheckVisit />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route
                  path="/fetchReservations/:id"
                  element={<FetchReservations />}
                />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/noshow" element={<NoShow />} />
                <Route path="/emailSend" element={<EmailSend />} />
                <Route path="/banner" element={<ManageBanner />} />
                {/* 어드민 */}
                <Route path="/divide" element={<DivideAct />}>
                  <Route path="dashboard" element={<DashBoard />} />
                  <Route path="schedule" element={<DashBoardSchedule />} />
                  <Route
                    path="manage-reservation"
                    element={<DashBoardReservation />}
                  />
                  <Route path="serialCheck" element={<SerialCheck />} />
                  <Route path="blocked" element={<FetchBlocked />} />
                  <Route path="banner" element={<DashBoardBanner />} />
                </Route>
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
        <Footer showSnackbar={openSnackbar} />
      </div>
    </BrowserRouter>
  );
};

export default RouterComponent;
