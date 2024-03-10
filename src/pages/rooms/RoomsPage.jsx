import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';

import Button from '../../components/button/Button';
import { fs } from '../../firebase';

const fetchRoomsData = async () => {
  const q = query(collection(fs, 'Rooms'));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
};

const RoomsPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]); // {id:{name:"123"}} -> [[id,{name:"asdf"}], [id,{name:"123"}]]
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  let monthFormatted = month < 10 ? `0${month}` : month;
  let dayFormatted = day < 10 ? `0${day}` : day;

  const currentDay = `${year}.${monthFormatted}.${dayFormatted}`;

  const fetch = useCallback(async () => {
    setRooms(await fetchRoomsData());
  }, [setRooms]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleButtonClick = async (roomId) => {
    try {
      const docAddress = collection(fs, `Rooms/${roomId}/Days/${currentDay}/Reservations`);
      console.log(docAddress);
      navigate(`/rooms/${roomId}/roompage`);
    } catch (error) {
      console.log('error');
    }
  };
  return (
    <>
      <div>
        <h2 className="py-10 text-3xl text-center font-bold">
          호실을 선택하세요.
        </h2>
        {rooms.map(room => {
          return (
            <>
              <Button
                key={room.id}
                text={room.data.name}
                onClick={() => {
                  handleButtonClick(room.data.name);
                }}
              />
            </>
          );
        })}
      </div>
    </>
  );
};

export default RoomsPage;