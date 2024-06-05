import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as MuiButton, Popover, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Button, Modal, Table } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import './CheckRoom.css';

import { deleteReservations, getUserReservation } from '../../api/user.api';

const Check = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [reservationId, setReservationId] = useState(null);
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
      const response = await getUserReservation();
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

  // 모달 열기와 예약 삭제를 위한 핸들러
  const handleDelete = async () => {
    try {
      await deleteReservations(reservationId);
      // 삭제된 예약을 제외한 새로운 예약 배열 설정
      setReservations(prevReservations =>
        prevReservations.filter(
          reservation => reservation.reservationId !== reservationId,
        ),
      );
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
    setOpenModal(false); // 모달 닫기
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
                      onClick={() => {
                        setReservationId(reservation.reservationId);
                        setOpenModal(true);
                      }}
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
      <div className="flex justify-center items-center">
        <Modal
          className="flex justify-center items-center w-full p-4 sm:p-0"
          show={openModal}
          size="md"
          onClose={() => setOpenModal(false)}
          popup>
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                이 예약을 삭제하시겠습니까?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="gray" onClick={() => setOpenModal(false)}>
                  취소
                </Button>
                <Button color="failure" onClick={handleDelete}>
                  확인
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Check;
