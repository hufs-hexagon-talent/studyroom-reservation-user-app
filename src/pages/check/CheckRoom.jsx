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

<<<<<<< HEAD
      querySnapshot.forEach((doc) => {
        const roomData = doc.data();
        roomData.startTimeFormatted = format(new Date().setHours(roomData.startTime[0], roomData.startTime[1]), 'HH:mm');
        roomData.endTimeFormatted = format(new Date().setHours(roomData.endTime[0], roomData.endTime[1]), 'HH:mm');
        roomsData.push({ id: doc.id, ...roomData });
=======
      const roomIds = ['306', '428'];
      for (let i = 0; i < roomIds.length; i++) {
        const q = query(collection(fs, `Rooms/${roomIds[i]}/Days/${roomIds[i]}/Reservations`));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const reservationData = doc.data();
          const roomName = reservationData.name;
          const startTime = reservationData.startTime;
          const endTime = reservationData.endTime;

          const startTimeFormatted = format(new Date().setHours(startTime[0], startTime[1]), 'HH:mm');
          const endTimeFormatted = format(new Date().setHours(endTime[0], endTime[1]), 'HH:mm');

          const id = doc.id;
          roomsData.push({ id, ...reservationData, roomName, startTimeFormatted, endTimeFormatted, roomId: roomIds[i] });
        });
      }
      
      // 시작 시간이 빠른 순으로 정렬 
      roomsData.sort((a, b) => {
        const startTimeA = new Date(`2000-01-01T${a.startTimeFormatted}`);
        const startTimeB = new Date(`2000-01-01T${b.startTimeFormatted}`);
        return startTimeA - startTimeB;
>>>>>>> c5c157ddd43a8058ee0788ab720ba5d205d654d5
      });

      setRooms(roomsData);
      console.log(roomsData);
    } catch (error) {
      console.error('Error', error);
    }
  }

<<<<<<< HEAD
  async function deleteData(id){
    await deleteDoc(doc(fs,  'Rooms/306/Days/306/Reservation', id)); // 삭제할 문서의 경로
=======
  async function deleteData(id, roomName) {
    await deleteDoc(doc(fs, `Rooms/${roomName}/Days/${roomName}/Reservations`, id));
>>>>>>> c5c157ddd43a8058ee0788ab720ba5d205d654d5
    setRooms(prevRooms => prevRooms.filter(room => room.id !== id));
  }

  return (
    <div>
      <h1>예약 목록</h1>
<<<<<<< HEAD
      <br/>
=======
      <br />
>>>>>>> c5c157ddd43a8058ee0788ab720ba5d205d654d5
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
<<<<<<< HEAD
              <br/>
              <button onClick={() => deleteData(room.id)}>
=======
              <br />
              <button
                style={{ marginLeft: '15px', marginBottom: '23px' }}
                onClick={() => deleteData(room.id, room.roomName)}>
>>>>>>> c5c157ddd43a8058ee0788ab720ba5d205d654d5
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
