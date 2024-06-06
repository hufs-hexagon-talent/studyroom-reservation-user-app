import React, { useState } from 'react';
import { fetchReservationsByRooms } from '../../api/user.api';
import { input } from '@testing-library/user-event/dist/cjs/event/input.js';
//dkadfa
const CheckVisit = () => {
  const [inputValue, setInputValue] = useState('');
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = e => {
    let value = e.target.value.replace(/-/g, '');
    if (value.length > 8) {
      value = value.slice(0, 8); // 최대 8자리까지만
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
        console.log(inputValue);
        const result = await fetchReservationsByRooms(inputValue);
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
