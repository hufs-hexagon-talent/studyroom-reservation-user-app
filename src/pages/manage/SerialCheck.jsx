import React, { useState } from 'react';
import { Button, Table } from 'flowbite-react';
import { useSerialReservation } from '../../api/user.api';
import { format } from 'date-fns';

const SerialCheck = () => {
  const [serial, setSerial] = useState('');
  const [reservation, setReservation] = useState([]);
  const { refetch } = useSerialReservation(serial);

  const changeSerial = e => {
    setSerial(e.target.value);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleBtn(); // Enter 키를 눌렀을 때 handleBtn 함수 호출
    }
  };

  const handleBtn = async () => {
    if (serial) {
      const response = await refetch();
      setReservation(response.data);
    }
  };

  return (
    <div className="p-10">
      <div className="flex flex-row mb-5">
        <div className="mr-3">학번 : </div>
        <input
          className="border rounded-sm h-8"
          onChange={changeSerial}
          onKeyDown={handleKeyPress} // Enter 키 감지
          type="text"></input>
        <Button onClick={handleBtn} color="dark" className="ml-4">
          조회
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Head className="text-center">
            <Table.HeadCell>예약 ID</Table.HeadCell>
            <Table.HeadCell>호실</Table.HeadCell>
            <Table.HeadCell>날짜</Table.HeadCell>
            <Table.HeadCell>예약 시작 시각</Table.HeadCell>
            <Table.HeadCell>예약 종료 시각</Table.HeadCell>
            <Table.HeadCell>출석 유무</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {reservation.map(item => (
              <Table.Row
                key={item.reservationId}
                className="bg-white dark:border-gray-700 dark:bg-gray-800">
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
                  {item.state === 'VISITED' ? '출석' : '미출석'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default SerialCheck;
