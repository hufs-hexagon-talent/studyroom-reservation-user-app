import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';

import '/Users/yiseo/Documents/studyroom-reservation/src/pages/rooms/room/Roompage.css';

import Button from '../../../components/Button';
import { fs } from '../../../firebase';

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
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { roomName, roomId } = useParams();

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
          alert('최대 2시간 까지 선택할 수 있습니다.');
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
    setIsOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (startTimeIndex !== null && endTimeIndex !== null && userName !== '') {
      const startHour = times[startTimeIndex].split(':')[0];
      const startMinute = times[startTimeIndex].split(':')[1];
      const endHour = times[endTimeIndex].split(':')[0];
      const endMinute = times[endTimeIndex].split(':')[1];

      const docRef = doc(
        fs,
        `Rooms/${roomName}/Days/${roomName}/Reservations/${roomId}`,
      );

      const dataToUpdate = {
        partitionName: selectedPartition,
        startTime: [startHour, startMinute],
        endTime: [endHour, endMinute],
        userName: userName,
      };

      try {
        await updateDoc(docRef, dataToUpdate);
      } catch (error) {
        console.error(error);
      }

      setIsOpen(false);
      await fetchData();
      navigate('/reservations');
    }
  };

  const fetchData = async () => {
    try {
      const q = query(
        collection(fs, `Rooms/${roomName}/Days/${roomName}/Reservations`),
      );
      const querySnapshot = await getDocs(q);

      const reservedSlots = {
        room1: [],
        room2: [],
        room3: [],
        room4: [],
      };

      querySnapshot.forEach(doc => {
        const { userName, startTime, endTime } = doc.data();
        const startIdx = times.findIndex(
          time => time === `${startTime[0]}:${startTime[1]}`,
        );
        const endIdx = times.findIndex(
          time => time === `${endTime[0]}:${endTime[1]}`,
        );
        for (let i = startIdx; i <= endIdx; i++) {
          reservedSlots[userName].push(i);
        }
      });
      setReservedSlots(reservedSlots);
    } catch (error) {
      console.error('Error', error);
    }
  };

  const partitions = useMemo(() => ['room1', 'room2', 'room3', 'room4'], []);

  return (
    <>
      <div style={{ marginBottom: '50px' }}>
        {' '}
        =======
        <br />
        <Typography variant="h5" fontWeight={10} component="div" align="center">
          예약하기
        </Typography>
        <br></br>
        <div
          className="bg-gray-100 h-50 inline-block"
          style={{ marginLeft: '10px' }}>
          {year}년 {month}월 {day}일 {hour}시 {minute}분
        </div>
      </div>
      <TableContainer
        sx={{
          width: '90%',
          minWidth: '650px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '50px',
        }}>
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
                    reservedSlots[partition].includes(timeIndex);

                  return (
                    <TableCell
                      key={timeIndex}
                      sx={{
                        borderLeft: '1px solid #ccc',
                        backgroundColor: isSelected
                          ? '#4B89DC'
                          : isReserved
                            ? '#C1C1C3'
                            : !isSelectable
                              ? '#aaa'
                              : 'transparent',
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
            label="userName"
            variant="standard"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            fullWidth
            autoFocus
          />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <MuiButton
              variant="contained"
              onClick={() => setIsOpen(false)}
              style={{ marginLeft: '10px' }}>
              취소
            </MuiButton>
            <MuiButton
              variant="contained"
              onClick={handleConfirmReservation}
              disabled={!userName}>
              확인
            </MuiButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RoomPage;
