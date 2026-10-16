import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryClient } from '../queryClient';

// 자신의 예약 생성
export const useReserve = () => {
  return useMutation({
    mutationFn: async ({ roomPartitionId, startDateTime, endDateTime }) => {
      const res = await apiClient.post('/reservations', {
        roomPartitionId,
        startDateTime,
        endDateTime,
      });

      return res.data; // 명시적으로 반환
    },
    // 성공하면 내 칸이, 겹침(412)으로 실패하면 남이 먼저 잡은 칸이 표에 반영돼야 한다.
    // 내 예약·최근 예약 캐시도 같이 비운다 — 예약 직후 문의 폼의 예약 선택 목록과
    // 마이페이지의 현재 예약 배지가 마운트 재조회에만 기대면 캐시가 먼저 그려져 잠깐 빠진다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservationsByRooms'] });
      queryClient.invalidateQueries({ queryKey: ['userReservation'] });
      queryClient.invalidateQueries({ queryKey: ['latest'] });
    },
  });
};

// 특정 날짜, 특정 부서가 관리하는 모든 파티션의 예약 상태 조회
export const fetchReservations = async ({ date, departmentId }) => {
  const url = `/reservations/by-date/${departmentId}?date=${date}`;
  const response = await apiClient.get(url);
  const data = response.data.data.partitionReservationInfos;

  return data;
};

export const useReservations = ({ date, departmentId }) =>
  useQuery({
    queryKey: ['reservationsByRooms', date, departmentId],
    queryFn: () => fetchReservations({ date, departmentId }),
    enabled: !!departmentId,
    // 표를 열어둔 사이 남이 잡거나 취소한 칸이 반영되지 않으면 제출 단계에서야 겹침을 알게 된다.
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

// 예약 삭제하기
export const useDeleteReservation = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const res = await apiClient.delete(`/reservations/me/${reservationId}`);
      return res.data;
    },
    // 실패했을 때도 갱신해야 한다. 이미 사라진 예약이면 화면에 그대로 남아 재시도만 반복된다.
    onSettled: () => {
      // v5 는 객체 필터만 받는다. 문자열을 주면 전체 캐시가 무효화된다.
      // 삭제 후 갱신이 필요한 화면: 내 예약 목록, 체크인 대상, 노쇼 목록
      queryClient.invalidateQueries({ queryKey: ['userReservation'] });
      queryClient.invalidateQueries({ queryKey: ['latest'] });
      queryClient.invalidateQueries({ queryKey: ['noShow'] });
    },
  });
};

export const fetchUserReservation = async () => {
  const user_reservation_response = await apiClient.get('/reservations/me');
  return user_reservation_response.data.data.reservationInfoResponses.reverse();
};

export const useUserReservation = () =>
  useQuery({
    queryKey: ['userReservation'],
    queryFn: fetchUserReservation,
  });

// 노쇼 횟수
const fetchNoShow = async () => {
  const noshow_res = await apiClient.get('/reservations/me/no-show');
  return noshow_res.data.data;
};

export const useNoShow = () => {
  return useQuery({
    queryKey: ['noShow'],
    queryFn: fetchNoShow,
  });
};

// 자신이 현재 체크인 해야하는 예약 조회
const fetchLatestReservation = async () => {
  const latest_res = await apiClient.get('/reservations/me/latest');
  return latest_res.data.data.reservationInfoResponses;
};

export const useLatestReservation = () => {
  return useQuery({
    queryKey: ['latest'],
    queryFn: () => fetchLatestReservation(),
  });
};
