import React, { useState, useEffect } from 'react';
import { Table } from 'flowbite-react';
import { format } from 'date-fns';
import { Pagination } from '@mui/material';

import { useReservationsByPartitions } from '../../../api/reservation.api';

const RoomReservationCard = ({ room, partitionIds, selectedDate }) => {
  const [reservations, setReservations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 5; // 페이지 당 보여줄 개수

  const { data: fetchedReservations, isError: reservationsError } =
    useReservationsByPartitions({
      date: format(selectedDate, 'yyyy-MM-dd'),
      partitionIds,
    });

  // 예약 불러오는 함수
  useEffect(() => {
    if (fetchedReservations) {
      setReservations(fetchedReservations);
    }
  }, [fetchedReservations]);

  // 페이지 바뀔때 마다 상태 변경
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Pagination 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = reservations
    ?.sort(
      (a, b) =>
        new Date(a.reservationStartTime) - new Date(b.reservationStartTime),
    )
    ?.slice(startIndex, startIndex + itemsPerPage);

  const pageCount = Math.ceil(reservations.length / itemsPerPage);

  return (
    <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-2xl w-full">
      <div className="flex justify-center items-center text-xl py-6">
        {room.roomName}호 예약 조회
      </div>

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
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        </div>
      )}
      <Pagination
        count={pageCount}
        page={currentPage}
        onChange={handlePageChange}
        shape="rounded"
        className="flex justify-center mt-4"
      />
    </div>
  );
};

export default RoomReservationCard;
