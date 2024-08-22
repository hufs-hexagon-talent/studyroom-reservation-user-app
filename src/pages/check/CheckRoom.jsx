import React, { useState } from 'react';
import {
  Button as MuiButton,
  Popover,
  Typography,
  Pagination,
} from '@mui/material';
import { format } from 'date-fns';
import { Button, Modal, Table } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import './CheckRoom.css';

import {
  useDeleteReservation,
  useUserReservation,
  useNoShow,
  useMyInfo,
} from '../../api/user.api';

const Check = () => {
  const { data: noShow } = useNoShow();
  const { data: reservations } = useUserReservation();
  const { data: me } = useMyInfo();
  const { mutate: deleteReservation } = useDeleteReservation();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleDelete = async id => {
    try {
      await deleteReservation(id);
    } catch (error) {
      // todo
      console.error('예약 실패', error);
    }
    setOpenModal(null); // 모달 닫기
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = reservations?.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div>
      <div className="flex justify-center text-2xl mt-20">
        {me?.name}님의 신청 현황
      </div>

      <div id="table" className="overflow-x-auto mt-10">
        <Table className="border">
          <Table.Head
            style={{ fontSize: 15 }}
            className="text-black text-center">
            <Table.HeadCell className="px-2 py-4">출석 여부</Table.HeadCell>
            <Table.HeadCell className="px-2 py-4">호실</Table.HeadCell>
            <Table.HeadCell className="px-2 py-4">날짜</Table.HeadCell>
            <Table.HeadCell className="px-2 py-4">시작 시간</Table.HeadCell>
            <Table.HeadCell className="px-2 py-4">종료 시간</Table.HeadCell>
            <Table.HeadCell className="px-2 py-4">
              <span className="sr-only">삭제</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {reservations?.map((reservation, index) => {
              const start = new Date(reservation.startDateTime);
              const end = new Date(reservation.endDateTime);
              const isPast = start < new Date();
              return (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 text-center text-gray-900">
                  <Table.Cell>
                    {reservation.reservationState === 'VISITED'
                      ? '출석'
                      : '미출석'}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {`${reservation.roomName}-${reservation.partitionNumber}`}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {format(start, 'MM-dd')}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {format(start, 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {format(end, 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {!(
                      isPast || reservation.reservationState === 'VISITED'
                    ) && (
                      <a
                        href="#"
                        onClick={() => {
                          setOpenModal(reservation.reservationId);
                        }}
                        className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                        삭제
                      </a>
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>

      <Pagination
        count={Math.ceil(reservations?.length / itemsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        shape="rounded"
        className="flex justify-center mt-4"
      />

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
            {`* 현재 예약 취소 없이 세미나실을 방문하지 않은 횟수는 ${noShow}번 입니다.`}
            <div className="text-red-700">
              (3회 초과 시 세미나실 예약이 제한 됩니다)
            </div>
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
                해당 예약을 삭제하시겠습니까?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="gray" onClick={() => setOpenModal(false)}>
                  취소
                </Button>
                <Button
                  color="failure"
                  onClick={() => {
                    handleDelete(openModal);
                    setOpenModal(null);
                  }}>
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
