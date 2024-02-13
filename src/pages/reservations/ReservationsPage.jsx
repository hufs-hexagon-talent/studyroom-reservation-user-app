import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';

const ReservationsPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1>Reserved!</h1>
      <Button
        text={'예약 현황 둘러보기'}
        onClick={() => {
          navigate('/status');
        }}>
      </Button>
    </>
  );
};

export default ReservationsPage;
