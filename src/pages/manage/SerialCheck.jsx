import React, { useState } from 'react';
import { Button, Table, Checkbox, Modal } from 'flowbite-react';
import {
  useSerialReservation,
  useAdminDeleteReservation,
  useVisitedState,
  useNotVisitedState,
  useProcessedState,
} from '../../api/user.api';
import { format } from 'date-fns';
import { useSnackbar } from 'react-simple-snackbar';

const SerialCheck = () => {
  const [openModal, setOpenModal] = useState(false);
  const [serial, setSerial] = useState('');
  const [reservation, setReservation] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [selectedStateChange, setSelectedStateChange] = useState(null); // New state to track selection
  const { refetch } = useSerialReservation(serial);
  const { mutateAsync: visitedState } = useVisitedState();
  const { mutateAsync: notVisitedState } = useNotVisitedState();
  const { mutateAsync: processedState } = useProcessedState();
  const { mutateAsync: deleteReservation } = useAdminDeleteReservation();

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

  const changeSerial = e => {
    setSerial(e.target.value);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleFetchBtn();
    }
  };

  const handleFetchBtn = async () => {
    if (!serial) {
      openErrorSnackbar('학번을 입력해주세요', 2500);
    }

    if (serial) {
      const response = await refetch();
      setReservation(response.data);
    }
  };

  const handlePatchBtn = () => {
    if (!selectedReservationId) {
      openErrorSnackbar('선택된 예약이 없습니다.', 2500);
      return;
    }
    setOpenModal(true); // Open modal on button click
  };

  const handleCheckboxChange = reservationId => {
    setSelectedReservationId(reservationId);
  };

  const handleDeleteBtn = async () => {
    if (!selectedReservationId) {
      openErrorSnackbar('선택된 예약이 없습니다.', 2500);
      return;
    }

    try {
      const response = await deleteReservation(selectedReservationId);
      openSuccessSnackbar(response.message, 2500);

      const updatedReservations = await refetch();
      setReservation(updatedReservations.data);
    } catch (error) {
      openErrorSnackbar(error.response.data.message, 2500);
    }
  };

  // 예약 상태 변경
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
      setReservation(updatedReservations.data);
      setOpenModal(false); // Close modal after state change
    } catch (error) {
      openErrorSnackbar(error.response?.data?.message, 2500);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-row items-center mb-5">
        <div className="mr-3">학번 </div>
        <input
          className="border rounded-sm w-32 h-7"
          onChange={changeSerial}
          onKeyDown={handleKeyPress}
          type="text"
          maxLength="9"></input>
        <Button
          onClick={handleFetchBtn}
          color="dark"
          className="ml-4 items-center h-8">
          조회
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Head className="text-center">
            <Table.HeadCell></Table.HeadCell>
            <Table.HeadCell>예약 ID</Table.HeadCell>
            <Table.HeadCell>호실</Table.HeadCell>
            <Table.HeadCell>날짜</Table.HeadCell>
            <Table.HeadCell>예약 시작 시각</Table.HeadCell>
            <Table.HeadCell>예약 종료 시각</Table.HeadCell>
            <Table.HeadCell>출석 유무</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {reservation
              ?.sort(
                (a, b) =>
                  new Date(b.reservationStartTime) -
                  new Date(a.reservationStartTime),
              )
              .map(item => (
                <Table.Row
                  key={item.reservationId}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    <Checkbox
                      checked={selectedReservationId === item.reservationId}
                      onChange={() => handleCheckboxChange(item.reservationId)}
                    />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {item.reservationId}
                  </Table.Cell>
                  <Table.Cell>
                    {item.roomName}-{item.partitionNumber}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(item.reservationStartTime), 'yyyy-MM-dd')}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(item.reservationStartTime), 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(item.reservationEndTime), 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    {item.reservationState === 'VISITED'
                      ? '출석'
                      : item.reservationState === 'NOT_VISITED'
                        ? '미출석'
                        : '처리됨'}
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </div>
      <div className="flex space-x-8">
        <Button onClick={handlePatchBtn} className="mt-10" color="dark">
          출석 상태 수정
        </Button>
        <Button onClick={handleDeleteBtn} className="mt-10" color="failure">
          예약 삭제
        </Button>
      </div>
      {/* 모달 */}
      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Modal.Header className="pr-24">예약 상태 변경 유형 선택</Modal.Header>
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
          <Button color="gray" onClick={() => setOpenModal(false)}>
            취소
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SerialCheck;
