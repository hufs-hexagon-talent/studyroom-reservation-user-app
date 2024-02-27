import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

import boo from '../../assets/boo.jpeg';
import Button from '../../components/Button';
import { fs } from '../../firebase';

const ReservationsPage = () => {
  const navigate = useNavigate();
  const { roomId, roomNumber } = useParams();
  const [reservationData, setReservationData] = useState(null);
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  let monthFormatted = month < 10 ? `0${month}` : month;
  let dayFormatted = day < 10 ? `0${day}` : day;

  const currentDay = `${year}.${monthFormatted}.${dayFormatted}`;

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(
        fs,
        `Rooms/${roomNumber}/Days/${currentDay}/Reservations`,
        roomId,
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { userName, roomName, partitionName, startTime, endTime } =
          docSnap.data();
        const startTimeString = `${startTime[0]}:${startTime[1]}`;
        const endTimeString = `${endTime[0]}:${endTime[1]}`;

        setReservationData({
          userName,
          roomName,
          partitionName,
          startTimeString,
          endTimeString,
        });
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {reservationData ? (
        <div>
          <h1 className="py-10 text-center font-bold">
            <div className="text-xl">{reservationData.userName}님,</div>
            <div className="text-2xl">예약 되었습니다!</div>
          </h1>
          <div className="flex justify-center items-center">
            <div className="w-48 h-48">
              <img src={boo} alt="boo" />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="bg-blue-200 w-full max-w-lg py-10 rounded-lg text-center shadow-lg">
              <p className="text-2xl font-semibold">예약 내역</p>
              <br />
              <div className="text-gray-600">
                이름: {reservationData.userName}
                <br />
                호실: {reservationData.roomName}호{' '}
                {reservationData.partitionName}
                <br />
                시간: {reservationData.startTimeString} -{' '}
                {reservationData.endTimeString}
              </div>
            </div>
          </div>
          <br />
          <Button
            text={'완료'}
            onClick={() => {
              navigate('');
            }}
          />
          <br />
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