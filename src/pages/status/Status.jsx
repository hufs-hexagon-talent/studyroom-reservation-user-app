import React, { useEffect, useMemo, useState } from 'react';
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
import { collection, doc, getDoc,getDocs,query } from 'firebase/firestore';

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

  let monthFormatted = month < 10 ? `0${month}` : month;
  let dayFormatted = day < 10 ? `0${day}` : day;

  const currentDay = `${year}.${monthFormatted}.${dayFormatted}`;

  const times = useMemo(() => createTimeTable(timeTableConfig), []);

  const [slotsArr, setSlotsArr] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);
  
  const [reservedSlots, setReservedSlots] = useState({
    room1: [],
    room2: [],
    room3: [],
    room4: [],
  });

  const fetchData = async () => {
    try {
      const slotsArray=[];
      // 문서 내의 방 번호를 받아와서 [306, 428]을 만들음
      const roomsquery = query(collection(fs, 'Rooms'));
      const roomQuerySnap = await getDocs(roomsquery);
      const roomsIds = roomQuerySnap.docs.map(doc => doc.id);
      console.log(roomsIds); // roomsIds 배열에 Rooms 콜렉션 안에 있는 문서들의 아이디가 저장됩니다.        

      for (let i = 0; i < roomsIds.length; i++) {
        // 예약 정보 가져오기
        console.log(roomsIds[i]);
        const q = query(collection(fs, `Rooms/${roomsIds[i]}/Days/${currentDay}/Reservations`));
        const querySnapshot = await getDocs(q);
        
        // 호실 별 partition 개수 가져올라고 불러옴
        const docRef = doc(fs, `Rooms/${roomsIds[i]}`);
        const docSnap = await getDoc(docRef);

        reservedSlots[roomsIds[i]] = {};
        slotsArray[roomsIds[i]]=[];
        
        querySnapshot.forEach(doc => {
          const { startTime, endTime, partitionName } = doc.data();
          console.log(startTime, endTime, partitionName);

          // partitions 배열의 길이만큼 reservedSlots 객체 초기화
          for (let j = 1; j <= docSnap.data().partitions.length; j++) {
              const roomName = `room${j}`;
              if (!reservedSlots[roomsIds[i]][roomName]) {
                  reservedSlots[roomsIds[i]][roomName] = [];
                  slotsArray[roomsIds[i]].push(roomName);
              }
              console.log(slotsArray);
          }
          setSlotsArr(slotsArray);
          console.log(slotsArr);
          // 시작 시간
          const startIdx = times.findIndex(
              time => time === `${startTime[0]}:${startTime[1]}`,
          );
          // 종료 시간
          const endIdx = times.findIndex(
              time => time === `${endTime[0]}:${endTime[1]}`,
          );

          // 해당 partition의 예약 슬롯에 인덱스 추가
          for (let k = startIdx; k <= endIdx; k++) {
              reservedSlots[roomsIds[i]][partitionName].push(k);
          }
        });
      }
      setReservedSlots(reservedSlots);
      console.log(reservedSlots);
    } catch (error) {
        console.error('Error', error);
    } 
  };

  const partitionsTop = useMemo(() => ['room1', 'room2', 'room3', 'room4'],[],);

  const partitionsBottom = useMemo(() => ['room1', 'room2'], []);

  return (
    <>
      <div className='mt-10'>
        <Typography variant="h5" fontWeight={10} component="div" align="center">
          예약 현황
        </Typography>
      </div>
      <div
        className="bg-gray-100 h-50 inline-block"
        style={{ marginLeft: '10px' }}>
        {year}년 {month}월 {day}일 {hour}시 {minute}분
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <FirstTable
          times={times}
          partitionsTop={partitionsTop}
          reservedSlots={reservedSlots}
          slotsArr={slotsArr}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <FirstTable
          times={times}
          partitionsBottom={partitionsBottom}
          reservedSlots={reservedSlots}
          slotsArr={slotsArr}
        />
      </div>
    </>
  );
};

// FirstTable 컴포넌트를 여기서 정의합니다.
const FirstTable = ({
  times,
  reservedSlots,
  slotsArr
}) => (
  <TableContainer
    sx={{
      height: '100%',
      minWidth: '650px',
      marginLeft: '5%',
      marginRight: '5%',
      marginTop: '20px',
    }}>
      <pre>
        {JSON.stringify({
          times,
          reservedSlots,
          slotsArr
        }, null, 2)}
      </pre>
    <Table>
      <TableHead>
        <TableRow>
          {times.map((time, timeIndex) => (
            <TableCell key={timeIndex}>
              {time}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {slotsArr.map(partition => (
          <TableRow key={partition}>
            {times.map((time, timeIndex) => {
              const isSelectable = true;
              const isReserved = reservedSlots[partition].includes(timeIndex);

              return (
                <TableCell
                  key={timeIndex}
                  sx={{
                    borderLeft: '1px solid #ccc',
                    backgroundColor: isReserved
                      ? '#C1C1C3'
                      : !isSelectable
                      ? '#aaa'
                      : 'transparent',
                    height: 70, // 슬롯 한 칸의 세로 길이를 50px로 설정
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

export default Status;
