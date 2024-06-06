import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { HiInformationCircle } from 'react-icons/hi';
import {
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { addMinutes, format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSnackbar } from 'react-simple-snackbar';

import 'react-datepicker/dist/react-datepicker.css';

import {
  fetchDate,
  useReservationsByRooms,
  useReserve,
} from '../../../api/user.api';
import Button from '../../../components/button/Button';

const timeTableConfig = {
  startTime: {
    hour: 8,
    minute: 30,
  },
  endTime: {
    hour: 22,
    minute: 30,
  },
  intervalMinute: 30,
  maxReservationSlots: 4,
};

// table 만드는 함수
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

const intervalMinute = 30;

const RoomPage = () => {
  // 현재 시간
  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  const today = new Date();

  const [selectedPartition, setSelectedPartition] = useState(null);
  const [selectedRangeFrom, setSelectedRangeFrom] = useState(null);
  const [selectedRangeTo, selSelectedRangeTo] = useState(null);
  const [slotsArr, setSlotsArr] = useState([]);
  const [reservedSlots, setReservedSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [availableDate, setAvailableDate] = useState([]);
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const times = useMemo(() => createTimeTable(timeTableConfig), []);
  const navigate = useNavigate();

  const { mutateAsync: doReserve } = useReserve();

  const { data: reservationsByRooms } = useReservationsByRooms({
    date: selectedDate,
  });
  // date-picker에서 날짜 선택할 때마다 실행되는 함수
  const handleDateChange = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    // fetchReservation(formattedDate, setSlotsArr, setReservedSlots);
  };

  // 슬롯이 선택되었는지 확인하는 함수
  // const getSlotSelected = useCallback(
  //   ({ room, from, to }) => {
  //     if (!selectedRangeFrom || !selectedRangeTo) return false;
  //     if (selectedPartition !== room) return false;

  //     const reservation = reservationsByRooms.find(
  //       reservation => reservation.room === room,
  //     );

  //     if (!reservation) return false;

  //     const startTimeIndex = times.indexOf(format(selectedRangeFrom, 'HH:mm'));
  //     const endTimeIndex = times.indexOf(format(selectedRangeTo, 'HH:mm'));
  //     const timeIndex = times.indexOf(time);

  //     return startTimeIndex <= timeIndex && timeIndex <= endTimeIndex;
  //   },
  //   [selectedRangeFrom, selectedRangeTo, selectedPartition, times],
  // );

  // 슬롯의 상태 토글하는 함수
  const toggleSlot = useCallback(
    (partition, time) => {
      const targetStartAt = parse(
        `${selectedDate} ${time}`,
        'yyyy-MM-dd HH:mm',
        new Date(),
      );
      const targetEndAt = addMinutes(targetStartAt, intervalMinute);

      // const isExist = getSlotSelected({
      //   room: partition,
      //   from: targetStartAt,
      //   to: targetEndAt,
      // });

      // 처음 선택하는 경우,
      if (!selectedRangeFrom && !selectedRangeTo) {
        setSelectedPartition(partition);
        setSelectedRangeFrom(targetStartAt);
        selSelectedRangeTo(targetEndAt);
        console.log('처음 선택하는 경우');
        return;
      }

      if (selectedPartition !== partition) {
        setSelectedPartition(partition);
        setSelectedRangeFrom(targetStartAt);
        selSelectedRangeTo(targetEndAt);
        return;
      }

      const startTimeIndex = times.indexOf(selectedRangeFrom);
      //const endTimeIndex = times.indexOf(selectedRangeTo);
      const timeIndex = times.indexOf(time);

      if (selectedRangeFrom === selectedRangeTo) {
        if (
          Math.abs(startTimeIndex - timeIndex) + 1 >
          timeTableConfig.maxReservationSlots
        ) {
          return (
            <Alert color="failure" icon={HiInformationCircle}>
              <span className="font-medium">경고!</span> 예약은 최대 두시간
              까지만 가능합니다.
            </Alert>
          );
        }
        if (selectedRangeFrom === time) {
          setSelectedPartition(null);
          setSelectedRangeFrom(null);
          selSelectedRangeTo(null);
        } else if (selectedRangeFrom < time) {
          selSelectedRangeTo(targetEndAt);
        } else {
          setSelectedRangeFrom(targetStartAt);
          selSelectedRangeTo(targetEndAt);
        }
        return;
      }

      setSelectedPartition(partition);
    },
    [
      // getSlotSelected,
      setSelectedRangeFrom,
      selSelectedRangeTo,
      selectedPartition,
      times,
      selectedRangeFrom,
      selectedRangeTo,
    ],
  );

  // 자신의 예약 생성
  const handleReservation = useCallback(
    async ({ startDateTime, endDateTime }) => {
      try {
        await doReserve({
          roomId: selectedPartition.roomId,
          startDateTime,
          endDateTime,
        });
        navigate('/check');
        console.log(reservedSlots);
      } catch (error) {
        openSnackbar(error.response.data.errorMessage);
      }
    },
    [doReserve, selectedPartition],
  );

  // 최대 예약 시간에 부합하는지 계산하는 함수
  const handleCellClick = (partition, timeIndex) => {
    const clickedTime = times[timeIndex + 1];
    const currentTime = format(today, 'yyyy-MM-dd HH:mm'); // 현재 시간과 날짜를 포함한 문자열
    const selectedDateTime =
      format(selectedDate, 'yyyy-MM-dd') + ' ' + clickedTime; // 선택한 날짜와 시간을 포함한 문자열

    if (selectedDateTime < currentTime) {
      alert('과거의 시간에 예약을 할 수는 없습니다.');
      return;
    }

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
            fontWeight={600}
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
                    <TableCell>{reservationsByRoom.roomName}</TableCell>
                    {times.map((time, timeIndex) => {
                      const slotDateFrom = parse(
                        `${selectedDate} ${time}`,
                        'yyyy-MM-dd HH:mm',
                        new Date(),
                      );
                      const slotDateTo = addMinutes(slotDateFrom, 30);
                      const isSelected = false;
                      // getSlotSelected({
                      //   room: reservationsByRoom,
                      //   from: slotDateFrom,
                      //   to: slotDateTo,
                      // });
                      const isPast = new Date() > new Date(slotDateFrom);

                      const isSelectable = !isPast;
                      const isReserved = reservationsByRoom?.timeline?.some(
                        reservation => {
                          console.log('reservation', reservation);
                          const reservationStart = new Date(
                            reservation.selectedRangeFrom,
                          );
                          const reservationEnd = new Date(
                            reservation.selectedRangeTo,
                          );
                          return (
                            slotDateFrom >= reservationStart &&
                            slotDateFrom < reservationEnd
                          );
                        },
                      );

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
                            padding: 30,

                            backgroundColor: {
                              past: '#AAAAAA',
                              selected: '#7599BA',
                              reserved: '#002D56',
                              none: '#F1EEE9',
                            }[mode],
                            borderRight: '1px solid #ccc',
                            cursor: isSelectable ? 'pointer' : 'not-allowed',
                          }}>
                          {/* {JSON.stringify({
                            slotDateFrom: slotDateFrom.toLocaleString(),
                            time,
                            isPast,
                            isSelectable,
                            isReserved,
                          })} */}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className="p-10 flex justify-end">
          {selectedRangeFrom && format(selectedRangeFrom, 'yyyy-MM-dd HH:mm')}
          <br />
          {selectedRangeTo && format(selectedRangeTo, 'yyyy-MM-dd HH:mm')}
          <br />
          <Button
            onClick={() =>
              handleReservation({
                startDateTime,
                endDateTime: addMinutes(endDateTime, intervalMinute),
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
