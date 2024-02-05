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
import {addDoc, collection} from 'firebase/firestore';

import './Timetable.css';

import {fs} from '../../.././firebase';
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
  start.setHours(startTime.hour, startTime.minute, 0, 0); // 시,분,초,밀리초로 시간 설정

  const end = new Date();
  end.setHours(endTime.hour, endTime.minute, 0, 0);

  const timeTable = [];

  let currentTime = start;
  while (currentTime <= end) { // currentTime이 종료시간을 넘어가지 않을 때 까지
    timeTable.push(format(currentTime, 'HH:mm')); // 배열에 HH:mm 형식으로 추가
    currentTime = addMinutes(currentTime, intervalMinute); //현재 시간을 interval만큼 증가 -> 시작부터 종료까지 timeTable 배열에 시간이 추가됨
  }

  // 마지막 시간이 endTime과 다를 경우 endTime으로 대체
  if (timeTable[timeTable.length - 1] !== format(end, 'HH:mm')) { // 마지막에 추가된 시간이 종료시간과 일치하지 않으면
    timeTable[timeTable.length - 1] = format(end, 'HH:mm'); // 마지막 요소를 종료시간으로 대체
  }

  return timeTable;
}

console.log(createTimeTable(timeTableConfig));

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
  console.log({ selectedPartition, startTimeIndex, endTimeIndex });

  const times = useMemo(() => createTimeTable(timeTableConfig), []);

  const getSlotSelected = useCallback(
    (partition, timeIndex) => {
      // 시작시간과 종료시간이 모두 있는지
      if (!startTimeIndex || !endTimeIndex) return false;
      // 파티션이 일치한지
      if (selectedPartition !== partition) return false;
      // timeIndex가 시작시간과 종료시간 사이에 있는지
      if (!(startTimeIndex <= timeIndex && timeIndex <= endTimeIndex))
        return false;

      return true;
    },
    [startTimeIndex, endTimeIndex, selectedPartition],
  );

  const toggleSlot = useCallback(
    (partition, timeIndex) => {
      const isExist = getSlotSelected(partition, timeIndex); // slot의 선택 여부 확인
      console.log(partition, timeIndex, isExist);

      // 첫 클릭인 경우
      if (!startTimeIndex && !endTimeIndex) {
        // 상태 업데이트
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
        // 슬롯의 개수가 max를 초과하는지 확인
        if (
          Math.abs(startTimeIndex - timeIndex) + 1 >
          timeTableConfig.maxReservationSlots
        ) {
          alert(
            `최대 2시간 까지 선택할 수 있습니다.`,
          );
          return;
        }
        // 동일한 것을 눌렀을 때
        if (startTimeIndex === timeIndex) {
          // 같은거 누르면 없어지게
          setSelectedPartition(null);
          setStartTimeIndex(null);
          setEndTimeIndex(null);
        }
        // 이후 시간을 눌렀을 때
        else if (startTimeIndex < timeIndex) {
          // 클릭한 시간을 종료 시간으로 설정
          setEndTimeIndex(timeIndex);
        }
        // 이전 시간을 눌렀을 때
        else {
          // 클릭한 시간을 시작 시간으로 설정
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

    const clickedTime = times[timeIndex+1];
    const currentTime = format(today, 'HH:mm');
    
    // 클릭한 시간이 현재 시간보다 이전인 경우
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
        onClick={() => 
          {
            navigate('/reservation'),
            handleReservation()
          }
        }
      />
    </>
  );
};

export default Timetable;
