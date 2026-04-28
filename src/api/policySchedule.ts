import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '@/types/policySchedule';

// 예약 가능한 날짜 목록
export const useAvailableDates = (departmentId: number) => {
  return useQuery({
    queryKey: ['availableDates', departmentId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/schedules/available-dates/${departmentId}`,
      );
      return (res.data.data.availableDates as string[]).map(
        (date) => new Date(date),
      );
    },
    enabled: departmentId != null,
  });
};

// [관리자] 해당 날짜의 schedule 조회
export const useScheduleByDate = (date: string) => {
  return useQuery({
    queryKey: ['scheduleByDate', date],
    queryFn: async () => {
      const res = await apiClient.get(`/schedules/date/${date}`);
      return res.data.data;
    },
    enabled: !!date,
  });
};

// [관리자] schedule 단건 조회
export const useSchedule = (scheduleId: number) => {
  return useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/schedules/${scheduleId}`);
      return res.data.data;
    },
    enabled: !!scheduleId,
  });
};

// === 관리자 API ===

// 스케줄 주입
export const useCreateSchedules = () => {
  return useMutation({
    mutationFn: async (data: CreateScheduleRequest) => {
      const res = await apiClient.post('/schedules', data);
      return res.data;
    },
  });
};

// schedule 업데이트
export const useUpdateSchedule = () => {
  return useMutation({
    mutationFn: async (data: UpdateScheduleRequest) => {
      const { roomOperationPolicyScheduleId, ...body } = data;
      const res = await apiClient.put(
        `/schedules/schedule/${roomOperationPolicyScheduleId}`,
        body,
      );
      return res.data.data;
    },
  });
};

// schedule 삭제
export const useDeleteSchedule = () => {
  return useMutation({
    mutationFn: async (roomOperationPolicyScheduleId: number) => {
      const res = await apiClient.delete(
        `/schedules/${roomOperationPolicyScheduleId}`,
      );
      return res.data;
    },
  });
};
