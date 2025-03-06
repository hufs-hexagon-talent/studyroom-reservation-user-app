import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// 이메일 전송
export const useEmailSend = () => {
  return useMutation({
    mutationFn: async username => {
      const email_res = await apiClient.post(
        `/auth/mail/send?username=${username}`,
      );
      return email_res.data.data;
    },
  });
};

// 이메일 검증
export const useEmailVerify = () => {
  return useMutation({
    mutationFn: async ({ email, verifyCode }) => {
      const verify_res = await apiClient.post('/auth/mail/verify', {
        email,
        verifyCode,
      });
      return verify_res.data;
    },
  });
};
