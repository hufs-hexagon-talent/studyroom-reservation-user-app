import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// { verificationCode, expiresAt } 를 그대로 돌려준다. expiresAt 은 서버 OTP 유효 시간
// 기준이라 화면이 30초 카운트다운과 별개로 진짜 만료를 판정하는 데 쓴다.
export const fetchOtp = async () => {
  const otp_response = await apiClient.post('/check-in/otp');
  return otp_response.data.data;
};

export const useOtp = () =>
  useQuery({
    queryKey: ['otp'],
    queryFn: () => fetchOtp(),
  });

// 체크인 하기
export const useCheckIn = () => {
  return useMutation({
    mutationFn: async ({ verificationCode, roomId }) => {
      const check_in_res = await apiClient.post('/check-in', {
        verificationCode,
        roomId,
      });
      return check_in_res.data;
    },
  });
};
