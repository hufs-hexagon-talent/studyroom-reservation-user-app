import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import useUrlQuery from '../../../hooks/useUrlQuery';

import { ko } from 'date-fns/locale';
import { useSnackbar } from 'react-simple-snackbar';

import 'react-datepicker/dist/react-datepicker.css';

import { fetchDate, useReservations, useReserve } from '../../../api/user.api';
import useAuth from '../../../hooks/useAuth';
import Button from '../../../components/button/Button';

const createTimeTable = config => {
  const { startTime, endTime, intervalMinute } = config;
  const start = new Date();
  start.setHours(startTime.hour, startTime.minute, 0, 0);

  const end = new Date();
  end.setHours(endTime.hour, endTime.minute, 0, 0);

  const timeTable = [];

  let currentTime = start;
  while (currentTime <= end) {
    timeTable.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, intervalMinute);
  }

  if (timeTable[timeTable.length - 1] !== format(end, 'HH:mm')) {
    timeTable[timeTable.length - 1] = format(end, 'HH:mm');
  }

  return timeTable;
};

const RoomPage = () => {
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRangeFrom, setSelectedRangeFrom] = useState(null);
  const [selectedRangeTo, selSelectedRangeTo] = useState(null);
  const [selectedDate, setSelectedDate] = useUrlQuery(
    'date',
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [availableDate, setAvailableDate] = useState([]);
  //const times = useMemo(() => createTimeTable(timeTableConfig), []);
  const navigate = useNavigate();
  const today = new Date();

  const { mutateAsync: doReserve } = useReserve();
  const { data: reservationsByRooms } = useReservations({
    date: selectedDate,
  });
  const { loggedIn: isLoggedIn } = useAuth();

  const [earliestStartTime, setEarliestStartTime] = useState(null);
  const [latestEndTime, setLatestEndTime] = useState(null);
  const [startHour, setStartHour] = useState(null);
  const [startMinute, setStartMinute] = useState(null);
  const [endHour, setEndHour] = useState(null);
  const [endMinute, setEndMinute] = useState(null);

  useEffect(() => {
    if (reservationsByRooms && reservationsByRooms.length > 0) {
      const startTimes = reservationsByRooms.map(
        room => room.policy.operationStartTime,
      );
      const earliestTime = startTimes.reduce((earliest, current) => {
        return earliest < current ? earliest : current;
      });
      setEarliestStartTime(earliestTime);

      const [startHour, startMinute] = earliestTime.split(':');
      setStartHour(parseInt(startHour, 10));
      setStartMinute(parseInt(startMinute, 10));

      const endTimes = reservationsByRooms.map(
        room => room.policy.operationEndTime,
      );
      const latestTime = endTimes.reduce((latest, current) => {
        return latest > current ? latest : current;
      });
      setLatestEndTime(latestTime);

      const [endHour, endMinute] = latestTime.split(':');
      setEndHour(parseInt(endHour, 10));
      setEndMinute(parseInt(endMinute, 10));
    }
  }, [reservationsByRooms]);

  const timeTableConfig = useMemo(
    () => ({
      startTime: {
        hour: startHour,
        minute: startMinute,
      },
      endTime: {
        hour: endHour,
        minute: endMinute,
      },
      intervalMinute: 30,
      maxReservationMinute: 120,
      maxReservationSlots: 4,
    }),
    [startHour, startMinute],
  );

  const times = useMemo(() => {
    if (startHour !== null && startMinute !== null) {
      return createTimeTable(timeTableConfig);
    }
    return [];
  }, [timeTableConfig]);

  // date-picker에서 날짜 선택할 때마다 실행되는 함수
  const handleDateChange = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    // fetchReservation(formattedDate, setSlotsArr, setReservedSlots);
  };

  const isRangeSelected = useMemo(
    () =>
      selectedRangeFrom &&
      selectedRangeTo &&
      differenceInMinutes(selectedRangeTo, selectedRangeFrom) >
        timeTableConfig.intervalMinute,
    [selectedRangeFrom, selectedRangeTo],
  );

  const isSomethingSelected = useMemo(
    () => selectedRoom && selectedRangeFrom && selectedRangeTo,
    [selectedRoom, selectedRangeFrom, selectedRangeTo],
  );

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
        selectedRoom?.policy.eachMaxMinute;

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
      if (
        isFirstSelect ||
        isDifferentRoom ||
        isRangeSelected ||
        isSelectPast ||
        isOverDue
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
      isRangeSelected,
    ],
  );

  // 자신의 예약 생성
  const handleReservation = useCallback(
    async ({ roomId, startDateTime, endDateTime }) => {
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
      try {
        await doReserve({
          roomId,
          startDateTime,
          endDateTime,
        });
        navigate('/check');
      } catch (error) {
        openSnackbar(error.response.data.errorMessage);
      }
    },
    [doReserve, isLoggedIn, selectedRoom, selectedRangeFrom, selectedRangeTo],
  );

  // 최대 예약 시간에 부합하는지 계산하는 함수
  const handleCellClick = (partition, timeIndex) => {
    toggleSlot(partition, times[timeIndex]);
  };

  // date-picker 설정
  registerLocale('ko', ko);

  // 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
  useEffect(() => {
    const getDate = async () => {
      const dates = await fetchDate();
      setAvailableDate(dates);
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
            fontWeight={350}
            component="div"
            align="center">
            일자별 세미나실 예약 현황
          </Typography>
          <div
            className="mt-5 mb-10 justify-center text-center"
            style={{ color: '#9D9FA2' }}>
            아래 예약 현황의 예약가능 시간을 선택하시면 해당 세미나실을 대관할
            수 있습니다.
          </div>
          {/* date-picker 부분 */}
          <div className="flex justify-center">
            <DatePicker
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

        <div id="squares" className="flex p-4">
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
        {/* timeTable 시작 */}
        <div>
          <TableContainer
            sx={{
              overflowX: 'auto',
              width: '100%',
              marginTop: '20px',
              '@media (max-width : 1300px)': {
                overflowX: 'scroll',
              },
            }}>
            <Table>
              <TableHead
                className="fixedPartitions"
                sx={{ borderBottom: 'none' }}>
                <TableRow>
                  <TableCell align="center" width={100} />
                  {times.map((time, timeIndex) => (
                    <TableCell
                      key={timeIndex}
                      align="center"
                      width={200}
                      className="fixedPartitions relative">
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
                    {/* <pre>{JSON.stringify(reservationsByRoom, null, 2)}</pre> */}
                    <TableCell sx={{ px: 2, py: 2, whiteSpace: 'nowrap' }}>
                      {reservationsByRoom.roomName}
                    </TableCell>
                    {times.map((time, timeIndex) => {
                      const slotDateFrom = parse(
                        `${selectedDate} ${time}`,
                        'yyyy-MM-dd HH:mm',
                        new Date(),
                      );
                      const slotDateTo = addMinutes(slotDateFrom, 30);

                      // 30분 늦은 시간을 계산하여 비교
                      const slotDateFromPlus30 = addMinutes(slotDateFrom, 30);
                      const isPast = new Date() > slotDateFromPlus30;

                      const isSelected =
                        reservationsByRoom.roomId === selectedRoom?.roomId &&
                        areIntervalsOverlapping(
                          { start: selectedRangeFrom, end: selectedRangeTo },
                          { start: slotDateFrom, end: slotDateTo },
                        );

                      const isReserved = reservationsByRoom?.timeline?.some(
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

                      const isSelectable = !isPast && !isReserved;

                      const isInSelectableRange =
                        selectedRangeTo &&
                        differenceInMinutes(slotDateTo, selectedRangeFrom) <=
                          reservationsByRoom.policy.eachMaxMinute &&
                        differenceInMinutes(slotDateTo, selectedRangeFrom) >
                          0 &&
                        selectedRoom?.roomId === reservationsByRoom.roomId;

                      const mode = isSelected
                        ? 'selected'
                        : isReserved
                          ? 'reserved'
                          : isPast
                            ? 'past'
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
                              !isRangeSelected &&
                              !isInSelectableRange &&
                              isSomethingSelected
                                ? 0.5
                                : 1,
                            backgroundColor: {
                              past: '#AAAAAA',
                              selected: '#7599BA',
                              reserved: '#002D56',
                              none: '#F1EEE9',
                            }[mode],
                            borderRight: '1px solid #ccc',
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
        <div className="p-10 flex justify-end">
          <Button
            onClick={() =>
              handleReservation({
                roomId: selectedRoom ? selectedRoom.roomId : null,
                startDateTime: selectedRangeFrom,
                endDateTime: selectedRangeTo,
              })
            }
            text="예약하기"
          />
        </div>
      </div>
    </>
  );
};

export default RoomPage;
