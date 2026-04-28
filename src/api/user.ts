import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  UserInfo,
  SignUpRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
} from '@/types/user';

// 자신의 정보 조회 (useServiceRole 통합)
export const useMyInfo = () => {
  return useQuery<UserInfo>({
    queryKey: ['myInfo'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me');
      return res.data.data;
    },
  });
};

// 회원 가입
export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpRequest) => {
      const res = await apiClient.post('/users/sign-up', data);
      return res.data;
    },
  });
};

// 로그인 상태에서 비밀번호 수정
export const usePassword = () => {
  return useMutation({
    mutationFn: async (data: PasswordChangeRequest) => {
      const res = await apiClient.put('/users/me/password', data);
      return res.data;
    },
  });
};

// 로그아웃 상태에서 비밀번호 수정
export const useLoggedOutPassword = () => {
  return useMutation({
    mutationFn: async (data: PasswordResetRequest) => {
      const res = await apiClient.post('/users/reset-password', data);
      return res.data;
    },
  });
};

// 자신의 블락 기간 조회
export const useBlockedPeriod = () => {
  return useQuery({
    queryKey: ['blockedPeriod'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/users/me/blocked-period');
        return res.data;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 400) return undefined;
        throw error;
      }
    },
  });
};

// 이메일 수정 요청
export const useNewEmailSend = () => {
  return useMutation({
    mutationFn: async (data: { password: string; newEmail: string }) => {
      const res = await apiClient.post('/users/me/mail/send', data);
      return res.data;
    },
  });
};

// 이메일 인증 코드 검증
export const useNewEmailVerify = () => {
  return useMutation({
    mutationFn: async (data: { verificationId: string; verifyCode: string }) => {
      const res = await apiClient.post('/users/me/mail/verify', data);
      return res.data;
    },
  });
};

// === 관리자 API ===

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await apiClient.get('/users/search');
      return res.data.data.users;
    },
  });
};

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: ['userById', userId],
    queryFn: async () => {
      const res = await apiClient.get(`/users/search/by-id/${userId}`);
      return res.data.data;
    },
    enabled: !!userId,
  });
};

export const useBlockedUser = () => {
  return useQuery({
    queryKey: ['blockedUser'],
    queryFn: async () => {
      const res = await apiClient.get('/users/blocked');
      return res.data.data.UserBlockedInfoResponses;
    },
  });
};

export const useUnblocked = () => {
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiClient.post(`/users/unblocked/${userId}`);
      return res.data;
    },
  });
};

export const useUserStatics = () => {
  return useQuery({
    queryKey: ['userStatics'],
    queryFn: async () => {
      const res = await apiClient.get('/users/statics');
      return res.data.data;
    },
  });
};

export const useUserRoleList = () => {
  return useQuery({
    queryKey: ['userRoleList'],
    queryFn: async () => {
      const res = await apiClient.get('/users/roles');
      return res.data.data;
    },
  });
};

export const useUserSearch = () => {
  return useMutation({
    mutationFn: async (params: {
      username?: string;
      serial?: string;
      name?: string;
      email?: string;
      role?: string;
      departmentId?: number;
      page?: number;
      size?: number;
    }) => {
      const res = await apiClient.post('/users/search', {
        ...params,
        page: params.page ?? 0,
        size: params.size ?? 20,
      });
      return res.data;
    },
  });
};

export const useUserUpdate = () => {
  return useMutation({
    mutationFn: async (data: {
      userId: number;
      username?: string;
      serial?: string;
      serviceRole?: string;
      name?: string;
      email?: string;
      departmentId?: number;
    }) => {
      const { userId, ...body } = data;
      const res = await apiClient.patch(`/users/${userId}`, body);
      return res.data;
    },
  });
};
