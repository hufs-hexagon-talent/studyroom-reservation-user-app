import React, { useCallback, useMemo, useState } from 'react';
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

import './Timetable.css'

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

  // 마지막 시간이 endTime과 다를 경우 endTime으로 대체
  if (timeTable[timeTable.length - 1] !== format(end, 'HH:mm')) {
    timeTable[timeTable.length - 1] = format(end, 'HH:mm');
  }

  return timeTable;
}

console.log(createTimeTable(timeTableConfig));

const Timetable = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const navigate = useNavigate();
  // const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedPartition, setSelectedPartition] = useState(null);
  const [startTimeIndex, setStartTimeIndex] = useState(null);
  const [endTimeIndex, setEndTimeIndex] = useState(null);
  console.log({ selectedPartition, startTimeIndex, endTimeIndex });

  const times = useMemo(() => createTimeTable(timeTableConfig), []);

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

      // 첫 클릭인 경우
      if (!startTimeIndex && !endTimeIndex) {
        setSelectedPartition(partition);
        setStartTimeIndex(timeIndex);
        setEndTimeIndex(timeIndex);
        return;
      }

      // 다른 파티션을 누른 경우
      if (selectedPartition !== partition) {
        console.log('!!!', selectedPartition, partition);
        setSelectedPartition(partition);
        setStartTimeIndex(timeIndex);
        setEndTimeIndex(timeIndex);
        return;
      }

      // 하나만 선택되어있는 경우
      if (startTimeIndex === endTimeIndex) {
        if (
          Math.abs(startTimeIndex - timeIndex) + 1 >
          timeTableConfig.maxReservationSlots
        ) {
          alert(
            `최대 ${timeTableConfig.maxReservationSlots}자리까지 선택할 수 있습니다.`,
          );
          return;
        }
        // 동일한 것을 눌렀을 때
        if (startTimeIndex === timeIndex) {
          setSelectedPartition(null);
          setStartTimeIndex(null);
          setEndTimeIndex(null);
        }
        // 이후 시간을 눌렀을 때
        else if (startTimeIndex < timeIndex) {
          setEndTimeIndex(timeIndex);
        }
        // 이전 시간을 눌렀을 때
        else {
          setStartTimeIndex(timeIndex);
        }
        return;
      }

      // 둘다 선택되어있는 경우
      setSelectedPartition(partition);
      setStartTimeIndex(timeIndex);
      setEndTimeIndex(timeIndex);
    },
    [getSlotSelected, setStartTimeIndex, setEndTimeIndex, selectedPartition],
  );

  // 셀을 클릭할 때 해당 셀의 선택 여부를 업데이트하는 함수 추가
  const handleCellClick = (partition, timeIndex) => {
    toggleSlot(partition, timeIndex);
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
          {year}년 {month}월 {day}일
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={100} />
              {/* 30분 간격으로 시간을 표시 */}
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
                {/* 30분 간격으로 셀을 생성 */}
                {times.map((time, timeIndex) => {
                  const isSelected = getSlotSelected(partition, timeIndex);
                  const isSelectable = true;

                  return (
                    <TableCell
                      key={timeIndex} // 방이랑 시간 조합해서 키 값 생성
                      sx={{
                        borderLeft: '1px solid #ccc',
                        backgroundColor: isSelected
                          ? '#4B89DC'
                          : !isSelectable
                            ? '#aaa'
                            : 'transparent', // 선택된 셀에 따라 색상 변경
                        cursor: isSelectable ? 'pointer' : 'default', // 클릭 가능한 커서 스타일 추가
                      }}
                      onClick={() =>
                        isSelectable && handleCellClick(partition, timeIndex)
                      } // 클릭 이벤트 추가
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
          navigate('/reservation');
        }}
      />
    </>
  );
};

export default Timetable;
