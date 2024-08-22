import React, { useState } from 'react';
import { Button, Table, Checkbox } from 'flowbite-react';
import { useSerialReservation, useChangeState } from '../../api/user.api';
import { format } from 'date-fns';
import { useSnackbar } from 'react-simple-snackbar';

const SerialCheck = () => {
  const [serial, setSerial] = useState('');
  const [reservation, setReservation] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const { refetch } = useSerialReservation(serial);
  const { mutateAsync: changeState } = useChangeState();

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

  const handlePatchBtn = async () => {
    if (!selectedReservationId) {
      openErrorSnackbar('선택된 예약이 없습니다.', 2500);
      return;
    }

    try {
      const response = await changeState(selectedReservationId);
      openSuccessSnackbar(response.message, 2500);

      const updatedReservations = await refetch();
      setReservation(updatedReservations.data);
    } catch (error) {
      openErrorSnackbar(error.response.data.errorMessage, 2500);
    }
  };

  const handleCheckboxChange = reservationId => {
    setSelectedReservationId(reservationId);
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
            {reservation?.map(item => (
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
                  {format(new Date(item.startDateTime), 'yyyy-MM-dd')}
                </Table.Cell>
                <Table.Cell>
                  {format(new Date(item.startDateTime), 'HH:mm')}
                </Table.Cell>
                <Table.Cell>
                  {format(new Date(item.endDateTime), 'HH:mm')}
                </Table.Cell>
                <Table.Cell>
                  {item.reservationState === 'VISITED' ? '출석' : '미출석'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <Button onClick={handlePatchBtn} className="mt-10" color="dark">
        출석 상태 수정
      </Button>
    </div>
  );
};

export default SerialCheck;
