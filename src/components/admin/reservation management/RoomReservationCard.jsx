// RoomReservationCard.jsx
import React, { useState, useEffect } from 'react';
import { Button, Table, Modal } from 'flowbite-react';
import { format } from 'date-fns';
import { useSnackbar } from 'react-simple-snackbar';
import { Pagination } from '@mui/material';
import {
  useReservationsByPartitions,
  useVisitedState,
  useNotVisitedState,
  useProcessedState,
  useAdminDeleteReservation,
} from '../../../api/reservation.api';
import { useAllPartitions } from '../../../api/roomPartition.api';
import Edit from '../../../assets/icons/edit.png';
import Delete from '../../../assets/icons/delete.png';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const RoomReservationCard = ({ room, partitionIds, selectedDate }) => {
  const [reservations, setReservations] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });
  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
    },
  });

  const {
    data: fetchedReservations,
    refetch,
    isError: reservationsError,
  } = useReservationsByPartitions({
    date: format(selectedDate, 'yyyy-MM-dd'),
    partitionIds,
  });
  const { data: allPartitions } = useAllPartitions();

  const { mutate: doDelete } = useAdminDeleteReservation();
  const { mutateAsync: visitedState } = useVisitedState();
  const { mutateAsync: notVisitedState } = useNotVisitedState();
  const { mutateAsync: processedState } = useProcessedState();

  const partitions = allPartitions?.map(partition => partition.partitionId);
  console.log(partitions);
  //console.log('partitions : ', partitions);

  useEffect(() => {
    if (fetchedReservations) {
      setReservations(fetchedReservations);
    }
  }, [fetchedReservations]);

  // 출석 상태 변경
  const handleStateChange = async state => {
    try {
      if (state === 'notVisited') {
        const response = await notVisitedState(selectedReservationId);
        openSuccessSnackbar(response.message, 2500);
      } else if (state === 'visited') {
        const response = await visitedState(selectedReservationId);
        openSuccessSnackbar(response.message, 2500);
      } else if (state === 'processed') {
        const response = await processedState(selectedReservationId);
        openSuccessSnackbar(response.message, 2500);
      }

      setOpenEditModal(false); // 상태 변경 후 모달 닫기
      await refetch();
    } catch (error) {
      openErrorSnackbar(error.response.data.errorMessage, 2500);
    }
  };

  // 예약 삭제
  const handleDelete = reservationId => {
    doDelete(reservationId, {
      onSuccess: async () => {
        setReservations(prevReservations =>
          prevReservations.filter(
            reservation => reservation.reservationId !== reservationId,
          ),
        );
        await refetch();
      },
      onError: err => {
        setError('예약 삭제 실패');
        openErrorSnackbar(error);
      },
    });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = reservations.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-2xl w-full">
      <div className="flex justify-center items-center text-xl py-6">
        {room.roomName}호 예약 조회
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {reservationsError ? (
        <div>Error fetching reservations</div>
      ) : reservations.length === 0 ? (
        <div className="mt-3 ml-1">해당 날짜의 예약이 없습니다</div>
      ) : (
        <div className="overflow-x-auto mt-4 mb-3 w-full">
          <Table hoverable className="text-black text-center">
            <Table.Head className="break-keep">
              <Table.HeadCell>출석 유무</Table.HeadCell>
              <Table.HeadCell>호실</Table.HeadCell>
              <Table.HeadCell>이름</Table.HeadCell>
              <Table.HeadCell>시작 시간</Table.HeadCell>
              <Table.HeadCell>종료 시간</Table.HeadCell>
              <Table.HeadCell>출석 상태 변경</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {paginatedReservations
                .sort(
                  (a, b) =>
                    new Date(a.reservationStartTime) -
                    new Date(b.reservationStartTime),
                )
                .map(reservation => (
                  <Table.Row key={reservation.reservationId}>
                    <Table.Cell>
                      {reservation.reservationState === 'VISITED' ? (
                        <div className="text-blue-600">출석</div>
                      ) : reservation.reservationState === 'NOT_VISITED' ? (
                        <div className="text-red-600">미출석</div>
                      ) : reservation.reservationState === 'PROCESSED' ? (
                        <div className="text-green-600">처리됨</div>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {reservation.roomName}-{reservation.partitionNumber}
                    </Table.Cell>
                    <Table.Cell>{reservation.name}</Table.Cell>
                    <Table.Cell>
                      {format(
                        new Date(reservation.reservationStartTime),
                        'HH:mm',
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {format(
                        new Date(reservation.reservationEndTime),
                        'HH:mm',
                      )}
                    </Table.Cell>
                    <Table.Cell className="flex justify-center items-center">
                      <img
                        src={Edit}
                        alt="edit"
                        onClick={() => {
                          setSelectedReservationId(reservation.reservationId);
                          setOpenEditModal(true);
                        }}
                        className="cursor-pointer w-6 h-6"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <img
                        src={Delete}
                        alt="delete"
                        onClick={() => {
                          setSelectedReservationId(reservation.reservationId);
                          setOpenDeleteModal(reservation.reservationId);
                        }}
                        className="cursor-pointer w-6 h-6 flex justify-center items-center"></img>
                    </Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
          <div className="flex justify-center mt-4">
            <Pagination
              count={Math.ceil(reservations.length / itemsPerPage)}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              shape="rounded"
            />
          </div>
        </div>
      )}
      <div className="flex justify-center items-center">
        {/* 예약 삭제 모달 */}
        <Modal
          className="flex justify-center items-center w-full p-4 sm:p-0"
          show={openDeleteModal}
          size="md"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClose={() => setOpenDeleteModal(false)}
          popup>
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                해당 예약을 삭제하시겠습니까?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
                  취소
                </Button>
                <Button
                  color="failure"
                  onClick={() => {
                    handleDelete(selectedReservationId);
                    setOpenDeleteModal(null);
                  }}>
                  확인
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        {/* 출석 상태 변경 모달 */}
        <Modal
          show={openEditModal}
          onClose={() => setOpenEditModal(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Modal.Header className="pr-24">
            예약 상태 변경 유형 선택
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col space-y-6">
              <p
                className="inline-block text-lg hover:underline cursor-pointer"
                onClick={() => handleStateChange('visited')}>
                출석으로 변경
              </p>
              <p
                className="inline-block text-lg hover:underline cursor-pointer"
                onClick={() => handleStateChange('notVisited')}>
                미출석으로 변경
              </p>
              <p
                className="inline-block text-lg hover:underline cursor-pointer"
                onClick={() => handleStateChange('processed')}>
                처리됨으로 변경
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
              취소
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default RoomReservationCard;
