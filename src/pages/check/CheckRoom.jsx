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
      const q = query(collection(fs, 'Rooms/306/Days/306/Reservation'));
      const querySnapshot = await getDocs(q);

      const roomsData = [];

      querySnapshot.forEach((doc) => {
        const roomData = doc.data();
        roomData.startTimeFormatted = format(new Date().setHours(roomData.startTime[0], roomData.startTime[1]), 'HH:mm');
        roomData.endTimeFormatted = format(new Date().setHours(roomData.endTime[0], roomData.endTime[1]), 'HH:mm');
        roomsData.push({ id: doc.id, ...roomData });
      });

      setRooms(roomsData);
      console.log(roomsData);
    } catch (error) {
      console.error('Error', error);
    }
  }

  async function deleteData(id){
    await deleteDoc(doc(fs,  'Rooms/306/Days/306/Reservation', id)); // 삭제할 문서의 경로
    setRooms(prevRooms => prevRooms.filter(room => room.id !== id));
  }

  return (
    <div>
      <h1>예약 목록</h1>
      <br/>
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>호실</th>
            <th>방 번호</th>
            <th>시작 시간</th>
            <th>종료 시간</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td style={{ padding: '15px' }}>{room.userName}</td>
              <td style={{padding:'15px'}}>{room.roomName}</td>
              <td style={{ padding: '15px' }}>{room.partitionName}</td>
              <td style={{ padding: '15px' }}>{room.startTimeFormatted}</td>
              <td style={{ padding: '15px' }}>{room.endTimeFormatted}</td>
              <br/>
              <button onClick={() => deleteData(room.id)}>
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
