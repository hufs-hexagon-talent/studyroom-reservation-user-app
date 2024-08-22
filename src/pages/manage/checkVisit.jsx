import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import {
  useReservationsByPartitions,
  usePartition,
  useAdminDeleteReservation,
} from '../../api/user.api';
import { Button, Table, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

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
  const [openModal, setOpenModal] = useState(null);

  let inko = new Inko();

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

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <div className="pt-2">
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
          <div className="overflow-x-auto mt-4 mb-3 w-full">
            <Table hoverable className="mt-4 mb-3  text-black text-center">
              <Table.Head className="break-keep">
                <Table.HeadCell>출석 유무</Table.HeadCell>
                <Table.HeadCell>호실</Table.HeadCell>
                <Table.HeadCell>이름</Table.HeadCell>
                <Table.HeadCell>시작 시간</Table.HeadCell>
                <Table.HeadCell>종료 시간</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
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
                      onClick={() => setOpenModal(reservation.reservationId)}
                      className="cursor-pointer hover:underline font-bold">
                      삭제
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
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

export default CheckVisit;
