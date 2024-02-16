import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; 

import boo from '../../assets/boo.jpeg';
import Button from '../../components/Button';
import { fs } from "../../firebase";

const ReservationsPage = () => {
  const navigate = useNavigate();
  const { roomId, roomNumber } = useParams();
  const [reservationData, setReservationData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(fs, `Rooms/${roomNumber}/Days/${roomNumber}/Reservations`, roomId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { userName, roomName, partitionName, startTime, endTime } = docSnap.data();
        const startTimeString = `${startTime[0]}:${startTime[1]}`;
        const endTimeString = `${endTime[0]}:${endTime[1]}`;

        setReservationData({ userName, roomName, partitionName, startTimeString, endTimeString });
      }
    }

    fetchData();
  }, []);

  return (
    <>
      {reservationData ? (
        <div>
          <h1 className="py-10 text-2xl text-center font-bold">
            {reservationData.userName}님, <br/>예약 되었습니다!
          </h1>
          <div className='flex justify-center items-center'>
            <div className='w-48 h-48'>
              <img src={boo} alt='boo'/>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="bg-blue-200 w-full max-w-lg py-10 rounded-lg text-center">
              <p className="text-xl font-semibold">예약 내역</p>
              <br />
              <p>
                이름: {reservationData.userName}<br />
                호실: {reservationData.roomName}호 {reservationData.partitionName}<br />
                시간: {reservationData.startTimeString} - {reservationData.endTimeString}
              </p>
            </div>
          </div>
          <br/>
          <Button
            text={'완료'}
            onClick={()=>{
              navigate('/');
            }}
          />
          <br/>
          <Button 
            text={'예약 현황 둘러보기'}
            onClick={() => {
              navigate('/status');
            }}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
  
};

export default ReservationsPage;