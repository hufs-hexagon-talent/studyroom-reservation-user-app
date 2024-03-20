'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { HiInformationCircle } from 'react-icons/hi';
import { useParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { addMinutes, format, getDay, subDays } from 'date-fns';
import ko from 'date-fns/locale/ko';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from 'firebase/firestore';
import { Alert } from 'flowbite-react';

import 'react-datepicker/dist/react-datepicker.css';
import './RoomPage.css';

import Button from '../../../components/button/Button';
import { fs } from '../../../firebase';

//시간 데이터
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
function createTimeTable(config) {
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
}

const RoomPage = () => {
  // 현재 시간
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  let monthFormatted = month < 10 ? `0${month}` : month;
  let dayFormatted = day < 10 ? `0${day}` : day;

  const currentDay = `${year}.${monthFormatted}.${dayFormatted}`;

  const [selectedPartition, setSelectedPartition] = useState(null);
  const [startTimeIndex, setStartTimeIndex] = useState(null);
  const [endTimeIndex, setEndTimeIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { roomName } = useParams();
  const times = useMemo(() => createTimeTable(timeTableConfig), []);

  const [reservedSlots, setReservedSlots] = useState({
    room1: [],
    room2: [],
    room3: roomName === '306' ? [] : [],
    room4: roomName === '306' ? [] : [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  // 슬롯이 선택되었는지 확인하는 함수
  const getSlotSelected = useCallback(
    (partition, timeIndex) => {
      if (!startTimeIndex || !endTimeIndex) return false;
      if (selectedPartition !== partition) return false;
      if (!(startTimeIndex <= timeIndex && timeIndex <= endTimeIndex))
        return false;

      return true;
    },
    [startTimeIndex, endTimeIndex, selectedPartition],
  );

  // 슬롯의 상태 토글하는 함수
  const toggleSlot = useCallback(
    (partition, timeIndex) => {
      const isExist = getSlotSelected(partition, timeIndex);
      console.log(partition, timeIndex, isExist);

      if (!startTimeIndex && !endTimeIndex) {
        setSelectedPartition(partition);
        setStartTimeIndex(timeIndex);
        setEndTimeIndex(timeIndex);
        return;
      }

      if (selectedPartition !== partition) {
        setSelectedPartition(partition);
        setStartTimeIndex(timeIndex);
        setEndTimeIndex(timeIndex);
        return;
      }

      if (startTimeIndex === endTimeIndex) {
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
        if (startTimeIndex === timeIndex) {
          setSelectedPartition(null);
          setStartTimeIndex(null);
          setEndTimeIndex(null);
        } else if (startTimeIndex < timeIndex) {
          setEndTimeIndex(timeIndex);
        } else {
          setStartTimeIndex(timeIndex);
        }
        return;
      }

      setSelectedPartition(partition);
      setStartTimeIndex(timeIndex);
      setEndTimeIndex(timeIndex);
    },
    [getSlotSelected, setStartTimeIndex, setEndTimeIndex, selectedPartition],
  );

  // 최대 예약 시간에 부합하는지 계산하는 함수
  const handleCellClick = (partition, timeIndex) => {
    const clickedTime = times[timeIndex + 1];
    const currentTime = format(today, 'HH:mm');

    if (clickedTime < currentTime) {
      alert('과거의 시간에 예약을 할 수는 없습니다.');
      return;
    }

    toggleSlot(partition, timeIndex);
  };

  const handleReservation = async () => {
    setIsOpen(true);
  };

  // 데이터를 수정하는 함수
  const handleConfirmReservation = async () => {
    const address = `Rooms/${roomName}/Days/${currentDay}/Reservations`;

    let docRef;
    if (startTimeIndex !== null && endTimeIndex !== null) {
      const startHour = times[startTimeIndex].split(':')[0];
      const startMinute = times[startTimeIndex].split(':')[1];
      const endHour = times[endTimeIndex].split(':')[0];
      const endMinute = times[endTimeIndex].split(':')[1];

      docRef = await addDoc(collection(fs, address), {
        partitionName: selectedPartition,
        startTime: [startHour, startMinute],
        endTime: [endHour, endMinute],
        roomName: roomName,
      });

      setIsOpen(false);
      await fetchData();

      const reservedId = docRef.id;
      const ref = doc(
        fs,
        `Rooms/${roomName}/Days/${currentDay}/Reservations/${reservedId}`,
      );
      await updateDoc(ref, {
        roomId: reservedId,
      });
    }
  };

  // 새로운 함수를 생성해 중복을 제거
  const pushReservedTime = (docSnap, reservedSlots) => {
    docSnap.forEach(doc => {
      const { startTime, endTime, partitionName } = doc.data();
      // 시작 시간
      const startIdx = times.findIndex(
        time => time === `${startTime[0]}:${startTime[1]}`,
      );
      // 종료 시간
      const endIdx = times.findIndex(
        time => time === `${endTime[0]}:${endTime[1]}`,
      );

      for (let i = startIdx; i <= endIdx; i++) {
        reservedSlots[partitionName].push(i);
      }

      setReservedSlots(reservedSlots);
    });
  };
  const [slotsArr, setSlotsArr] = useState([]);

  const fetchData = async () => {
    try {
      console.log(roomName);
      const docRef = doc(fs, `Rooms/${roomName}`);
      const docSnap = await getDoc(docRef);
      const len = docSnap.data().partitions.length;

      const q = query(
        collection(fs, `Rooms/${roomName}/Days/${currentDay}/Reservations`),
      );
      const querySnap = await getDocs(q);

      const reservedSlots = {};
      const slotsArray = [];
      for (let i = 1; i <= len; i++) {
        reservedSlots[`room${i}`] = [];
        slotsArray.push(`room${i}`);
      }
      setSlotsArr(slotsArray);
      pushReservedTime(querySnap, reservedSlots);
    } catch (error) {
      console.error('Error', error);
    }
  };

  // date-picker 부분
  const [startDate, setStartDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const isWeekday = date => {
    const day = getDay(date);
    return day !== 0 && day !== 6;
  };
  registerLocale('ko', ko);

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

          <div className="flex justify-center items-center w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 mx-auto">
            <DatePicker
              id="datepicker"
              selected={startDate}
              locale={ko}
              minDate={subDays(new Date(), 0)}
              maxDate={subDays(new Date(), -7)}
              onChange={date => setStartDate(date)}
              filterDate={isWeekday}
              dateFormat="yyyy년 MM월 dd일"
              showIcon
            />
          </div>
        </div>

        <div id="squares" className="flex p-4 ">
          <div
            className="w-6 h-6 mt-10 "
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
                      const isSelected = getSlotSelected(partition, timeIndex);
                      const isSelectable = true;
                      const isReserved =
                        reservedSlots[partition].includes(timeIndex);

                      return (
                        <TableCell
                          key={timeIndex}
                          sx={{
                            borderLeft: '2px solid #e5ded4',
                            borderBottom: '2px solid #e5ded4',
                            borderTop: '2px solid #e5ded4',
                            backgroundColor: isSelected
                              ? '#7599BA' // 밝은 남색으로 칠해짐
                              : isReserved
                                ? '#002D56' // 남색으로 칠해짐
                                : !isSelectable
                                  ? '#aaa'
                                  : '#F1EEE9',
                            cursor: isReserved
                              ? 'default'
                              : isSelectable
                                ? 'pointer'
                                : 'default',
                          }}
                          onClick={() =>
                            isSelectable &&
                            !isReserved &&
                            handleCellClick(partition, timeIndex)
                          } // 예약된 슬롯을 클릭할 수 없도록 설정
                        />
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <div className="mt-10 pb-5 flex justify-end">
          <Button
            text="예약하기"
            onClick={() => {
              handleReservation();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default RoomPage;
