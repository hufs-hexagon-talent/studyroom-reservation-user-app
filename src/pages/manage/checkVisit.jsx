import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { convertToEnglish } from '../../api/convertToEnglish';
import {
  useReservationsByRooms,
  useRooms,
  useCheckIn,
} from '../../api/user.api';
import { Button, Table } from 'flowbite-react';
import Inko from 'inko';
import { format } from 'date-fns';

const CheckVisit = () => {
  const location = useLocation();
  const [roomIds, setRoomIds] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);
  const [fetchParams, setFetchParams] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reservations, setReservations] = useState([]);
  let inko = new Inko();

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
  const { data: fetchedReservations, refetch } = useReservationsByRooms(
    fetchParams || {},
  );

  useEffect(() => {
    if (fetchedReservations) {
      setReservations(fetchedReservations);
    }
  }, [fetchedReservations]);

  const handleChange = e => {
    let value = e.target.value.replace(/-/g, '');
    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    const formattedValue = formatInputValue(value);
    setInputValue(formattedValue);
  };

  const formatInputValue = value => {
    if (value.length < 5) return value;
    if (value.length < 7) return `${value.slice(0, 4)}-${value.slice(4)}`;
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
  };

  const handleFetchReservations = async () => {
    if (inputValue.length === 10) {
      try {
        setFetchParams({ date: inputValue, roomIds });
        refetch();
        setError(null);
      } catch (err) {
        setError('Failed to fetch reservations');
        console.error(err);
      }
    } else {
      setError('Invalid date format. Please enter a date in YYYYMMDD format.');
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

          // 지피티가 짜줬는데 뭔지 잘 ㅁㄹ겠음 공부하자
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

  const roomNames = rooms?.map(room => room.roomName).join(', ');

  return (
    <div className="flex flex-col md:flex-row border-r md:border-r-2 border-gray-300">
      <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-gray-300">
        <div>
          <p>{`선택된 방 : ${roomNames}`}</p>
        </div>
        <div className="pt-3 pb-3">출석 일자</div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder="YYYYMMDD"
            className="border border-gray-300 p-2 rounded"
          />
          <Button color="dark" onClick={handleFetchReservations} size="sm">
            조회
          </Button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {reservations.length > 0 && (
          <Table hoverable className="mt-4 text-black text-center">
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
        <h3>QR Code Verification:</h3>
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
