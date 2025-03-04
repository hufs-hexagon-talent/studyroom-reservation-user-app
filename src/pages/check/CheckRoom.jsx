import React, { useState } from 'react';
import {
  Button as MuiButton,
  Popover,
  Typography,
  Pagination,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { Button, Modal, Table } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import {
  useDeleteReservation,
  useUserReservation,
  useNoShow,
  useMyInfo,
  fetchBlockedPeriod,
} from '../../api/user.api';

const Check = () => {
  const { data: noShow } = useNoShow();
  const { data: reservations } = useUserReservation();
  const { data: me } = useMyInfo();
  // const { data: blockedPeriod, refetch: fetchBlockedPeriod } =
  //   useBlockedPeriod();
  const { mutate: deleteReservation } = useDeleteReservation();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(null);
  const [blockedPeriod, setBlockePeriod] = useState(null);
  const handleMuiBtnClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClick = async e => {
    if (anchorEl) {
      // Popover이 열려있을 때
      const blockedData = await fetchBlockedPeriod();
      setBlockePeriod(blockedData);
      setAnchorEl(null); // Popover 닫기
    } else {
      // Popover이 닫혀있을 때
      setAnchorEl(e.currentTarget); // Popover 열기
    }
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
      console.error('예약 삭제 실패', error);
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

  // count를 계산하고 NaN이 아닐 때만 사용할 수 있도록 안전한 변수를 생성합니다.
  const pageCount = reservations
    ? Math.ceil(reservations.length / itemsPerPage)
    : 0;

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
            {paginatedReservations?.map((reservation, index) => {
              const start = new Date(reservation.reservationStartTime);
              const end = new Date(reservation.reservationEndTime);
              const isPast = start < new Date();
              return (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 text-center text-gray-900">
                  <Table.Cell>
                    {reservation.reservationState === 'VISITED' ? (
                      '출석'
                    ) : reservation.reservationState === 'NOT_VISITED' ? (
                      '미출석'
                    ) : (
                      <Tooltip
                        title={
                          <Typography sx={{ fontSize: '1.2em' }}>
                            노쇼를 3번 이상 하여 제한된 후 상태가 초기화된
                            상태를 말합니다.
                          </Typography>
                        }>
                        <span>처리됨</span>
                      </Tooltip>
                    )}
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
        count={pageCount} // 안전한 pageCount 값을 전달합니다.
        page={currentPage}
        onChange={handlePageChange}
        shape="rounded"
        className="flex justify-center mt-4"
      />

      <div id="popover" className="mt-6">
        <MuiButton
          style={{
            backgroundColor: '#002D56',
            marginLeft: 15,
            marginTop: 20,
            marginBottom: 40,
          }}
          aria-describedby={id}
          variant="contained"
          onClick={handleMuiBtnClick}>
          내 노쇼 현황
        </MuiButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          onClick={handlePopoverClick}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}>
          <Typography sx={{ px: 2, py: 1 }}>
            {`* 현재 예약 취소 없이 세미나실을 방문하지 않은 횟수는 ${noShow?.noShowCount}번 입니다.`}
          </Typography>
          <Typography sx={{ px: 3 }} className="text-red-700">
            (3회 초과 시 세미나실 예약이 1개월 동안 제한 됩니다)
          </Typography>
          {blockedPeriod?.data && (
            <>
              <Typography sx={{ px: 3, py: 1 }}>
                {blockedPeriod?.data?.startBlockedDate &&
                blockedPeriod?.data?.endBlockedDate
                  ? `현재 블락 기간 : ${blockedPeriod.data.startBlockedDate} ~ ${blockedPeriod.data.endBlockedDate}`
                  : '블락 정보가 없습니다.'}
              </Typography>
            </>
          )}

          <div className="overflow-x-auto">
            <Table>
              <Table.Head className="text-black text-center">
                <Table.HeadCell>출석 상태</Table.HeadCell>
                <Table.HeadCell>날짜</Table.HeadCell>
                <Table.HeadCell>호실</Table.HeadCell>
                <Table.HeadCell>시작 시간</Table.HeadCell>
                <Table.HeadCell>종료 시간</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y text-center">
                {noShow?.reservationList.reservationInfoResponses.map(
                  (reservation, index) => (
                    <Table.Row
                      key={index}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {reservation.reservationState === 'NOT_VISITED'
                          ? '미출석'
                          : ''}
                      </Table.Cell>
                      <Table.Cell>
                        {format(
                          new Date(reservation.reservationStartTime),
                          'yyyy-MM-dd',
                        )}
                      </Table.Cell>
                      <Table.Cell>{`${reservation.roomName}-${reservation.partitionNumber}`}</Table.Cell>
                      <Table.Cell>
                        {format(reservation.reservationStartTime, 'HH:mm')}
                      </Table.Cell>
                      <Table.Cell>
                        {format(reservation.reservationEndTime, 'HH:mm')}
                      </Table.Cell>
                    </Table.Row>
                  ),
                )}
              </Table.Body>
            </Table>
          </div>
        </Popover>
      </div>
      <div className="flex justify-center items-center">
        <Modal
          className="flex justify-center items-center w-full p-4 sm:p-0"
          show={openModal}
          size="md"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
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
