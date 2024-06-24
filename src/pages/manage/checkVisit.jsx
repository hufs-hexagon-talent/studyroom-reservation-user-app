import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import ko from 'date-fns/locale/ko'; // 한국어 로케일 가져오기
import { convertToEnglish } from '../../api/convertToEnglish';
import {
  useReservationsByRooms,
  useRooms,
  useCheckIn,
} from '../../api/user.api';
import { Button, Table } from 'flowbite-react';
import Inko from 'inko';
import { format } from 'date-fns';

registerLocale('ko', ko); // 로케일 등록

const CheckVisit = () => {
  const location = useLocation();
  const [roomIds, setRoomIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [fetchParams, setFetchParams] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reservations, setReservations] = useState([]);
  let inko = new Inko();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdsParam = params.get('roomIds[]');
    if (roomIdsParam) {
      const roomIdsArray = roomIdsParam.split(',').map(id => parseInt(id, 10));
      setRoomIds(roomIdsArray);
    }
  }, [location.search]);

  const { mutate: doCheckIn } = useCheckIn();
  const { data: rooms } = useRooms(roomIds);
  const {
    data: fetchedReservations,
    refetch,
    isError: reservationsError,
  } = useReservationsByRooms(fetchParams || {});

  useEffect(() => {
    if (fetchedReservations) {
      setReservations(fetchedReservations);
    }
  }, [fetchedReservations]);

  useEffect(() => {
    if (roomIds.length > 0 && selectedDate) {
      handleFetchReservations();
    }
  }, [roomIds, selectedDate]);

  const handleFetchReservations = async () => {
    if (selectedDate) {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        setFetchParams({ date: formattedDate, roomIds });
        refetch();
        setError(null);
      } catch (err) {
        setError('예약 불러오기 실패');
        console.error(err);
      }
    } else {
      setError('Invalid date format. Please select a valid date.');
    }
  };

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

  const handleClick = () => {
    navigate('/manager');
  };

  const roomNames = rooms?.map(room => room.roomName).join(', ');

  return (
    <div className="flex flex-col md:flex-row border-r md:border-r-2 border-gray-300">
      <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-gray-300">
        <div>
          <p>{`선택된 방 : ${roomNames}`}</p>
        </div>
        <div onClick={handleClick} className="mt-3 underline cursor-pointer">
          <p>멀티지기 출석</p>
        </div>
        <div className="pt-3 pb-3">출석 일자</div>
        <div className="flex items-center space-x-2">
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            locale="ko"
            className="border border-gray-300 p-2 rounded"
            calendarClassName="ml-10"
          />
          <Button color="dark" onClick={handleFetchReservations} size="sm">
            조회
          </Button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {reservationsError ? (
          <div>Error fetching reservations</div>
        ) : reservations.length === 0 ? (
          <div className="mt-3 ml-1">해당 날짜의 예약이 없습니다</div>
        ) : (
          <Table hoverable className="mt-4 mb-3 text-black text-center">
            <Table.Head>
              <Table.HeadCell>출석 유무</Table.HeadCell>
              <Table.HeadCell>호실</Table.HeadCell>
              <Table.HeadCell>이름</Table.HeadCell>
              <Table.HeadCell>시작 시간</Table.HeadCell>
              <Table.HeadCell>종료 시간</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {reservations.map(reservation => (
                <Table.Row
                  key={reservation.reservationId}
                  className={
                    reservation.state === 'VISITED'
                      ? 'bg-yellow-300 hover:bg-yellow-300'
                      : ''
                  }>
                  <Table.Cell>
                    {reservation.state === 'VISITED' ? '출석' : '미출석'}
                  </Table.Cell>
                  <Table.Cell>{reservation.roomName}</Table.Cell>
                  <Table.Cell>{reservation.name}</Table.Cell>
                  <Table.Cell>
                    {format(new Date(reservation.startDateTime), 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(reservation.endDateTime), 'HH:mm')}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
      <div className="w-full md:w-1/2 p-4">
        <h3 className="mb-2">QR 코드 확인 :</h3>
        <input
          type="text"
          onKeyDown={handleQrKeyDown}
          placeholder="Scan QR Code"
          className="border border-gray-300 p-2 rounded w-full"
        />
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-100 text-red-700">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default CheckVisit;
