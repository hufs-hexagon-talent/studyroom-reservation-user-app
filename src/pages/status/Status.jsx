import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
import { collection, getDocs, query } from 'firebase/firestore';

import { fs } from '../../firebase';

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

const Status = () => {
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
    room1_306: [],
    room2_306: [],
    room3_306: [],
    room4_306: [],
    room1_428: [],
    room2_428: [],
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

  const fetchData = async () => {
    try {
      const q = query(collection(fs, 'roomsEx'));
      const querySnapshot = await getDocs(q);
      const reservedSlots = {
        room1_306: [],
        room2_306: [],
        room3_306: [],
        room4_306: [],
        room1_428: [],
        room2_428: [],
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

  const partitionsTop = useMemo(
    () => ['room1_306', 'room2_306', 'room3_306', 'room4_306'],
    [],
  );

  const partitionsBottom = useMemo(() => ['room1_428', 'room2_428'], []);

  return (
    <>
      <Typography variant="h5" fontWeight={10} component="div" align="center">
        예약 현황 보기
      </Typography>
      <div
        className="bg-gray-100 h-50 inline-block"
        style={{ marginLeft: '10px' }}>
        {year}년 {month}월 {day}일 {hour}시 {minute}분
      </div>

      <TableContainer
        sx={{
          width: '90%',
          minWidth: '650px',
          marginLeft: '20%',
          marginRight: 'auto',
          marginTop: '20px',
        }}>
        <Table>
          <TableHead className="fixedPartitions">
            <TableRow>
              <TableCell align="center" width={100}>
                <Typography style={{ position: 'fixed', left: '100px' }}>
                  방 번호
                </Typography>
              </TableCell>
              {/* 30분 간격으로 시간을 표시 */}
              {times.map((time, timeIndex) => (
                <TableCell
                  key={timeIndex}
                  align="center"
                  width={200}
                  className="fixedPartitions">
                  {time}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {partitionsTop.map(partition => (
              <TableRow key={partition}>
                <TableCell>
                  <Typography style={{ position: 'fixed', left: '100px' }}>
                    {partition}
                  </Typography>
                </TableCell>
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
                          ? '#4B89DC' //파란색
                          : isReserved
                            ? '#C1C1C3'
                            : !isSelectable
                              ? '#aaa'
                              : 'transparent',
                      }}
                      // onClick={() =>
                      //   isSelectable && handleCellClick(partition, timeIndex)
                      // }
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer
        sx={{
          width: '90%',
          minWidth: '650px',
          marginLeft: '20%',
          marginRight: 'auto',
          marginTop: '20px',
        }}>
        <Table>
          <TableHead className="fixedPartitions">
            <TableRow>
              <TableCell align="center" width={100}>
                <Typography style={{ position: 'fixed', left: '100px' }}>
                  방 번호
                </Typography>
              </TableCell>
              {/* 30분 간격으로 시간을 표시 */}
              {times.map((time, timeIndex) => (
                <TableCell
                  key={timeIndex}
                  align="center"
                  width={200}
                  className="fixedPartitions">
                  {time}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {partitionsBottom.map(partition => (
              <TableRow key={partition}>
                <TableCell>
                  <Typography style={{ position: 'fixed', left: '100px' }}>
                    {partition}
                  </Typography>
                </TableCell>
                {/* 30분 간격으로 셀을 생성 */}
                {times.map((time, timeIndex) => {
                  const isSelected = getSlotSelected(partition, timeIndex);
                  const isSelectable = true;
                  const isReserved =
                    reservedSlots[partition].includes(timeIndex); // 각 방의 예약 슬롯 상태를 확인할거임

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
                      }}
                      // onClick={() =>
                      //   isSelectable && handleCellClick(partition, timeIndex)
                      // }
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          <TextField
            label="Name"
            variant="standard"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            autoFocus
          />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {/* <MuiButton
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
            </MuiButton> */}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Status;
