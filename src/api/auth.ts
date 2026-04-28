import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import type { LoginRequest, EmailVerifyRequest } from '@/types/auth';
import { useAuthStore } from '@/stores/authStore';

export const useLogin = () => {
  const { login, setPasswordChangeRequired } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await apiClient.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      login();
      if (data?.data?.isPasswordChangeRequired) {
        setPasswordChangeRequired(true);
      }
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/auth/logout');
      return res.data;
    },
    onSuccess: () => {
      logout();
    },
  });
};

export const useEmailSend = () => {
  return useMutation({
    mutationFn: async (username: string) => {
      const res = await apiClient.post(`/auth/mail/send?username=${username}`);
      return res.data.data;
    },
  });
};

export const useEmailVerify = () => {
  return useMutation({
    mutationFn: async (data: EmailVerifyRequest) => {
      const res = await apiClient.post('/auth/mail/verify', data);
      return res.data;
    },
  });
};
