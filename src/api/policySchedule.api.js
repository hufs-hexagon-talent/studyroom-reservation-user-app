import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
export const fetchDate = async departmentId => {
  const date_response = await apiClient.get(
    `/schedules/available-dates/${departmentId}`,
  );
  const dates = date_response.data.data.availableDates.map(
    date => new Date(date),
  );
  return dates;
};

// [관리자] 해당 날짜의 schedule들 조회
export const fetchScheduleByDate = async date => {
  const response = await apiClient.get(`schedules/date/${date}`);
  return response.data.data.schedules;
};

export const useScheduleByDate = date => {
  return useQuery({
    queryKey: ['scheduleByDate'],
    queryFn: () => fetchScheduleByDate(date),
  });
};

// 스케줄 주입
export const useSchedules = () => {
  return useMutation({
    mutationFn: async ({
      roomIds,
      roomOperationPolicyId,
      policyApplicationDates,
    }) => {
      const schedules_policy = await apiClient.post('/schedules', {
        roomIds,
        roomOperationPolicyId,
        policyApplicationDates,
      });
      return schedules_policy.data;
    },
  });
};
