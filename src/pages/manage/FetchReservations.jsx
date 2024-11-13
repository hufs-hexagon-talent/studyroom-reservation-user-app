import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useReservationsById,
  useNotVisitedState,
  useVisitedState,
  useProcessedState,
  useAdminDeleteReservation,
} from '../../api/user.api';
import { format } from 'date-fns';
import { Button, Table, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { useSnackbar } from 'react-simple-snackbar';
import { tr } from 'date-fns/locale';

const FetchReservations = () => {
  const { mutateAsync: visitedState } = useVisitedState();
  const { mutateAsync: notVisitedState } = useNotVisitedState();
  const { mutateAsync: processedState } = useProcessedState();
  const { mutate: doDelete } = useAdminDeleteReservation();

  const { id } = useParams();
  const { data: fetchedReservations, refetch } = useReservationsById(id);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);
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

  useEffect(() => {
    if (fetchedReservations) {
      setReservations(fetchedReservations);
    }
  }, [fetchedReservations]);

  // 예약 삭제
  const handleDelete = reservationId => {
    doDelete(reservationId, {
      onSuccess: () => {
        setReservations(prevReservations =>
          prevReservations.filter(
            reservation => reservation.reservationId !== reservationId,
          ),
        );
      },
      onError: err => {
        setError('예약 삭제 실패');
        console.error(err);
      },
    });
  };

  // 예약 상태 수정
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

      const updatedReservations = await refetch();
      setOpenEditModal(false); // Close modal after state change
    } catch (error) {
      openErrorSnackbar(error.response.data.errorMessage, 2500);
    }
  };
  return (
    <div className="overflow-x-auto">
      <h1 className="flex justify-center text-2xl m-10">
        {reservations[0]?.name}님의 예약
      </h1>
      <Table className="my-10">
        <Table.Head className="break-keep text-center">
          <Table.HeadCell>출석 상태</Table.HeadCell>
          <Table.HeadCell>예약 ID</Table.HeadCell>
          <Table.HeadCell>호실</Table.HeadCell>
          <Table.HeadCell>시작 시간</Table.HeadCell>
          <Table.HeadCell>종료 시간</Table.HeadCell>
          {/* todo : 예약 삭제 & 출석 상태 변경  */}
          <Table.HeadCell>예약 삭제</Table.HeadCell>
          <Table.HeadCell>출석 상태 변경</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y text-center">
          {reservations?.map(reservation => (
            <Table.Row
              key={reservation.reservationId}
              className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>{reservation.reservationState}</Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {reservation.reservationId}
              </Table.Cell>
              <Table.Cell>
                {reservation.roomName}-{reservation.partitionNumber}
              </Table.Cell>

              <Table.Cell>
                {format(new Date(reservation.reservationStartTime), 'HH:mm')}
              </Table.Cell>
              <Table.Cell>
                {format(new Date(reservation.reservationEndTime), 'HH:mm')}
              </Table.Cell>
              <Table.Cell
                onClick={() => {
                  setSelectedReservationId(reservation.reservationId);
                  setOpenDeleteModal(true);
                }}
                className="cursor-pointer text-red-600 hover:underline font-bold">
                삭제
              </Table.Cell>
              <Table.Cell>
                <a
                  href="#"
                  onClick={() => {
                    setSelectedReservationId(reservation.reservationId); // reservationId 설정
                    setOpenEditModal(true);
                  }}
                  className="font-bold text-blue-500 hover:underline dark:text-cyan-500">
                  수정
                </a>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
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

export default FetchReservations;
