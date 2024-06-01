import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Modal, Popover, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Table } from 'flowbite-react';
import QRCode from 'qrcode.react';

import './CheckRoom.css';

import { getUserReservation } from '../../api/user.api';

const Check = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState('');
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

  const handleQRClick = reservationId => {
    setSelectedReservationId(reservationId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedReservationId('');
  };

  return (
    <div>
      <div className="flex text-center font-bold text-3xl mt-20">
        내 신청 현황
      </div>

      <div id="table" className="overflow-x-auto mt-10">
        <Table className="border">
          <Table.Head
            style={{ fontSize: 15 }}
            className="text-black text-center">
            <Table.HeadCell>출석 코드 보기</Table.HeadCell>
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
                  <Table.Cell>
                    <Button onClick={() => handleQRClick(reservation.id)}>
                      QR
                    </Button>
                  </Table.Cell>
                  <Table.Cell>{reservation.roomName}</Table.Cell>
                  <Table.Cell>{format(startLocal, 'MM-dd')}</Table.Cell>
                  <Table.Cell>{format(startLocal, 'HH:mm')}</Table.Cell>
                  <Table.Cell>{format(endLocal, 'HH:mm')}</Table.Cell>
                  <Table.Cell>
                    <a
                      href="#"
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

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Typography id="modal-title" variant="h6" component="h2">
            출석 코드
          </Typography>
          <QRCode value={selectedReservationId} size={256} />
          <Button
            style={{ backgroundColor: '#002D56', marginTop: 20 }}
            variant="contained"
            onClick={handleCloseModal}>
            닫기
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Check;
