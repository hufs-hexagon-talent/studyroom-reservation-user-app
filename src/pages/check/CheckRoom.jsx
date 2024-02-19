import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';

import { fs } from '../../firebase';

const Check = () => {
  const [rooms, setRooms] = useState([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  let monthFormatted = month < 10 ? `0${month}` : month;
  let dayFormatted = day < 10 ? `0${day}` : day;

  const currentDay = `${year}.${monthFormatted}.${dayFormatted}`;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const roomsData = [];
      const roomIds = ['306', '428'];
      for (let i = 0; i < roomIds.length; i++) {
        const q = query(
          collection(fs, `Rooms/${roomIds[i]}/Days/${currentDay}/Reservations`),
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
      doc(fs, `Rooms/${roomName}/Days/${currentDay}/Reservations`, id),
    );
    setRooms(prevRooms => prevRooms.filter(room => room.id !== id));
  }

  return (
      <div>
        <h1 className="ml-10 mt-10 text-5xl text-left font-bold">
          예약 목록
        </h1>
        <div className='mt-10 text-center flex flex-col justify-left h-screen'>
          {rooms.map((room) => (
            <div key={room.id} className="flex justify-center items-center mb-4">
              <div className="bg-gray-200 w-full py-6 rounded-lg text-left ml-10 mr-10">
                <p className='ml-10 text-xl'>
                  이름: {room.userName}<br/>
                  호실: {room.roomName}호 {room.partitionName}<br/>
                  시간: {room.startTimeFormatted} - {room.endTimeFormatted}
                </p>
                <button className='float-right bg-gray-300 ml-auto mr-10 text-xl rounded-lg p-2'
                  onClick={() => deleteData(room.id, room.roomName)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
};

export default Check;