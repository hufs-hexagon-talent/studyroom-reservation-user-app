import React, { useState, useEffect } from 'react';

import DatePicker from 'react-datepicker';
import { Checkbox, Button, Table } from 'flowbite-react';
import { format } from 'date-fns';

import { useAllRooms } from '../../../api/room.api';
import { useReservationsByPartitions } from '../../../api/reservation.api';

const CheckReservation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [partitionIds, setPartitionIds] = useState([]);
  const [fetchParams, setFetchParams] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [error, setError] = useState(null);

  const { data: rooms } = useAllRooms();
  const {
    data: fetchedReservations,
    refetch,
    isError: reservationsError,
  } = useReservationsByPartitions(fetchParams || {});

  useEffect(() => {
    if (fetchedReservations) {
      setReservations(fetchedReservations);
    }
  }, [fetchedReservations]);

  // partitionIds & selectedDate가 변경될 때 마다 handleFetchReservations 호출
  useEffect(() => {
    if (partitionIds.length > 0 && selectedDate) {
      handleFetchReservations();
    }
  }, [partitionIds, selectedDate]);

  const handleFetchReservations = async () => {
    if (selectedDate) {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        setFetchParams({ date: formattedDate, partitionIds });
        refetch();
        setError(null);
      } catch (err) {
        setError('예약 불러오기 실패');
        console.error(err);
      }
    } else {
      setError('Invalid date format. Please select a valid date.');
    }
  };

  return (
    <div>
      <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-2xl">
        <div className="flex justify-center items-center font-bold">
          예약 조회
        </div>
        <div className="px-4 pb-2 flex flex-row gap-x-6">
          {rooms?.map((room, index) => (
            <div
              key={index}
              className="flex flex-row items-center gap-x-2 my-1">
              <Checkbox id={`room-${room.roomId}`} value={room.roomId} />
              <label
                htmlFor={`room-${room.roomId}`}
                className="text-sm text-gray-700">
                {room.roomName}호
              </label>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            locale="ko"
            className="border border-gray-300 p-2 rounded"
            calendarClassName="ml-10"
          />
          <Button
            className="bg-blue-500 rounded-full"
            onClick={handleFetchReservations}
            size="sm">
            조회
          </Button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {reservationsError ? (
          <div>Error fetching reservations</div>
        ) : reservations.length === 0 ? (
          <div className="mt-3 ml-1">해당 날짜의 예약이 없습니다</div>
        ) : (
          <div className="overflow-x-auto mt-4 mb-3 w-full">
            <Table hoverable className="mt-4 mb-3  text-black text-center">
              <Table.Head className="break-keep">
                <Table.HeadCell>출석 상태 변경</Table.HeadCell>
                <Table.HeadCell>출석 유무</Table.HeadCell>
                <Table.HeadCell>호실</Table.HeadCell>
                <Table.HeadCell>이름</Table.HeadCell>
                <Table.HeadCell>시작 시간</Table.HeadCell>
                <Table.HeadCell>종료 시간</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {reservations
                  .sort(
                    (a, b) =>
                      new Date(a.reservationStartTime) -
                      new Date(b.reservationStartTime),
                  )
                  .map(reservation => (
                    <Table.Row
                      key={reservation.reservationId}
                      className={reservation.reservationState === 'VISITED'}>
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
                      <Table.Cell>
                        {reservation.reservationState === 'VISITED'
                          ? '출석'
                          : reservation.reservationState === 'NOT_VISITED'
                            ? '미출석'
                            : reservation.reservationState === 'PROCESSED'
                              ? '처리됨'
                              : '-'}
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
                      <Table.Cell
                        onClick={() => {
                          setSelectedReservationId(reservation.reservationId);
                          setOpenDeleteModal(reservation.reservationId);
                        }}
                        className="cursor-pointer text-red-600 hover:underline font-bold">
                        삭제
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckReservation;
