import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

const fetchMe = async () => {
  const response = await apiClient.get(
    'https://api.studyroom.jisub.kim/users/me',
  );
  return response.data.name;
};

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });
};

// 자신의 예약 생성
export const useReserve = () => {
  return useMutation({
    mutationFn: async ({
      roomId, startDateTime, endDateTime
    }) =>{
      const res = await apiClient.post(
        'https://api.studyroom.jisub.kim/reservations',
        {
          roomId,
          startDateTime,
          endDateTime,
        },
      );
      console.log(res.data);
      return res.data; // 명시적으로 반환
    }
  });
}


// 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
export const fetchDate = async() =>{
  const date_response = await apiClient.get(
'https://api.studyroom.jisub.kim/schedules/available-dates'
  );
  const dates = date_response.data.data.items.map(date => new Date(date));
  return dates;
}

export let roomDict = {};

export const setRoomDict =(dict) =>{
  roomDict = dict;
}

//예약 정보 가져오기
export const fetchReservation = async (date, setSlotsArr, setReservedSlots) => {
  try {
    const response = await apiClient.get(
      `https://api.studyroom.jisub.kim/reservations/by-date?date=${date}`,
    );
    const roomNames = response.data.data.items.map(item => item.roomName);
    console.log(roomNames);
    const roomIds = response.data.data.items.map(item => item.roomId);
    console.log(roomIds);
    // '식별자 : 호실 이름' 형식으로 딕셔너리 생성
    for (let i=0; i<6; i++){
      roomDict[roomNames[i]] = roomIds[i];
    }
    console.log(roomDict);
    setRoomDict(roomDict);
    setSlotsArr(roomNames);

    const updatedReservedSlots = {};

    response.data.data.items.forEach(item => {
      const startTimes = item.timeline.map(t => t.startDateTime);
      const endTimes = item.timeline.map(t => t.endDateTime);
      console.log(`Room: ${item.roomName}`);
      console.log('Start Times:', startTimes);
      console.log('End Times:', endTimes);

      updatedReservedSlots[item.roomName] = { startTimes, endTimes };
    });
    setReservedSlots(updatedReservedSlots);
    console.log(updatedReservedSlots);
    console.log('done');
  } catch (error) {
    console.error('fetch error : ', error);
  }
};

export const getUserReservation = async()=>{
  const user_reservation_response = await apiClient.get(
    'https://api.studyroom.jisub.kim/reservations/me'
  );
  return user_reservation_response;
}