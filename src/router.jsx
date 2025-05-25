import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import { useServiceRole } from './api/user.api';
import FadeLoader from 'react-spinners/FadeLoader';

import useAuth from './hooks/useAuth';

import Footer from './components/footer/Footer';
import NavigationBar from './components/navbar/NavigationBar';

import Check from './pages/check/CheckRoom';
import LoginPage from './pages/login/LoginPage';
import Notice from './pages/notice/notice';
import OtpPage from './pages/OtpPage/OtpPage';
import RoomPage from './pages/rooms/room/RoomPage';
import QrCheck from './pages/qrcheck/QrCheck';
import LoggedInPassword from './pages/password/LoggedInPassword';
import LoggedOutPassword from './pages/password/LoggedOutPassword';
import EmailVerify from './pages/password/EmailVerify';
import MyPage from './pages/mypage/MyPage';
import NoShow from './pages/check/NoShow';
import EmailSend from './pages/email/EmailSend';

import AdminPage from './pages/admin/AdminPage';
import SignUp from './pages/admin/user/SignUp';
import FetchState from './pages/admin/user/FetchState';
import FetchUserReservations from './pages/admin/user/FetchUserReservations';
import PolicyManagement from './pages/admin/operation/policy/PolicyManagement';
import ScheduleCreate from './pages/admin/operation/schedule/ScheduleCreate';
import ScheduleFetch from './pages/admin/operation/schedule/ScheduleFetch';
import Schedule from './pages/admin/operation/schedule/Schedule';
import ReservationState from './pages/admin/reservation management/ReservationState';
import UserStatics from './pages/admin/statics/UserStatics';
import ReservationStatics from './pages/admin/statics/ReservationStatics';
import CreateRoom from './pages/admin/operation/facility/room/CreateRoom';
import EditRoom from './pages/admin/operation/facility/room/EditRoom';
import CreatePartition from './pages/admin/operation/facility/partition/CreatePartition';
import BannerUpload from './pages/admin/banner/BannerUpload';
import BannerManage from './pages/admin/banner/BannerManage';

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
                <Route path="/otp" element={<OtpPage />} />
                <Route path="/password" element={<LoggedInPassword />} />
                <Route path="/check" element={<Check />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/emailSend" element={<EmailSend />} />

                {/* 어드민 */}
                <Route path="/admin" element={<AdminPage />}>
                  {/* 통계 */}
                  <Route path="user-statics" element={<UserStatics />} />
                  <Route
                    path="reservation-statics"
                    element={<ReservationStatics />}
                  />
                  {/* 사용자 관리 */}
                  <Route path="user-state" element={<FetchState />} />
                  <Route path="sign-up" element={<SignUp />} />

                  {/* 예약 관리 */}
                  <Route
                    path="reservation-state"
                    element={<ReservationState />}
                  />
                  <Route
                    path="fetchReservations/:id"
                    element={<FetchUserReservations />}
                  />

                  {/* 운영 관리 */}
                  <Route path="policy" element={<PolicyManagement />} />
                  <Route path="schedule/create" element={<ScheduleCreate />} />
                  <Route path="schedule/fetch" element={<ScheduleFetch />} />
                  <Route path="schedule/fetch/:date" element={<Schedule />} />
                  <Route path="facility/room" element={<CreateRoom />} />
                  <Route path="facility/room/:roomId" element={<EditRoom />} />
                  <Route
                    path="facility/partition"
                    element={<CreatePartition />}
                  />
                  {/* 배너 관리 */}
                  <Route path="banner/create" element={<BannerUpload />} />
                  <Route path="banner/manage" element={<BannerManage />} />
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
