import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import {
  useReservationsByPartitions,
  usePartition,
  useAdminDeleteReservation,
} from '../../api/user.api';
import { Button, Table } from 'flowbite-react';
import Inko from 'inko';
import { format } from 'date-fns';

registerLocale('ko', ko);

const CheckVisit = () => {
  const location = useLocation();
  const [partitionIds, setPartitionIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [fetchParams, setFetchParams] = useState(null);
  const [reservations, setReservations] = useState([]);
  let inko = new Inko();
  const navigate = useNavigate();

  // location.search가 변경될 때 마다 실행
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const partitionIdsParmas = params.get('partitionIds[]');
    if (partitionIdsParmas) {
      const partitionIdsArray = partitionIdsParmas
        .split(',')
        .map(id => parseInt(id, 10));
      setPartitionIds(partitionIdsArray);
    }
  }, [location.search]);

  const { mutate: doDelete } = useAdminDeleteReservation();
  const { data: partitions } = usePartition(partitionIds);
  const {
    data: fetchedReservations,
    refetch,
    isError: reservationsError,
  } = useReservationsByPartitions(fetchParams || {});

  const partitionId = partitions
    ?.map(partition => partition.roomId)
    .filter((value, index, self) => self.indexOf(value) === index);

  // reservations 상태 변경
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

  // 예약 정보 가져오는 함수
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

  // 선택된 방 변수 (숫자대로 정렬)
  const partitionNames = partitions
    ?.map(partition => `${partition.roomName}-${partition.partitionNumber}`)
    .sort((a, b) => {
      const [roomA, partA] = a.split('-').map(Number);
      const [roomB, partB] = b.split('-').map(Number);
      return roomA - roomB || partA - partB;
    })
    .join(', ');

  // 예약 삭제
  const handleDelete = reservationId => {
    doDelete(reservationId);
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 ">
        <p
          onClick={() => navigate('/schedule')}
          className="inline-block font-bold pb-10 hover:underline cursor-pointer">
          스케줄 설정하러 가기 &gt;
        </p>
        <div>
          <p>{`선택된 방 : ${partitionNames}`}</p>
        </div>
        <div className="font-bold pt-6 pb-3">출석 일자</div>
        <div className="flex items-center space-x-2">
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            locale="ko"
            className="border border-gray-300 p-2 rounded"
            calendarClassName="ml-10"
          />
          <Button color="dark" onClick={handleFetchReservations} size="sm">
            조회
          </Button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {reservationsError ? (
          <div>Error fetching reservations</div>
        ) : reservations.length === 0 ? (
          <div className="mt-3 ml-1">해당 날짜의 예약이 없습니다</div>
        ) : (
          <Table hoverable className="mt-4 mb-3 text-black text-center">
            <Table.Head className="break-keep">
              {/* todo: 반응형 글자 작아지게 */}
              <Table.HeadCell>출석 유무</Table.HeadCell>
              <Table.HeadCell>호실</Table.HeadCell>
              <Table.HeadCell>이름</Table.HeadCell>
              <Table.HeadCell>시작 시간</Table.HeadCell>
              <Table.HeadCell>종료 시간</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">삭제</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {reservations.map(reservation => (
                <Table.Row
                  key={reservation.reservationId}
                  className={reservation.state === 'VISITED'}>
                  <Table.Cell>
                    {reservation.state === 'VISITED' ? '출석' : '미출석'}
                  </Table.Cell>
                  <Table.Cell>
                    {reservation.roomName}-{reservation.partitionNumber}
                  </Table.Cell>
                  <Table.Cell>{reservation.name}</Table.Cell>
                  <Table.Cell>
                    {format(new Date(reservation.startDateTime), 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(reservation.endDateTime), 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell
                    onClick={() => handleDelete(reservation.reservationId)}
                    className="cursor-pointer hover:underline font-bold">
                    삭제
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};

export default CheckVisit;
