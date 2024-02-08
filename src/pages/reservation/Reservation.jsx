import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';

const Reservation = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1>Reserved!</h1>
      <Button
        onClick={() => {
          navigate('/status');
      }}
      >
        예약 현황 둘러보기
      </Button>
    </>
  );
};

export default Reservation;