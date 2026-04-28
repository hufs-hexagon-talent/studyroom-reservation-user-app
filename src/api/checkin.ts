import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { CheckInRequest } from '@/types/checkin';

// OTP 발급
export const useOtp = () => {
  return useQuery({
    queryKey: ['otp'],
    queryFn: async () => {
      const res = await apiClient.post('/check-in/otp');
      return res.data.data.verificationCode as string;
    },
  });
};

// 체크인
export const useCheckIn = () => {
  return useMutation({
    mutationFn: async (data: CheckInRequest) => {
      const res = await apiClient.post('/check-in', data);
      return res.data;
    },
  });
};
