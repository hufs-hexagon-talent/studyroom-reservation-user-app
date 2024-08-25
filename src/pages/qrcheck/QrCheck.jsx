import React, { useState, useCallback, useEffect } from 'react';
import Inko from 'inko';
import { useCheckIn, useRooms, fetchServiceRole } from '../../api/user.api';
import { convertToEnglish } from '../../api/convertToEnglish';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useSnackbar } from 'react-simple-snackbar';

const QrCheck = () => {
  const [roomId, setroomId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reservations, setReservations] = useState([]);
  const [scannedCode, setScannedCode] = useState('');

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
    const roomIdsParam = params.get('roomId');
    if (roomIdsParam) {
      setroomId(parseInt(roomIdsParam));
    }
  }, [location.search]);

  const { data: rooms } = useRooms(roomId ? [roomId] : []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // 관리자 인지 확인
      try {
        const isAdmin = await fetchServiceRole();
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
      openSnackbar('로그인이 되어 있지 않습니다', 2500);
      navigate('/login');
    }
  }, [navigate, loggedIn]);

  const handleQrCode = verificationCode => {
    const lowerCaseCode = convertToEnglish(
      inko.ko2en(verificationCode).toLowerCase(),
    );

    doCheckIn(
      {
        verificationCode: lowerCaseCode,
        roomId: roomId,
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
        handleQrCode(scannedCode);
        setScannedCode('');
      } else {
        setScannedCode(prev => prev + e.key);
      }
    },
    [roomId, scannedCode],
  );

  useEffect(() => {
    const handleKeyPress = e => {
      if (e.target.tagName !== 'INPUT') {
        handleQrKeyDown(e);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleQrKeyDown]);

  return (
    <div className="pb-10">
      <h3 className="flex justify-center w-screen text-2xl text-center mt-20 mb-5">
        QR코드 출석
      </h3>
      <div className="mt-5 mb-10 text-center" style={{ color: '#9D9FA2' }}>
        <p>
          현재 선택된 호실 :{' '}
          {rooms && rooms.length > 0
            ? `${rooms[0].roomName}호`
            : '선택된 호실이 없음'}
        </p>

        <p>본인의 QR코드를 스캐너에 스캔해주세요</p>
      </div>
      <div className="flex flex-col items-center justify-center w-screen">
        <input
          onKeyDown={handleQrKeyDown}
          className="flex items-center mt-1 border border-gray-300 p-2 rounded"
          type="text"
          disabled
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
