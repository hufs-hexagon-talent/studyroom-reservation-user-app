import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { addMinutes, format } from 'date-fns';
import { ko } from 'date-fns/locale';

import 'react-datepicker/dist/react-datepicker.css';

import {
  fetchDate,
  fetchReservation,
  roomDict,
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

const RoomPage = () => {
  // 현재 시간
  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();

  const [selectedPartition, setSelectedPartition] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [slotsArr, setSlotsArr] = useState([]);
  const [reservedSlots, setReservedSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDate, setAvailableDate] = useState([]);
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const times = useMemo(() => createTimeTable(timeTableConfig), []);

  const { mutate: doReserve } = useReserve();

  // date-picker에서 날짜 선택할 때마다 실행되는 함수
  const handleDateChange = date => {
    setSelectedDate(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    fetchReservation(formattedDate, setSlotsArr, setReservedSlots);
  };

  // 렌더링 될 때마다 table 실행되게
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const dates = await fetchDate();
        setAvailableDate(dates);
        await fetchReservation(formattedDate, setSlotsArr, setReservedSlots); // setReservedSlots 전달
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [selectedDate]);

  // 슬롯이 선택되었는지 확인하는 함수
  const getSlotSelected = useCallback(
    (partition, time) => {
      if (!startTime || !endTime) return false;
      if (selectedPartition !== partition) return false;
      const startTimeIndex = times.indexOf(startTime);
      const endTimeIndex = times.indexOf(endTime);
      const timeIndex = times.indexOf(time);
      return startTimeIndex <= timeIndex && timeIndex <= endTimeIndex;
    },
    [startTime, endTime, selectedPartition, times],
  );

  // 슬롯의 상태 토글하는 함수
  const toggleSlot = useCallback(
    (partition, time) => {
      const isExist = getSlotSelected(partition, time);

      if (!startTime && !endTime) {
        setSelectedPartition(partition);
        setStartTime(time);
        setEndTime(time);
        return;
      }

      if (selectedPartition !== partition) {
        setSelectedPartition(partition);
        setStartTime(time);
        setEndTime(time);
        return;
      }

      const startTimeIndex = times.indexOf(startTime);
      //const endTimeIndex = times.indexOf(endTime);
      const timeIndex = times.indexOf(time);

      if (startTime === endTime) {
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
        if (startTime === time) {
          setSelectedPartition(null);
          setStartTime(null);
          setEndTime(null);
        } else if (startTime < time) {
          setEndTime(time);
        } else {
          setStartTime(time);
          setEndTime(time);
        }

        const formattedDate = formatDate(new Date(selectedDate));
        const start = `${formattedDate}T${startTime}:00.000Z`;
        const end = `${formattedDate}T${endTime}:00.000Z`;

        setStartDateTime(start);
        setEndDateTime(end);

        console.log({
          partition,
          start,
          end,
          isExist,
          startTime,
          endTime,
          selectedDate: formattedDate,
        });

        return;
      }

      setSelectedPartition(partition);
      setStartTime(time);
      setEndTime(time);

      // 시간과 날짜를 포함한 ISO 형식으로 변환
      const formattedDate = formatDate(new Date(selectedDate));
      const start = `${formattedDate}T${startTime}:00.000Z`;
      const end = `${formattedDate}T${endTime}:00.000Z`;

      setStartDateTime(start);
      setEndDateTime(end);

      console.log({
        partition,
        start,
        end,
        isExist,
        startTime,
        endTime,
        selectedDate: formattedDate,
      }); // 시간 형식을 출력
    },
    [
      getSlotSelected,
      setStartTime,
      setEndTime,
      selectedPartition,
      times,
      startTime,
      endTime,
    ],
  );

  // 자신의 예약 생성
  const handleReservation = useCallback(async () => {
    try {
      const res = await doReserve({
        roomId: roomDict[selectedPartition], // todo: roomID 동적으로
        startDateTime: new Date(startDateTime), // todo: date 객체로 넘겨주기
        endDateTime: new Date(endDateTime), //endTimeIndex, // todo: date 객체로 넘겨주기
      });
      console.log('doReserve res:', res);
    } catch (error) {
      console.error('Reservation error:', error);
    }
  }, [doReserve, startDateTime, endDateTime, selectedPartition]);

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
                {slotsArr.map(partition => (
                  <TableRow key={partition}>
                    <TableCell>{partition}</TableCell>
                    {times.map((time, timeIndex) => {
                      const isSelected = getSlotSelected(partition, time);
                      //console.log(timeIndex);
                      const isSelectable = true;
                      // const isReserved =
                      //   reservedSlots[partition]?.includes(timeIndex);
                      return (
                        <TableCell
                          key={timeIndex}
                          onClick={() => handleCellClick(partition, timeIndex)}
                          className={isSelected ? 'selected' : ''}
                          style={{
                            padding: 30,
                            // : isReserved
                            //? '#002D56' // 남색

                            backgroundColor: isSelected
                              ? '#7599BA' // 하늘색
                              : '#F1EEE9', // 베이지 색
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
          <Button onClick={handleReservation} text="예약하기" />
        </div>
      </div>
    </>
  );
};

export default RoomPage;
