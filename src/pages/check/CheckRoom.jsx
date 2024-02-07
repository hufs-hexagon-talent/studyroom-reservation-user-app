import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { collection, deleteDoc,doc, getDocs, query } from 'firebase/firestore';

import { fs } from '../../firebase';

const Check = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const q = query(collection(fs, 'roomsEx'));
      const querySnapshot = await getDocs(q);

      const roomsData = [];

      querySnapshot.forEach((doc) => {
        const roomData = doc.data();
        roomData.startTimeFormatted = format(new Date().setHours(roomData.startTime[0], roomData.startTime[1]), 'HH:mm');
        roomData.endTimeFormatted = format(new Date().setHours(roomData.endTime[0], roomData.endTime[1]), 'HH:mm');
        roomsData.push({ id: doc.id, ...roomData });
      });

      setRooms(roomsData);
    } catch (error) {
      console.error('Error', error);
    }
  }

  async function deleteData(id){
    try {
      await deleteDoc(doc(fs, 'roomsEx', id));
      // 문서 삭제 후에 데이터를 다시 가져옵니다.
      fetchData();
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  }

  return (
    <div>
      <h1>Room List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td style={{ padding: '15px' }}>{room.id}</td>
              <td style={{ padding: '15px' }}>{room.name}</td>
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
