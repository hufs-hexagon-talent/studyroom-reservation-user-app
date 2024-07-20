import React, { useState, useCallback, useEffect } from 'react';
import Inko from 'inko';
import { useCheckIn, fetchIsAdmin } from '../../api/user.api';
import { convertToEnglish } from '../../api/convertToEnglish';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useSnackbar } from 'react-simple-snackbar';

const QrCheck = () => {
  const [roomIds, setRoomIds] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reservations, setReservations] = useState([]);
  const { mutate: doCheckIn } = useCheckIn();
  let inko = new Inko();
  const navigate = useNavigate();
  const { loggedIn } = useAuth();
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdsParam = params.get('roomIds[]');
    if (roomIdsParam) {
      const roomIdsArray = roomIdsParam.split(',').map(id => parseInt(id, 10));
      setRoomIds(roomIdsArray);
    }
  }, [location.search]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // 관리자 인지 확인
      try {
        const isAdmin = await fetchIsAdmin();
        if (!isAdmin) {
          navigate('/');
        }
      } catch (error) {
        openSnackbar('관리자 외 접근 금지', error);
        navigate('/');
        setTimeout(() => {
          closeSnackbar();
        }, 2500);
        return;
      }
    };

    // 로그인이 되어 있지 않으면 로그인 페이지로 이동
    if (loggedIn) {
      checkAdminStatus();
    } else {
      // todo: 이거 flowbite로
      console.log('로그인이 되어 있지 않습니다');
      navigate('/login');
    }
  }, [navigate, loggedIn]);

  const handleQrCode = verificationCode => {
    const lowerCaseCode = convertToEnglish(
      inko.ko2en(verificationCode).toLowerCase(),
    );
    console.log({ verificationCode: lowerCaseCode, roomIds });

    doCheckIn(
      {
        verificationCode: lowerCaseCode,
        roomIds,
      },
      {
        onSuccess: result => {
          const checkedInReservations = result.data.checkInReservations;

          setReservations(prevReservations =>
            prevReservations.map(reservation =>
              checkedInReservations.some(
                checkedInReservation =>
                  checkedInReservation.reservationId ===
                  reservation.reservationId,
              )
                ? { ...reservation, state: 'VISITED' }
                : reservation,
            ),
          );

          const userName = checkedInReservations[0].name;
          setSuccessMessage(`${userName}님, 출석 확인 되었습니다.`);
          setErrorMessage('');
          setTimeout(() => {
            setSuccessMessage('');
          }, 5000);
        },
        onError: error => {
          setErrorMessage(
            error.response?.data?.errorMessage ||
              'An unexpected error occurred',
          );
          setSuccessMessage('');
          setTimeout(() => {
            setErrorMessage('');
          }, 5000);
        },
      },
    );
  };

  const handleQrKeyDown = useCallback(
    e => {
      if (e.code === 'Enter') {
        handleQrCode(e.target.value);
        e.target.value = '';
      }
    },
    [roomIds],
  );

  return (
    <div>
      <h3 className="flex justify-center w-screen text-2xl text-center mt-10 mb-5">
        QR코드 출석
      </h3>
      <div className="mt-5 mb-10 text-center" style={{ color: '#9D9FA2' }}>
        {/* todo: 띄어쓰기 별로 줄바꿈*/}
        본인의 QR코드를 스캐너에 스캔해주세요
      </div>
      <div className="flex flex-col items-center justify-center w-screen">
        <input
          onKeyDown={handleQrKeyDown}
          className="flex items-center mt-1 border border-gray-300 p-2 rounded"
          type="text"
          placeholder="Scan QR Code"></input>
        <div className="flex flex-col items-center mt-4">
          {successMessage && (
            <div className="p-4 bg-green-100 text-green-700">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-red-100 text-red-700">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCheck;
