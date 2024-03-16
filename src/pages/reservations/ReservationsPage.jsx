'use client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

const ReservationsPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="mt-10 flex justify-center w-screen font-bold text-2xl">
        예약 되었습니다!
      </div>
      <div className="flex justify-center">
        <div
          style={{
            backgroundColor: '#D9D9D9',
            padding: '20px',
            width: '400px',
            height: 'auto',
          }}
          className="mt-10 border text-center">
          예약 날짜 : yy년 mm월 dd일
          <br />
          예약 시간 : hh : mm - hh : mm <br />
          예약 호실 : n호 room n
        </div>
      </div>

      <div className="mt-5 flex justify-center w-screen">
        <Button color="dark" onClick={() => navigate('/')}>
          확인
        </Button>
      </div>
    </>
  );
};

export default ReservationsPage;
