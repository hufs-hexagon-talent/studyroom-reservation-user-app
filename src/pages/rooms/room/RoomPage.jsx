import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  addMinutes,
  format,
  parse,
  isBefore,
  differenceInMinutes,
  areIntervalsOverlapping,
} from 'date-fns';

import Banner from '../../admin/banner/Banner';
import { ko } from 'date-fns/locale';
import { useSnackbar } from 'react-simple-snackbar';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarX2 } from 'lucide-react';
import { fetchDate } from '../../../api/policySchedule.api';
import { useReservations, useReserve } from '../../../api/reservation.api';
import useUrlQuery from '../../../hooks/useUrlQuery';
import useAuth from '../../../hooks/useAuth';
import { fetchBlockedPeriod, isAuthError } from '../../../api/user.api';
import {
  getReserveErrorMessage,
  hasReservedSlotInRange,
  isOutsideOperationHours,
  maxMinutesExceededMessage,
  normalizeErrorCode,
} from './reservationSlot';
import CustomButton from '../../../components/button/Button';
import { Button } from 'flowbite-react';
import { Modal } from 'flowbite-react';

const createTimeTable = config => {
  const { startTime, endTime, intervalMinute } = config;
  const start = new Date();
  // 시작 시간에 맞게 지정
  start.setHours(startTime.hour, startTime.minute, 0, 0);

  const end = new Date();
  // 종료 시간에 맞게 지정
  end.setHours(endTime.hour, endTime.minute, 0, 0);

  const timeTable = [];

  // 시작시간으로 선언
  let currentTime = start;
  // 종료 시간이 될 떄 까지 intervalMinunte 간격으로 배열에 시간을 채워 넣음
  while (currentTime <= end) {
    timeTable.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, intervalMinute);
  }

  // 마지막 종료 시각을 채워 넣어야해서 배열의 length-1엔 endTime이 되게
  if (timeTable[timeTable.length - 1] !== format(end, 'HH:mm')) {
    timeTable[timeTable.length - 1] = format(end, 'HH:mm');
  }

  return timeTable;
};

const RoomPage = () => {
  // snackBar
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRangeFrom, setSelectedRangeFrom] = useState(null);
  const [selectedRangeTo, selSelectedRangeTo] = useState(null);
  // 조회 실패 시 null 로 두면 달력 제한이 풀려 학생이 날짜를 직접 고를 수 있다
  const [availableDate, setAvailableDate] = useState([]);
  const [earliestStartTime, setEarliestStartTime] = useState(null);
  const [startHour, setStartHour] = useState(null);
  const [startMinute, setStartMinute] = useState(null);
  const [endHour, setEndHour] = useState(null);
  const [endMinute, setEndMinute] = useState(null);
  const [maxReservationMinute, setMaxReservationMinute] = useState(null);
  const [openReserveModal, setOpenReserveModal] = useState(false);

  const navigate = useNavigate();
  const today = new Date();
  const departmentId = 1;

  const [selectedDate, setSelectedDate] = useUrlQuery(
    'date',
    format(new Date(), 'yyyy-MM-dd'),
  );

  const { mutateAsync: doReserve, isPending: isReserving } = useReserve();
  const {
    data: reservationsByRooms,
    isPending: isReservationsPending,
    isError: isReservationsError,
    refetch: refetchReservations,
  } = useReservations({
    date: selectedDate,
    departmentId: departmentId,
  });
  const { loggedIn: isLoggedIn } = useAuth();

  const hasRooms =
    !isReservationsPending &&
    !isReservationsError &&
    reservationsByRooms?.length > 0;

  // 화면을 열어둔 채 시간이 지나면 지난 칸이 저절로 잠기도록 현재 시각을 갱신한다
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // 선택해 둔 첫 칸이 시간이 지나 잠기면 선택을 푼다. 잠긴 칸을 예약하려다 실패하는 일을 막는다
  useEffect(() => {
    if (!selectedRangeFrom) return;
    if (now > addMinutes(selectedRangeFrom, 30)) {
      setSelectedRoom(null);
      setSelectedRangeFrom(null);
      selSelectedRangeTo(null);
    }
  }, [now, selectedRangeFrom]);

  useEffect(() => {
    if (reservationsByRooms && reservationsByRooms.length > 0) {
      const startTimes = reservationsByRooms?.map(
        room => room.operationStartTime,
      );
      // operationStartTime들에서 서로 비교해서 제일 작은 값이 earliest가 되게
      const earliestTime = startTimes.reduce((earliest, current) => {
        return earliest < current ? earliest : current;
      });
      setEarliestStartTime(earliestTime);

      // ':' 분리해서 시와 분으로 나눠서 저장
      const [startHour, startMinute] = earliestTime.split(':');
      setStartHour(parseInt(startHour, 10));
      setStartMinute(parseInt(startMinute, 10));

      const endTimes = reservationsByRooms?.map(room => room.operationEndTime);

      // operationEndTime들에서 서로 비교해서 제일 큰 값이 latest가 되게
      const latestTime = endTimes.reduce((latest, current) => {
        return latest > current ? latest : current;
      });
      // ':' 분리해서 시와 분으로 나눠서 저장
      const [endHour, endMinute] = latestTime.split(':');
      setEndHour(parseInt(endHour, 10));
      setEndMinute(parseInt(endMinute, 10));

      // eachMaxMinute들을 배열로 저장
      const eachMaxMinutes = reservationsByRooms?.map(
        partition => partition.eachMaxMinute,
      );
      // 배열들 중에 가장 큰 값을 maxEachMaxMinute으로 저장
      const maxEachMaxMinute = Math.max(...eachMaxMinutes);
      setMaxReservationMinute(maxEachMaxMinute);

      // 날짜 변경 시 기존 선택 초기화
      setSelectedRoom(null);
      setSelectedRangeFrom(null);
      selSelectedRangeTo(null);
    }
  }, [reservationsByRooms, selectedDate]);

  // 계산해놓은 시간들을 timeTableConfig에 객체로 선언
  const timeTableConfig = {
    startTime: {
      hour: startHour,
      minute: startMinute,
    },
    endTime: {
      hour: endHour,
      minute: endMinute,
    },
    intervalMinute: 30,
    maxReservationMinute: maxReservationMinute,
  };

  const times =
    startHour !== null && startMinute !== null
      ? createTimeTable(timeTableConfig)
      : [];

  // date-picker에서 날짜 선택할 때마다 실행되는 함수
  const handleDateChange = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    // date picker에서 선택한 날짜 저장
    setSelectedDate(formattedDate);
  };

  const isSomethingSelected =
    selectedRoom && selectedRangeFrom && selectedRangeTo;

  // 슬롯의 상태 토글하는 함수
  const toggleSlot = useCallback(
    (partition, time) => {
      const targetStartAt = parse(
        `${selectedDate} ${time}`,
        'yyyy-MM-dd HH:mm',
        new Date(),
      );
      const targetEndAt = addMinutes(
        targetStartAt,
        timeTableConfig.intervalMinute,
      );

      const isFirstSelect = !selectedRangeFrom && !selectedRangeTo;
      const isDifferentRoom = selectedRoom !== partition;

      const isSelectPast = isBefore(targetStartAt, selectedRangeFrom);
      const isOverDue =
        differenceInMinutes(targetEndAt, selectedRangeFrom) >
        selectedRoom?.eachMaxMinute;

      if (
        selectedRoom === partition &&
        selectedRangeFrom?.getTime() === targetStartAt.getTime() &&
        selectedRangeTo?.getTime() === targetEndAt.getTime()
      ) {
        setSelectedRoom(null);
        setSelectedRangeFrom(null);
        selSelectedRangeTo(null);
        return;
      }

      // 새롭게 시간을 선택함
      if (isFirstSelect || isDifferentRoom || isSelectPast) {
        setSelectedRoom(partition);
        setSelectedRangeFrom(targetStartAt);
        selSelectedRangeTo(targetEndAt);
        return;
      }

      // 최대 예약 시간을 넘는 연장은 안내만 하고 선택은 그대로 둔다
      if (isOverDue) {
        openSnackbar(maxMinutesExceededMessage(selectedRoom?.eachMaxMinute));
        return;
      }

      // 연장 범위 안에 남의 예약이 있으면 건너뛰지 않고 클릭한 칸부터 새로 선택한다
      if (
        hasReservedSlotInRange(
          partition.reservationTimeRanges,
          selectedRangeFrom,
          targetEndAt,
        )
      ) {
        setSelectedRoom(partition);
        setSelectedRangeFrom(targetStartAt);
        selSelectedRangeTo(targetEndAt);
        return;
      }

      // 시간을 연장함
      setSelectedRoom(partition);
      selSelectedRangeTo(targetEndAt);
    },
    [
      selectedDate,
      setSelectedRangeFrom,
      selSelectedRangeTo,
      selectedRoom,
      selectedRangeFrom,
      selectedRangeTo,
      openSnackbar,
    ],
  );

  // 자신의 예약 생성
  const handleReservation = useCallback(
    async ({ roomPartitionId, startDateTime, endDateTime }) => {
      if (!isLoggedIn) {
        openSnackbar('로그인 후에 세미나실 예약이 가능합니다.');
        setTimeout(() => {
          closeSnackbar();
          navigate('/login');
        }, 5000);
        return;
      }
      if (!selectedRoom || !selectedRangeFrom || !selectedRangeTo) {
        openSnackbar(
          '원하는 호실과 시간대를 선택하고 예약하기 버튼을 눌러주세요',
        );
        setTimeout(() => {
          closeSnackbar();
        }, 5000);
        return;
      }
      // 요청이 끝나기 전에 다시 누르면 같은 예약이 두 번 전송된다
      if (isReserving) return;
      try {
        await doReserve({
          roomPartitionId,
          startDateTime,
          endDateTime,
        });
        navigate('/check');
      } catch (error) {
        // 인증 오류는 SessionExpiryWatcher 가 재로그인 안내를 띄운다
        if (isAuthError(error)) return;

        const status = error?.response?.status;
        const code = normalizeErrorCode(error?.response?.data?.code);

        // 노쇼 차단이면 해제일을 조회해 문구에 넣는다. 조회에 실패해도 안내는 한다
        let blockedUntil = null;
        if (code === 'RESERVATION-004') {
          try {
            const blocked = await fetchBlockedPeriod();
            blockedUntil = blocked?.data?.endBlockedDate ?? null;
          } catch {
            blockedUntil = null;
          }
        }

        openSnackbar(getReserveErrorMessage(code, { blockedUntil }));

        // 업무 규칙에 걸린 선택은 그대로 두면 같은 실패가 반복된다
        if (status === 412) {
          setSelectedRoom(null);
          setSelectedRangeFrom(null);
          selSelectedRangeTo(null);
        }
      }
    },
    [
      doReserve,
      isLoggedIn,
      isReserving,
      selectedRoom,
      selectedRangeFrom,
      selectedRangeTo,
    ],
  );

  // 최대 예약 시간에 부합하는지 계산하는 함수
  const handleCellClick = (partition, timeIndex) => {
    const slotDateFrom = parse(
      `${selectedDate} ${times[timeIndex]}`,
      'yyyy-MM-dd HH:mm',
      new Date(),
    );

    // 갱신 주기 사이에 지나가 버린 칸이 눌리지 않게 클릭 시점으로 한 번 더 확인한다
    const clickedAt = new Date();
    if (clickedAt > addMinutes(slotDateFrom, timeTableConfig.intervalMinute)) {
      setNow(clickedAt);
      return;
    }

    // 표의 공통 범위가 아니라 방별 운영시간으로 검사한다
    const isClosed = isOutsideOperationHours(
      format(slotDateFrom, 'HH:mm'),
      partition.operationStartTime,
      partition.operationEndTime,
    );

    if (!isClosed) {
      toggleSlot(partition, times[timeIndex]);
    }
  };

  // date-picker 설정
  registerLocale('ko', ko);

  // 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
  useEffect(() => {
    const getDate = async () => {
      try {
        const dates = await fetchDate(departmentId);
        setAvailableDate(dates);
      } catch {
        // 목록이 비어 있으면 달력의 모든 날짜가 잠기므로 제한을 풀고 안내한다
        setAvailableDate(null);
        openSnackbar(
          '예약 가능한 날짜를 불러오지 못했습니다. 달력에서 날짜를 직접 골라 주세요.',
        );
      }
    };
    getDate();
  }, []);

  return (
    <>
      <div id="container">
        <div id="head-container">
          <Typography
            marginTop="50px"
            variant="h5"
            fontWeight={450}
            component="div"
            align="center">
            일자별 세미나실 예약 현황
          </Typography>
          <div
            id="text"
            className="mt-5 mx-3 justify-center text-center break-keep"
            style={{ color: '#9D9FA2' }}>
            아래 예약 현황의 예약가능 시간을 선택하면 해당 세미나실을 예약하여
            사용할 수 있습니다.
          </div>
          {/* 배너 */}
          <Banner />
          {/* date-picker 부분 */}
          <div className="flex justify-center">
            <div id="datepicker-container">
              <DatePicker
                id="date"
                className={'text-center flex'}
                selected={selectedDate}
                locale={ko}
                minDate={today}
                includeDates={availableDate}
                onChange={handleDateChange}
                dateFormat="yyyy년 MM월 dd일"
                showIcon
              />
            </div>
          </div>
        </div>
        {/* 예약 가능/불가능 색 표현 */}
        {hasRooms && (
          <div id="squares" className="flex pl-4">
            <div
              className="w-6 h-6 mt-10"
              style={{ backgroundColor: '#F1EEE9' }}></div>
            <div className="mt-10 ml-2">예약 가능</div>
            <div
              className="w-6 h-6 mt-10 ml-5"
              style={{ backgroundColor: '#7599BA' }}></div>
            <div className="mt-10 ml-2">예약 선택</div>
            <div
              className="w-6 h-6 mt-10 ml-5"
              style={{ backgroundColor: '#002D56' }}></div>
            <div className="mt-10 ml-2">예약 완료</div>
          </div>
        )}
        {/* timeTable 시작 */}
        {isReservationsPending && (
          <div className="text-center mx-8 md:mx-12 lg:mx-96 py-12 my-12 rounded-lg bg-gray-100 text-gray-900">
            예약 현황을 불러오는 중입니다.
          </div>
        )}
        {!isReservationsPending && isReservationsError && (
          <div className="text-center mx-8 md:mx-12 lg:mx-96 py-12 my-12 rounded-lg bg-gray-100 text-gray-900">
            예약 현황을 불러오지 못했습니다.
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                color="dark"
                onClick={() => refetchReservations()}>
                다시 시도
              </Button>
            </div>
          </div>
        )}
        {hasRooms && (
          <div>
            <TableContainer
              sx={{
                overflowX: 'auto',
                marginTop: '20px',
                '@media (max-width : 1300px)': {
                  overflowX: 'scroll',
                },
                // sticky 기준점이 어긋나지 않게 padding 대신 margin 으로 띄운다
                width: 'calc(100% - 60px)',
                marginLeft: '60px',
              }}>
              <Table>
                <TableHead
                  sx={{
                    overflowX: 'auto',
                    borderBottom: 'none',
                  }}>
                  <TableRow>
                    <TableCell
                      align="center"
                      width={100}
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        backgroundColor: '#fff',
                      }}
                    />
                    {times.map((time, timeIndex) => (
                      <TableCell
                        key={timeIndex}
                        align="center"
                        width={200}
                        className="relative"
                        sx={{
                          borderRight: 'none',
                          borderTop: 'none',
                          borderBottom: 'none',
                        }}>
                        <div style={{ width: 20, height: 30 }}>
                          <span className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                            {time}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservationsByRooms?.map((reservationsByRoom, i) => (
                    <TableRow key={i}>
                      <TableCell
                        sx={{
                          px: 2,
                          py: 2,
                          borderLeft: '1px solid #ccc',
                          whiteSpace: 'nowrap',
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          backgroundColor: '#fff',
                        }}>
                        {`${reservationsByRoom.roomName}-${reservationsByRoom.partitionNumber}`}
                      </TableCell>
                      {times.map((time, timeIndex) => {
                        if (timeIndex === times.length - 1) {
                          return null; // 마지막 열을 제외
                        }

                        const slotDateFrom = parse(
                          `${selectedDate} ${time}`,
                          'yyyy-MM-dd HH:mm',
                          new Date(),
                        );
                        const slotDateTo = addMinutes(slotDateFrom, 30);
                        const slotDateFromPlus30 = addMinutes(slotDateFrom, 30);
                        const isClosed = isOutsideOperationHours(
                          format(slotDateFrom, 'HH:mm'),
                          reservationsByRoom.operationStartTime,
                          reservationsByRoom.operationEndTime,
                        );
                        const isPast = now > slotDateFromPlus30;
                        const isSelected =
                          reservationsByRoom.partitionId ===
                            selectedRoom?.partitionId &&
                          areIntervalsOverlapping(
                            { start: selectedRangeFrom, end: selectedRangeTo },
                            { start: slotDateFrom, end: slotDateTo },
                          );
                        const isReserved =
                          reservationsByRoom?.reservationTimeRanges.some(
                            reservation => {
                              const reservationStart = new Date(
                                reservation.startDateTime,
                              );
                              const reservationEnd = new Date(
                                reservation.endDateTime,
                              );
                              return (
                                slotDateFrom >= reservationStart &&
                                slotDateFrom < reservationEnd
                              );
                            },
                          );
                        const isSelectable =
                          !isPast && !isReserved && !isClosed;
                        const isInSelectableRange =
                          selectedRangeTo &&
                          differenceInMinutes(slotDateTo, selectedRangeFrom) <=
                            reservationsByRoom.eachMaxMinute &&
                          differenceInMinutes(slotDateTo, selectedRangeFrom) >
                            0 &&
                          selectedRoom?.partitionId ===
                            reservationsByRoom.partitionId;
                        // 지난 칸은 선택 표시보다 잠금 표시가 우선이다
                        const mode = isReserved
                          ? 'reserved'
                          : isPast
                            ? 'past'
                            : isSelected
                              ? 'selected'
                              : isClosed
                                ? 'closed'
                                : 'none';

                        return (
                          <TableCell
                            key={timeIndex}
                            onClick={() =>
                              isSelectable &&
                              handleCellClick(reservationsByRoom, timeIndex)
                            }
                            className={isSelected ? 'selected' : ''}
                            style={{
                              opacity:
                                !isInSelectableRange && isSomethingSelected
                                  ? 0.4
                                  : 1,
                              backgroundColor: {
                                past: '#AAAAAA',
                                closed: '#AAAAAA',
                                selected: '#7599BA',
                                reserved: '#002D56',
                                none: '#F1EEE9',
                              }[mode],
                              borderRight: '1px solid #ccc',
                              borderLeft: '1px solid #ccc',
                              borderTop: '1px solid #ccc',
                              borderBottom: '1px solid #ccc',
                              cursor: isSelectable ? 'pointer' : 'not-allowed',
                            }}></TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {!isReservationsPending && !isReservationsError && !hasRooms && (
          <div className="text-center mx-8 md:mx-12 lg:mx-96 py-12 my-12 rounded-lg bg-gray-100 text-gray-900">
            선택한 날짜에는 예약할 수 있는 방이 없습니다. <br />
            다른 날짜를 선택해 주세요.
          </div>
        )}
        {hasRooms && (
          <div className="p-10 flex justify-end">
            <CustomButton
              disabled={isReserving}
              onClick={() => {
                if (isReserving) return;
                if (selectedRoom && selectedRangeFrom && selectedRangeTo) {
                  setOpenReserveModal(true);
                } else {
                  openSnackbar('원하는 호실과 시간대를 선택해주세요.');
                }
              }}
              text="예약하기"
            />
          </div>
        )}
      </div>

      {/* 선택된 예약 정보 모달 */}
      <Modal
        className="flex items-center justify-center"
        show={openReserveModal}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClose={() => setOpenReserveModal(false)}>
        <Modal.Header>
          <h2 className="text-xl font-semibold">현재 선택한 예약 정보</h2>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-2 text-base">
            <p className="mb-1">
              <span className="font-medium">호실명 :</span>{' '}
              <span>
                {selectedRoom?.roomName}-{selectedRoom?.partitionNumber}
              </span>
            </p>
            <p className="mb-1">
              <span className="font-medium">선택한 날짜 :</span>{' '}
              <span>{format(selectedDate, 'yyyy년 MM월 dd일')}</span>
            </p>
            <p className="mb-1">
              <span className="font-medium">사용 시간 :</span>{' '}
              <span>
                {selectedRangeFrom && format(selectedRangeFrom, 'HH:mm')} ~{' '}
                {selectedRangeTo && format(selectedRangeTo, 'HH:mm')}
              </span>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end space-x-2 w-full">
            <Button
              onClick={() => {
                setOpenReserveModal(false);
              }}
              className="bg-red-600 text-white hover:bg-red-700">
              취소
            </Button>
            <Button
              disabled={isReserving}
              onClick={() => {
                if (isReserving) return;
                handleReservation({
                  roomPartitionId: selectedRoom
                    ? selectedRoom.partitionId
                    : null,
                  startDateTime: selectedRangeFrom,
                  endDateTime: selectedRangeTo,
                });
                setOpenReserveModal(false);
              }}
              color="dark"
              className="text-white ">
              예약
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RoomPage;
