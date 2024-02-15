import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; 

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
      } else {
        console.log("No such document!");
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <div>
        <h1 className="py-10 text-3xl text-center font-bold">
          Reserved!
        </h1>
        <div>
            <>
              {reservationData.userName}님 {reservationData.roomName}호 {reservationData.partitionName} {reservationData.startTimeString}시 ~ {reservationData.endTimeString}시 예약되었습니다.
            </>
        </div>
      </div>
      <Button
        text={'예약 현황 둘러보기'}
        onClick={() => {
          navigate('/status');
        }}
      />
    </>
  );
};

export default ReservationsPage;
