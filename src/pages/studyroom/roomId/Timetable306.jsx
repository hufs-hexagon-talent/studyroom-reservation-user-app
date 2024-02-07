import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { addMinutes, format } from 'date-fns';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';

import './Timetable.css';

import { fs } from '../../.././firebase';
import Button from '../../../components/Button';

const timeTableConfig = {
  startTime: {
    hour: 8,
    minute: 30,
  },
  endTime: {
    hour: 22,
    minute: 40,
  },
  intervalMinute: 30,
  maxReservationSlots: 4,
};

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

const Timetable = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const hour = today.getHours();
  const minute = today.getMinutes();

  const navigate = useNavigate();
  const [selectedPartition, setSelectedPartition] = useState(null);
  const [startTimeIndex, setStartTimeIndex] = useState(null);
  const [endTimeIndex, setEndTimeIndex] = useState(null);

  const times = useMemo(() => createTimeTable(timeTableConfig), []);

  const [reservedSlots, setReservedSlots] = useState({
    room1: [],
    room2: [],
    room3: [],
    room4: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

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
          alert(`최대 2시간 까지 선택할 수 있습니다.`);
          return;
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
    if (startTimeIndex !== null && endTimeIndex !== null) {
      const startHour = times[startTimeIndex].split(':')[0];
      const startMinute = times[startTimeIndex].split(':')[1];
      const endHour = times[endTimeIndex].split(':')[0];
      const endMinute = times[endTimeIndex].split(':')[1];

      await addDoc(collection(fs, 'roomsEx'), {
        name: selectedPartition,
        startTime: [startHour, startMinute],
        endTime: [endHour, endMinute],
      });

      await fetchData();
    }
  };
  const fetchData = async () => {
    try {
      const q = query(collection(fs, 'roomsEx'));
      const querySnapshot = await getDocs(q);
      const reservedSlots = {
        room1: [],
        room2: [],
        room3: [],
        room4: [],
      }; // 각 방마다 독립적인 예약 슬롯 배열 초기화
      querySnapshot.forEach(doc => {
        const { name, startTime, endTime } = doc.data();
        const startIdx = times.findIndex(
          time => time === `${startTime[0]}:${startTime[1]}`,
        );
        const endIdx = times.findIndex(
          time => time === `${endTime[0]}:${endTime[1]}`,
        );
        for (let i = startIdx; i <= endIdx; i++) {
          reservedSlots[name].push(i); // 해당 방의 예약 슬롯 배열에 추가
        }
      });
      console.log(reservedSlots);
      setReservedSlots(reservedSlots);
    } catch (error) {
      console.error('Error', error);
    }
  };

  const partitions = useMemo(() => ['room1', 'room2', 'room3', 'room4'], []);

  return (
    <>
      <TableContainer
        sx={{
          width: '90%',
          minWidth: '650px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '50px',
        }}>
        <Typography variant="h5" fontWeight={10} component="div" align="center">
          예약하기
        </Typography>
        <div>
          {year}년 {month}월 {day}일 {hour}시 {minute}분
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={100} />
              {times.map((time, timeIndex) => (
                <TableCell key={timeIndex} align="center" width={200}>
                  {time}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {partitions.map(partition => (
              <TableRow key={partition}>
                <TableCell>{partition}</TableCell>
                {times.map((time, timeIndex) => {
                  const isSelected = getSlotSelected(partition, timeIndex);
                  const isSelectable = true;
                  const isReserved =
                    reservedSlots[partition].includes(timeIndex); // 각 방의 예약 슬롯 상태를 확인

                  return (
                    <TableCell
                      key={timeIndex}
                      sx={{
                        borderLeft: '1px solid #ccc',
                        backgroundColor: isSelected
                          ? '#4B89DC' //파란색
                          : isReserved
                            ? '#C1C1C3'
                            : !isSelectable
                              ? '#aaa'
                              : 'transparent',
                        cursor: isSelectable ? 'pointer' : 'default',
                      }}
                      onClick={() =>
                        isSelectable && handleCellClick(partition, timeIndex)
                      }
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <br />
      <Button
        text="예약하기"
        onClick={() => {
          navigate('/reservation'), handleReservation();
        }}
      />
      <br />
    </>
  );
};

export default Timetable;
