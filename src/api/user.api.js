import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

import { queryClient } from '../index';

const fetchMe = async () => {
  const response = await apiClient.get('/users/me');
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
    mutationFn: async ({ roomId, startDateTime, endDateTime }) => {
      const res = await apiClient.post('/reservations', {
        roomId,
        startDateTime,
        endDateTime,
      });

      return res.data; // 명시적으로 반환
    },
  });
};

// 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
export const fetchDate = async () => {
  const date_response = await apiClient.get('/schedules/available-dates');
  const dates = date_response.data.data.items.map(date => new Date(date));
  return dates;
};

//해당 날짜의 예약 정보 가져오기 (1차원, checkVisit에 사용)
export const fetchReservationsByRooms = async ({ date, roomIds }) => {
  const params = new URLSearchParams();
  params.append('date', date);
  roomIds.forEach(id => params.append('roomIds', id));

  const response = await apiClient.get(`https://api.studyroom.jisub.kim/reservations/rooms/by-date?${params.toString()}`);
  return response.data.data.reservations;
};

export const useReservationsByRooms = ({ date, roomIds }) =>
  useQuery({
    queryKey: ['reservationsByRooms', date, roomIds],
    queryFn: () => fetchReservationsByRooms({ date, roomIds }),
  });

// 해당 날짜의 예약 정보 가져오기 (2차원, roomPage에 사용)
export const fetchReservations = async ({ date }) => {
  const response = await apiClient.get(`/reservations/by-date?date=${date}`);

  const data = response.data.data.items;

  return data;
};

export const useReservations = ({ date }) =>
  useQuery({
    queryKey: ['reservationsByRooms', date],
    queryFn: () => fetchReservations({ date }),
  });



// 예약 삭제하기
export const useDeleteReservation = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const res = await apiClient.delete(`/reservations/me/${reservationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('userReservation');
    },
  });
};

export const fetchUserReservation = async () => {
  const user_reservation_response = await apiClient.get('/reservations/me');
  return user_reservation_response.data.data.items.reverse();
};

export const useUserReservation = () =>
  useQuery({
    queryKey: ['userReservation'],
    queryFn: fetchUserReservation,
  });

export const fetchOtp = async () => {
  const otp_response = await apiClient.post('/otp');

  return otp_response.data.data.verificationCode;
};

export const useOtp = () =>
  useQuery({
    queryKey: ['otp'],
    queryFn: () => fetchOtp(),
  });

export const fetchRoom = async roomId => {
  const room_response = await apiClient.get(`/rooms/${roomId}`);

  return room_response.data;
};

export const useRooms = roomIds =>
  useQuery({
    queryKey: ['rooms', roomIds],
    queryFn: async () => {
      if (!roomIds) return [];
      const rooms = await Promise.all(roomIds.map(roomId => fetchRoom(roomId)));
      console.log(rooms);
      return rooms;
    },
  });

// 체크인 하기
export const useCheckIn =()=>{
  return useMutation({
    mutationFn : async({verificationCode, roomIds})=>{
      const check_in_res = await apiClient.post('/check-in',{
        verificationCode,
        roomIds
      });
      return check_in_res.data;
    },
  });
};

export const fetchAllRooms=async()=>{
  const all_rooms_response = await apiClient.get(
    '/rooms'
  )
  return all_rooms_response.data.data.items;
}

export const useAllRooms = () =>
  useQuery({
    queryKey: ['allRooms'],
    queryFn: async () => {
      const allRooms = await fetchAllRooms();
      return allRooms.map(room => ({ roomId: room.roomId, roomName: room.roomName }));
    },
  });

export const fetchReservedRooms =async({date,roomIds})=>{
  const reserved_rooms_res = await apiClient.get(
    `/reservations/rooms/by-date?date=${date}&roomIds=${roomIds}`
  )
  return reserved_rooms_res.data.data;
}

export const useReservedRooms =({date, roomIds})=>{
  useQuery({
    queryKey:[date,roomIds],
    queryFn:()=>fetchReservedRooms(date,roomIds)
  })
}