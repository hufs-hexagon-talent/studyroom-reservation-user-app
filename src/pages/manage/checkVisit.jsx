import React, { useState, useEffect } from 'react';
import { useReservationsByRooms } from '../../api/user.api';
import { useLocation } from 'react-router-dom';
import { fetchRooms } from '../../api/user.api';

const CheckVisit = () => {
  const location = useLocation();
  const [roomIds, setRoomIds] = useState([]);
  const [roomNames, setRoomNames] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdsParam = params.get('roomIds[]');
    if (roomIdsParam) {
      const roomIdsArray = roomIdsParam.split(',').map(id => parseInt(id, 10));
      setRoomIds(roomIdsArray);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchRoomNames = async () => {
      try {
        const names = await Promise.all(
          roomIds.map(roomId => fetchRooms(roomId)),
        );
        setRoomNames(names.map(room => room.roomName));
      } catch (error) {
        console.error(error);
      }
    };
    if (roomIds.length > 0) {
      fetchRoomNames();
    }
  }, [roomIds]);

  useEffect(() => {
    console.log('roomNames', roomNames);
  }, [roomNames]);

  // input 변화 감지
  const handleChange = e => {
    let value = e.target.value.replace(/-/g, '');
    if (value.length > 8) {
      value = value.slice(0, 8); // 최대 8자리까지만 허용
    }

    const formattedValue = formatInputValue(value);
    setInputValue(formattedValue);
  };

  // 입력되는 날짜 포맷팅
  const formatInputValue = value => {
    if (value.length < 5) return value;
    if (value.length < 7) return `${value.slice(0, 4)}-${value.slice(4)}`;
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
  };

  // 출석 조회
  const handleFetchReservations = async () => {
    if (inputValue.length === 10) {
      try {
        console.log(inputValue);
        const result = await useReservationsByRooms(inputValue);
        setReservations(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch reservations');
        console.error(err);
      }
    } else {
      setError('Invalid date format. Please enter a date in YYYYMMDD format.');
    }
  };

  return (
    <div>
      <div>출석 일자</div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="YYYYMMDD"
      />
      <button onClick={handleFetchReservations}>조회</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {reservations && (
        <div>
          <h3>Reservations:</h3>
          <pre>{JSON.stringify(reservations, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CheckVisit;
