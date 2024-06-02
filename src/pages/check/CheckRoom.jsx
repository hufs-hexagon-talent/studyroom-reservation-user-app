import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popover, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Table } from 'flowbite-react';

import './CheckRoom.css';

import { deleteReservations, getUserReservation } from '../../api/user.api';

const Check = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // 자신의 모든 예약 조회
  const checkReservation = async () => {
    try {
      const response = await getUserReservation(); // getUserReservation 사용

      setReservations(response.data.data.items);
      console.log(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
    } else {
      checkReservation();
    }
  }, [navigate]);

  const handleDelete = async reservationId => {
    try {
      await deleteReservations(reservationId);
      setReservations(prev =>
        prev.filter(reservation => reservation.id !== reservationId),
      );
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-center font-bold text-3xl mt-20">
        내 신청 현황
      </div>

      <div id="table" className="overflow-x-auto mt-10">
        <Table className="border">
          <Table.Head
            style={{ fontSize: 15 }}
            className="text-black text-center">
            <Table.HeadCell>호실</Table.HeadCell>
            <Table.HeadCell>날짜</Table.HeadCell>
            <Table.HeadCell>시작 시간</Table.HeadCell>
            <Table.HeadCell>종료 시간</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">삭제</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {reservations.map((reservation, index) => {
              const start = new Date(reservation.startDateTime);
              const end = new Date(reservation.endDateTime);
              const startLocal = new Date(
                start.getTime() + start.getTimezoneOffset() * 60000,
              );
              const endLocal = new Date(
                end.getTime() + end.getTimezoneOffset() * 60000,
              );

              return (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 text-center text-gray-900">
                  <Table.Cell>{reservation.roomName}</Table.Cell>
                  <Table.Cell>{format(startLocal, 'MM-dd')}</Table.Cell>
                  <Table.Cell>{format(startLocal, 'HH:mm')}</Table.Cell>
                  <Table.Cell>{format(endLocal, 'HH:mm')}</Table.Cell>
                  <Table.Cell>
                    <a
                      href="#"
                      onClick={() => handleDelete(reservation.id)}
                      className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                      삭제
                    </a>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
      <div id="popover" className="mt-6">
        <Button
          style={{
            backgroundColor: '#002D56',
            marginLeft: 15,
            marginTop: 20,
            marginBottom: 40,
          }}
          aria-describedby={id}
          variant="contained"
          onClick={handleClick}>
          내 노쇼 현황
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}>
          <Typography sx={{ p: 2 }}>
            * 현재 예약 취소 없이 세미나실을 방문하지 않은 횟수는 n번 입니다.
            <br />
            (3회 초과 시 세미나실 예약이 제한 됩니다)
          </Typography>
        </Popover>
      </div>
    </div>
  );
};

export default Check;
