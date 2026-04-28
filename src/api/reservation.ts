import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  CreateReservationRequest,
  ReservationSearchRequest,
} from '@/types/reservation';

const DEPARTMENT_ID = process.env.NEXT_PUBLIC_DEPARTMENT_ID ?? '1';

// 예약 생성
export const useReserve = () => {
  return useMutation({
    mutationFn: async (data: CreateReservationRequest) => {
      const res = await apiClient.post('/reservations', data);
      return res.data;
    },
  });
};

// 특정 날짜 + 부서의 모든 파티션 예약 현황
export const useReservations = (date: string) => {
  return useQuery({
    queryKey: ['reservationsByRooms', date, DEPARTMENT_ID],
    queryFn: async () => {
      const res = await apiClient.get(
        `/reservations/by-date/${DEPARTMENT_ID}?date=${date}`,
      );
      return res.data.data.partitionReservationInfos;
    },
    enabled: !!date,
  });
};

// 자신의 예약 목록
export const useUserReservation = () => {
  return useQuery({
    queryKey: ['userReservation'],
    queryFn: async () => {
      const res = await apiClient.get('/reservations/me');
      return res.data.data.reservationInfoResponses.reverse();
    },
  });
};

// 예약 삭제
export const useDeleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: number) => {
      const res = await apiClient.delete(`/reservations/me/${reservationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userReservation'] });
    },
  });
};

// 최신 체크인 대상 예약
export const useLatestReservation = () => {
  return useQuery({
    queryKey: ['latest'],
    queryFn: async () => {
      const res = await apiClient.get('/reservations/me/latest');
      return res.data.data.reservationInfoResponses;
    },
  });
};

// 노쇼 횟수
export const useNoShow = () => {
  return useQuery({
    queryKey: ['noShow'],
    queryFn: async () => {
      const res = await apiClient.get('/reservations/me/no-show');
      return res.data.data;
    },
  });
};

// === 관리자 API ===

export const useAdminDeleteReservation = () => {
  return useMutation({
    mutationFn: async (reservationId: number) => {
      const res = await apiClient.delete(`/reservations/admin/${reservationId}`);
      return res.data;
    },
  });
};

export const useChangeState = () => {
  return useMutation({
    mutationFn: async (data: { reservationId: number; state: string }) => {
      const res = await apiClient.patch(
        `/reservations/admin/${data.reservationId}`,
        { state: data.state },
      );
      return res.data;
    },
  });
};

export const useReservationsById = (userId: number) => {
  return useQuery({
    queryKey: ['reservationsById', userId],
    queryFn: async () => {
      const res = await apiClient.get(`/reservations/admin/users/${userId}`);
      return res.data.data.reservationInfoResponses;
    },
    enabled: !!userId,
  });
};

export const useReservationStatics = (date: string) => {
  return useQuery({
    queryKey: ['statics', date],
    queryFn: async () => {
      const res = await apiClient.get(
        `/reservations/admin/statics/by-date?date=${date}`,
      );
      return res.data.data;
    },
  });
};

export const useReservationSearch = () => {
  return useMutation({
    mutationFn: async (params: ReservationSearchRequest) => {
      const res = await apiClient.post('/reservations/search', {
        ...params,
        page: params.page ?? 0,
        size: params.size ?? 10,
      });
      return res.data;
    },
  });
};

export const useStates = () => {
  return useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const res = await apiClient.get('/reservations/states');
      return res.data.data;
    },
  });
};
