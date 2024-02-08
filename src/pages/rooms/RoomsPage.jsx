import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';

import Button from '../../components/Button';
import { fs } from '../../firebase';

const fetchRoomsData = async () => {
  const q = query(collection(fs, 'Rooms')); // import 해줘

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

  return (
    <>
      <div>
        <h2>호실을 선택하세요.</h2>
        {rooms.map(room => {
          return (
            <>
              <Button
                text={room.data.name}
                onClick={() => {
                  navigate(`/rooms/${room.id}`);
                }}
              />
            </>
          );
        })}
        {/* <Button
          text="306호"
          onClick={() => {
            console.log('select 306');
            navigate('/rooms/306');
          }}
        />
        <br />
        <Button
          text="428호"
          onClick={() => {
            console.log('select 428');
            navigate('/rooms/428');
          }}
        /> */}
        <br />
        <br />
      </div>
      <br />
    </>
  );
};

export default RoomsPage;
