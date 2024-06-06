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
    mutationFn: async ({ roomId, startDateTime, endDateTime }) => {
      const res = await apiClient.post(
        'https://api.studyroom.jisub.kim/reservations',
        {
          roomId,
          startDateTime,
          endDateTime,
        },
      );

      return res.data; // 명시적으로 반환
    },
  });
};

// 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
export const fetchDate = async () => {
  const date_response = await apiClient.get(
    'https://api.studyroom.jisub.kim/schedules/available-dates',
  );
  const dates = date_response.data.data.items.map(date => new Date(date));
  return dates;
};

//예약 정보 가져오기
export const fetchReservationsByRooms = async ({ date }) => {
  const response = await apiClient.get(
    `https://api.studyroom.jisub.kim/reservations/by-date?date=${date}`,
  );

  const data = response.data.data.items;

  return data;
};

export const deleteReservations = async reservationId => {
  await apiClient.delete(
    `https://api.studyroom.jisub.kim/reservations/me/${reservationId}`,
    {},
  );
};

export const useDeleteReservation = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const res = await apiClient.delete(`/reservations/me/${reservationId}`);
      return res.data;
    },
  });
};

export const useReservationsByRooms = ({ date }) =>
  useQuery({
    queryKey: ['reservationsByRooms', date],
    queryFn: () => fetchReservationsByRooms({ date }),
  });

export const getUserReservation = async () => {
  const user_reservation_response = await apiClient.get(
    'https://api.studyroom.jisub.kim/reservations/me',
  );
  return user_reservation_response;
};

export const fetchOtp = async () => {
  const otp_response = await apiClient.post(
    'https://api.studyroom.jisub.kim/otp',
  );

  return otp_response.data.data.verificationCode;
};

export const useOtp = () =>
  useQuery({
    queryKey: ['otp'],
    queryFn: () => fetchOtp(),
  });
