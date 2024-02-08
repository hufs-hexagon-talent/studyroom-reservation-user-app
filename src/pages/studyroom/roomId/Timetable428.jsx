import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button as MuiButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { addMinutes, format } from 'date-fns';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';

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
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const times = useMemo(() => createTimeTable(timeTableConfig), []);

  const [reservedSlots, setReservedSlots] = useState({
    room1: [],
    room2: [],
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
          alert(`최대 2시간 까지 선택할 수 있습니다.`);
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
    const clickedTime = times[timeIndex + 1];
    const currentTime = format(today, 'HH:mm');

    // 클릭한 시간이 현재 시간보다 이전인 경우
    if (clickedTime < currentTime) {
      alert('과거의 시간에 예약을 할 수는 없습니다.');
      return;
    }

    toggleSlot(partition, timeIndex);
  };

  const handleReservation = async () => {
    setIsOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (startTimeIndex !== null && endTimeIndex !== null && name !== '') {
      const startHour = times[startTimeIndex].split(':')[0];
      const startMinute = times[startTimeIndex].split(':')[1];
      const endHour = times[endTimeIndex].split(':')[0];
      const endMinute = times[endTimeIndex].split(':')[1];

      await addDoc(collection(fs, 'roomsEx'), {
        name: selectedPartition,
        startTime: [startHour, startMinute],
        endTime: [endHour, endMinute],
        userName: name,
      });

      setIsOpen(false);
      await fetchData();
      navigate('/reservation');
    }
  };

  const fetchData = async () => {
    try {
      const q = query(collection(fs, 'roomsEx'));
      const querySnapshot = await getDocs(q);
      const reservedSlots = {
        room1: [],
        room2: [],
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

  const partitions = useMemo(() => ['room1', 'room2'], []);

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
                  const isReserved =
                    reservedSlots[partition].includes(timeIndex); // 각 방의 예약 슬롯 상태를 확인

                  return (
                    <TableCell
                      key={timeIndex}
                      sx={{
                        borderLeft: '1px solid #ccc',
                        backgroundColor: isSelected
                          ? '#4B89DC' // 파란색
                          : isReserved
                            ? '#C1C1C3'
                            : !isSelectable
                              ? '#aaa'
                              : 'transparent',
                        cursor: isReserved
                          ? 'default'
                          : isSelectable
                            ? 'pointer'
                            : 'default', // 예약된 슬롯의 경우 클릭 무시
                      }}
                      onClick={
                        () =>
                          isSelectable &&
                          !isReserved &&
                          handleCellClick(partition, timeIndex) // 예약된 슬롯은 클릭 무시
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
          handleReservation();
        }}
      />
      <br />

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            width: '300px',
            border: 'none',
            borderRadius: 20,
          }}>
          <Typography variant="h6" component="h2" align="center" gutterBottom>
            이름을 입력 해주세요
          </Typography>
          <TextField
            label="Name"
            variant="standard"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            autoFocus
          />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <MuiButton
              variant="contained"
              onClick={handleConfirmReservation}
              disabled={!name}>
              확인
            </MuiButton>
            <MuiButton
              variant="contained"
              onClick={() => setIsOpen(false)}
              style={{ marginLeft: '10px' }}>
              취소
            </MuiButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Timetable;
