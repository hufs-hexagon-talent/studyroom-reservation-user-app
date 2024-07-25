import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import { convertToEnglish } from '../../api/convertToEnglish';
import {
  useReservationsByPartitions,
  usePartition,
  useCheckIn,
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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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

  const { mutate: doCheckIn } = useCheckIn();
  const { mutate: doDelete } = useAdminDeleteReservation();
  const { data: partitions } = usePartition(partitionIds);
  const {
    data: fetchedReservations,
    refetch,
    isError: reservationsError,
  } = useReservationsByPartitions(fetchParams || {});

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

  // QR 코드 처리 함수
  const handleQrCode = verificationCode => {
    const lowerCaseCode = convertToEnglish(
      inko.ko2en(verificationCode).toLowerCase(),
    );
    console.log({ verificationCode: lowerCaseCode, partitionIds });

    doCheckIn(
      {
        verificationCode: lowerCaseCode,
        partitionIds,
      },
      {
        onSuccess: result => {
          const checkedInReservations = result.data.checkInReservations;

          setReservations(prevReservations =>
            prevReservations.map(reservation =>
              checkedInReservations.some(
                checkedInReservation =>
                  checkedInReservation.reservationId ===
                  reservation.reservationId,
              )
                ? { ...reservation, state: 'VISITED' }
                : reservation,
            ),
          );

          const userName = checkedInReservations[0].name;
          setSuccessMessage(`${userName}님, 출석 확인 되었습니다.`);
          setErrorMessage('');
          setTimeout(() => {
            setSuccessMessage('');
          }, 5000);
        },
        onError: error => {
          setErrorMessage(
            error.response?.data?.errorMessage ||
              'An unexpected error occurred',
          );
          setSuccessMessage('');
          setTimeout(() => {
            setErrorMessage('');
          }, 5000);
        },
      },
    );
  };

  // QR코드 입력란에 스캐너가 찍혔을 떄 호출되는 함수
  const handleQrKeyDown = useCallback(
    e => {
      if (e.code === 'Enter') {
        handleQrCode(e.target.value);
        e.target.value = '';
      }
    },
    [setPartitionIds],
  );

  // 선택된 방 변수
  const partitionNames = partitions
    ?.map(partition => `${partition.roomName}-${partition.partitionNumber}`)
    .join(', ');

  // 예약 삭제
  const handleDelete = reservationId => {
    doDelete(reservationId);
  };

  return (
    <div className="flex flex-col md:flex-row border-r md:border-r-2 border-gray-300">
      <div className="p-4 border-b md:border-b-0 md:border-r border-gray-300">
        <p
          onClick={() => navigate('/schedule')}
          className="pb-3 hover:underline cursor-pointer">
          스케줄 주입
        </p>
        <div>
          <p>{`선택된 방 : ${partitionNames}`}</p>
        </div>
        <div className="pt-3 pb-3">출석 일자</div>
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
            <Table.Head>
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
                  className={
                    reservation.state === 'VISITED'
                      ? 'bg-yellow-300 hover:bg-yellow-300'
                      : ''
                  }>
                  <Table.Cell>
                    {reservation.state === 'VISITED' ? '출석' : '미출석'}
                  </Table.Cell>
                  <Table.Cell>{reservation.roomName}</Table.Cell>
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
      <div className="w-full md:w-1/2 p-4">
        <h3 className="mb-2">QR 코드 확인 :</h3>
        <p className="text-red-700 text-sm mb-3">
          입력란에 커서를 놓고 QR 코드를 스캔해주세요.
        </p>
        <input
          type="text"
          onKeyDown={handleQrKeyDown}
          placeholder="Scan QR Code"
          className="border border-gray-300 p-2 rounded w-full"
        />
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-100 text-red-700">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default CheckVisit;
