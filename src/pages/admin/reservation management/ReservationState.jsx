import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { Pagination } from '@mui/material';
import { useSnackbar } from 'react-simple-snackbar';
import { useAllRooms } from '../../../api/room.api';
import { useAllPartitions } from '../../../api/roomPartition.api';
import {
  useReservationsByPartitions,
  useVisitedState,
  useNotVisitedState,
  useProcessedState,
  useAdminDeleteReservation,
  useExportReservationExcel,
} from '../../../api/reservation.api';
import { Table, Checkbox, Modal, Button } from 'flowbite-react';
import Edit from '../../../assets/icons/edit.png';
import Delete from '../../../assets/icons/delete.png';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFileExcel } from 'react-icons/fa6';

const ReservationState = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: rooms } = useAllRooms();
  const { data: allPartitions } = useAllPartitions();
  const { data: reservationsByPartitions, refetch } =
    useReservationsByPartitions({
      date: format(selectedDate, 'yyyy-MM-dd'),
      partitionIds: allPartitions?.map(partition => partition.partitionId),
    });

  const { mutate: doDelete } = useAdminDeleteReservation();
  const { mutateAsync: visitedState } = useVisitedState();
  const { mutateAsync: notVisitedState } = useNotVisitedState();
  const { mutateAsync: processedState } = useProcessedState();

  const serviceRoles = ['NOT_VISITED', 'VISITED', 'PROCESSED'];
  const roomNameList = rooms?.map(room => room.roomName);

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

  // 선택된 serviceRoles 관리
  const toggleRole = role => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  };

  // UTC 변환 함수
  const toISODateUTC = date => {
    return format(date, "yyyy-MM-dd'T'00:00:00'Z'");
  };

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
        console.error(err);
      },
    });
  };

  // 호실 선택
  const handleRoomSelect = room => {
    setSelectedRooms(
      prev =>
        prev.includes(room)
          ? prev.filter(r => r !== room) // 이미 있으면 제거
          : [...prev, room], // 없으면 추가
    );
  };

  // 호실 선택이 바뀌면 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRooms]);

  // 호실 선택에 따라 필터링한 예약 목록
  const filteredReservations =
    reservationsByPartitions
      ?.filter(reservation =>
        selectedRooms.length === 0
          ? true
          : selectedRooms.includes(reservation.roomName),
      )
      .sort(
        (a, b) =>
          new Date(a.reservationStartTime) - new Date(b.reservationStartTime),
      ) || [];

  // 페이지네이션 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">
        Reservation State Management
      </div>
      {/* 날짜 선택 */}
      <div className="py-4">
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          locale="ko"
          className="border border-gray-300 p-2 rounded"
        />
      </div>
      <div className="flex flex-row items-center justify-between">
        {/* Filtering Checkbox */}
        <div className="flex flex-row gap-x-6 items-center pt-4 pb-8">
          {roomNameList?.map(room => (
            <div key={room} className="flex flex-row gap-x-2 items-center">
              <Checkbox
                onChange={() => handleRoomSelect(room)}
                className="rounded-none"
              />
              <div>{room}호</div>
            </div>
          ))}
        </div>
        {/* Export Excel */}
        <Button
          onClick={setOpenExportModal}
          className="cursor-pointer"
          color="dark">
          <div className="flex flex-row items-center gap-x-3">
            <FaFileExcel />
            <div>내보내기</div>
          </div>
        </Button>
      </div>
      <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-2xl w-full">
        <Table>
          <Table.Head className="break-keep text-center">
            <Table.HeadCell>출석 유무</Table.HeadCell>
            <Table.HeadCell>호실</Table.HeadCell>
            <Table.HeadCell>이름</Table.HeadCell>
            <Table.HeadCell>시작 시간</Table.HeadCell>
            <Table.HeadCell>종료 시간</Table.HeadCell>
            <Table.HeadCell>출석 상태 변경</Table.HeadCell>
            <Table.HeadCell>예약 삭제</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {paginatedReservations
              ?.filter(reservation =>
                selectedRooms.length === 0
                  ? true // 체크박스 선택 없으면 전체 출력
                  : selectedRooms.includes(reservation.roomName),
              )
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
                  <Table.Cell
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(
                        `/divide/fetchReservations/${reservation.userId}`,
                      )
                    }>
                    {reservation.name}
                  </Table.Cell>
                  <Table.Cell>
                    {format(
                      new Date(reservation.reservationStartTime),
                      'HH:mm',
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(reservation.reservationEndTime), 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-center items-center h-full">
                      <img
                        src={Edit}
                        alt="edit"
                        onClick={() => {
                          setSelectedReservationId(reservation.reservationId);
                          setOpenEditModal(true);
                        }}
                        className="cursor-pointer w-6 h-6"
                      />
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex justify-center items-center h-full">
                      <img
                        src={Delete}
                        alt="delete"
                        onClick={() => {
                          setSelectedReservationId(reservation.reservationId);
                          setOpenDeleteModal(reservation.reservationId);
                        }}
                        className="cursor-pointer w-6 h-6"
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
        {/* pagination */}
        <div className="flex justify-center mt-4">
          <Pagination
            count={Math.ceil(filteredReservations.length / itemsPerPage)}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            shape="rounded"
          />
        </div>
      </div>

      {/* 엑셀 내보내기 모달 */}
      <div className="flex justify-center items-center">
        <Modal
          show={openExportModal}
          onClose={() => setOpenExportModal(false)}
          className="flex justify-center items-center w-full p-4 sm:p-0">
          <Modal.Header>시작/종료 날짜 선택</Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-y-6">
              <div className="flex flex-row gap-x-3">
                {serviceRoles.map(serviceRole => (
                  <div
                    key={serviceRole}
                    className="flex items-center gap-2 mb-2">
                    <Checkbox
                      className="rounded-none"
                      checked={selectedRoles.includes(serviceRole)}
                      onChange={() => toggleRole(serviceRole)}
                    />
                    <div>{serviceRole}</div>
                  </div>
                ))}
              </div>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={dates => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }}
                className="w-1/2"
                dateFormat="yyyy년 MM월 dd일"
                placeholderText="날짜를 선택하세요"
                withPortal
              />
            </div>
            <div className="flex justify-end">
              <Button
                color="dark"
                onClick={() => {
                  const params = {
                    states: selectedRoles,
                    startDateTime: startDate
                      ? toISODateUTC(startDate)
                      : undefined,
                    endDateTime: endDate ? toISODateUTC(endDate) : undefined,
                  };
                  useExportReservationExcel(params); // 엑셀 내보내기 API 호출
                  setOpenExportModal(false);
                }}>
                Export
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>

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

export default ReservationState;
