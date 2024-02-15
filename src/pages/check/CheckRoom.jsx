import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';

import { fs } from '../../firebase';

const Check = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const roomsData = [];
      const roomIds = ['306', '428'];
      for (let i = 0; i < roomIds.length; i++) {
        const q = query(
          collection(fs, `Rooms/${roomIds[i]}/Days/${roomIds[i]}/Reservations`),
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
          const reservationData = doc.data();
          const startTime = reservationData.startTime;
          const endTime = reservationData.endTime;
          const partitionName = reservationData.partitionName;

          const startTimeFormatted = format(
            new Date().setHours(startTime[0], startTime[1]),
            'HH:mm',
          );
          const endTimeFormatted = format(
            new Date().setHours(endTime[0], endTime[1]),
            'HH:mm',
          );

          const id = doc.id;
          roomsData.push({
            id,
            ...reservationData,
            startTimeFormatted,
            endTimeFormatted,
            partitionName
          });
          console.log(roomsData);
        });
      }

      // 시작 시간이 빠른 순으로 정렬
      roomsData.sort((a, b) => {
        const startTimeA = new Date(`2000-01-01T${a.startTimeFormatted}`);
        const startTimeB = new Date(`2000-01-01T${b.startTimeFormatted}`);
        return startTimeA - startTimeB;
      });

      setRooms(roomsData);
    } catch (error) {
      console.error('Error', error);
    }
  }

  async function deleteData(id, roomName) {
    console.log(id);
    await deleteDoc(
      doc(fs, `Rooms/${roomName}/Days/${roomName}/Reservations`, id),
    );
    setRooms(prevRooms => prevRooms.filter(room => room.id !== id));
  }

  return (
    <div>
      <h1>예약 목록</h1>
      <br />
      <table>
        <thead>
          <tr>
            <th>이름 </th>
            <th>호실</th>
            <th>방 번호</th>
            <th>시작 시간</th>
            <th>종료 시간</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id}>
              <td
                style={{
                  padding: '15px',
                  backgroundColor: room.isReserved ? '#ccc' : 'transparent',
                }}>
                {room.userName}
              </td>
              <td
                style={{
                  padding: '15px',
                  backgroundColor: room.isReserved ? '#ccc' : 'transparent',
                }}>
                {room.roomName}
              </td>
              <td
                style={{
                  padding: '15px',
                  backgroundColor: room.isReserved ? '#ccc' : 'transparent',
                }}>
                {room.partitionName}
              </td>
              <td
                style={{
                  padding: '15px',
                  backgroundColor: room.isReserved ? '#ccc' : 'transparent',
                }}>
                {room.startTimeFormatted}
              </td>
              <td
                style={{
                  padding: '15px',
                  backgroundColor: room.isReserved ? '#ccc' : 'transparent',
                }}>
                {room.endTimeFormatted}
              </td>
              <br />
              <button
                style={{ marginLeft: '15px', marginBottom: '23px' }}
                onClick={() => deleteData(room.id, room.roomName)}>
                삭제
              </button>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Check;
