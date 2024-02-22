import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Box } from '@mui/material';
import { addMinutes, format } from 'date-fns';
import { collection,getDocs, query } from 'firebase/firestore';

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

const FirstTable = ({
  times,
  partitionsTop,
  getSlotSelected,
  reservedSlots,
}) => (
  <TableContainer
    sx={{
      width: '100%',
      height: '100%',
      minWidth: '650px',
      marginLeft: '1%',
      marginRight: '20px',
      marginTop: '30px',
    }}>
    <Table>
    <TableHead className="fixedPartitions" sx={{ borderBottom: 'none' }}>
      <TableRow>
        {times.map((time, timeIndex) => (
          <TableCell
            key={timeIndex}
            align="center"
            className="fixedPartitions relative"
            sx={{ borderLeft: 'none' }}
          >
            <div style={{ width: 20, height: 30 }}>
              <span className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">{time}</span>
            </div>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>

      <TableBody>
        {partitionsTop.map((partition) => (
          <TableRow key={partition} sx={{ height: 30 }}> {/* TableRow에 높이 설정 */}
            {times.map((time, timeIndex) => {
              const isSelected = getSlotSelected(partition, timeIndex);
              const isSelectable = true;
              const isReserved = reservedSlots[partition].includes(timeIndex);

              return (
                <TableCell
                  key={timeIndex}
                  className="border-l border-gray-300" // tailwind border 클래스 적용
                  sx={{ 
                    backgroundColor: isSelected
                      ? '#4B89DC'
                      : isReserved
                        ? '#C1C1C3'
                        : !isSelectable
                          ? '#aaa'
                          : 'transparent',
                  }}
                >
                  <div style={{ 
                    height: 30, // 슬롯 한 칸의 세로 길이를 50px로 설정
                    width: 20, // 슬롯 한 칸의 가로 길이를 200px로 설정
                  }} />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>


);

const SecondTable = ({
  times,
  partitionsBottom,
  getSlotSelected,
  reservedSlots,
}) => (
  <TableContainer
    sx={{
      width: '90%',
      height: '100%',
      minWidth: '650px',
      marginLeft: '1%',
      marginRight: 'auto',
      marginTop: '30px',
      marginBottom:'30px'
    }}>
    <Table>
      <TableHead className="fixedPartitions" sx={{ borderBottom: 'none' }}>
        <TableRow>
          {times.map((time, timeIndex) => (
            <TableCell
              key={timeIndex}
              align="center"
              className="fixedPartitions relative"
              sx={{ borderLeft: 'none' }}
            >
              <div style={{ width: 20, height: 30 }}>
                <span className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">{time}</span>
              </div>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {partitionsBottom.map(partition => (
          <TableRow key={partition}>
            {times.map((time, timeIndex) => {
              const isSelected = getSlotSelected(partition, timeIndex);
              const isSelectable = true;
              const isReserved = reservedSlots[partition].includes(timeIndex);

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
                    height: 70,
                  }}
                />
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const Status = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  let monthFormatted = month < 10 ? `0${month}` : month;
  let dayFormatted = day < 10 ? `0${day}` : day;

  const currentDay = `${year}.${monthFormatted}.${dayFormatted}`;

  const [selectedPartition] = useState(null);
  const [startTimeIndex] = useState(null);
  const [endTimeIndex] = useState(null);

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

  const fetchData = async () => {
    try {
      const roomNumber = [306,428];
      for(let i=0; i<roomNumber.length; i++){
        const q = query(collection(fs,`Rooms/${roomNumber[i]}/Days/${currentDay}/Reservations`));
        const querySnapshot=await getDocs(q);

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
      }
      const reservedSlots = {
        room1_306: [],
        room2_306: [],
        room3_306: [],
        room4_306: [],
        room1_428: [],
        room2_428: [],
      }; 
      
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
      <Typography style={{marginTop:'20px'}}variant="h5" fontWeight={10} component="div" align="center">
        예약 현황
      </Typography>
      <div
        className="bg-gray-100 h-50 inline-block"
        style={{ marginLeft: '10px' }}>
        {year}년 {month}월 {day}일
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Box marginRight="16px">
          {' '}
          {/* 오른쪽에 간격 추가 */}
          <Box marginLeft={'30px'} marginTop={'40px'}>
            <div>306호</div>
            <br></br>
            <br></br>
            <div>room1</div>
            <br></br>
            <br></br>
            <div>room2</div>
            <br></br>
            <br></br>
            <div>room3</div>
            <br></br>
            <br></br>
            <div>room4</div>
          </Box>
        </Box>
        <FirstTable
          times={times}
          partitionsTop={partitionsTop}
          getSlotSelected={getSlotSelected}
          reservedSlots={reservedSlots}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Box marginRight="16px">
          {' '}
          {/* 오른쪽에 간격 추가 */}
          <Box marginLeft={'30px'} marginTop={'40px'}>
            <div>428호</div>
            <br></br>
            <br></br>
            <div>room1</div>
            <br></br>
            <br></br>
            <div>room2</div>
          </Box>
        </Box>
        <SecondTable
          times={times}
          partitionsBottom={partitionsBottom}
          getSlotSelected={getSlotSelected}
          reservedSlots={reservedSlots}
          sx={{ marginTop: '16px' }}
        />
      </div>
    </>
  );
};

export default Status;