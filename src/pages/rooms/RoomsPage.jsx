import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';

import Button from '../../components/Button';
import { fs } from '../../firebase';


const fetchRoomsData = async () => {
  const q = query(collection(fs, 'Rooms'));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
};

const RoomsPage = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]); // {id:{name:"123"}} -> [[id,{name:"asdf"}], [id,{name:"123"}]]
  
  const fetch = useCallback(async () => {
    setRooms(await fetchRoomsData());
  }, [setRooms]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleButtonClick=async(roomId, roomName)=>{
    try{
      const docAddress = collection(fs, `Rooms/${roomId}/Days/${roomId}/Reservations`);
      const docRef = await addDoc(docAddress, {
        name: roomName
      });
      navigate(`/rooms/${roomId}/${docRef.id}`)
    } catch(error){
      console.log('error');
    }
  }

  return (
    <>
      <div>
        <h2>호실을 선택하세요.</h2>
        {rooms.map(room => {
          return (
            <>
              <Button
                key={room.id}
                text={room.data.name}
                onClick={() => 
                  {
                    handleButtonClick(room.id, room.data.name)
                  }
                }
              />
              <br/>
            </>
          );
        })}
        <br />
        <br />
      </div>
      <br />
    </>
  );
};

export default RoomsPage;
