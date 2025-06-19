import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// [관리자] 모든 회원 정보 조회
const fetchAllUsers = async () => {
  const allUser_res = await apiClient.get('/users/search');
  return allUser_res.data.data.users;
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: fetchAllUsers,
  });
};

// [관리자] 특정 회원 정보 조회
const fetchUserById = async userId => {
  const userById_res = await apiClient.get(`/users/${userId}`);
  return userById_res.data.data;
};
export const useUserById = userId => {
  return useQuery({
    queryKey: ['userById', userId],
    queryFn: () => fetchUserById(userId),
    enabled: false,
  });
};

// 자신의 정보 조회
const fetchMyInfo = async () => {
  try {
    const myInfo_res = await apiClient.get('/users/me');
    return myInfo_res.data.data;
  } catch (e) {
    return false;
  }
};

export const useMyInfo = () => {
  return useQuery({
    queryKey: ['myInfo'],
    queryFn: fetchMyInfo,
  });
};

// 관리자인지 아닌지
export const fetchServiceRole = async () => {
  try {
    const isAdmin_res = await apiClient.get('/users/me');
    return isAdmin_res.data.data.serviceRole;
  } catch (e) {
    return false;
  }
};

export const useServiceRole = () => {
  return useQuery({
    queryKey: ['serviceRole'],
    queryFn: fetchServiceRole,
  });
};

// 로그인 된 상태에서 비밀번호 수정
export const usePassword = () => {
  return useMutation({
    mutationFn: async ({ prePassword, newPassword }) => {
      try {
        const password_res = await apiClient.put('/users/me/password', {
          prePassword,
          newPassword,
        });
        return password_res.data;
      } catch (error) {
        // 에러 발생 시 에러 응답을 반환
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message);
        }
        throw error;
      }
    },
  });
};

// 로그아웃 상태에서 비밀번호 수정
export const useLoggedOutPassword = () => {
  return useMutation({
    mutationFn: async ({ token, newPassword }) => {
      const loggedOutPW_res = await apiClient.post('/users/reset-password', {
        token,
        newPassword,
      });
      return loggedOutPW_res.data;
    },
  });
};

// 회원 가입
export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({ username, password, serial, name, email }) => {
      const signUp_res = await apiClient.post('/users/sign-up', {
        username,
        password,
        serial,
        name,
        email,
      });
      return signUp_res.data;
    },
  });
};

// [관리자] 블락당한 사용자들 조회
const fetchBlockedUser = async () => {
  const blockedUser_res = await apiClient.get('/users/blocked');
  return blockedUser_res.data.data.UserBlockedInfoResponses;
};

export const useBlockedUser = () => {
  return useQuery({
    queryKey: ['blockedUser'],
    queryFn: fetchBlockedUser,
  });
};

// [관리자] 블락 당한 사용자 블락 해제
export const useUnblocked = () => {
  return useMutation({
    mutationFn: async userId => {
      const unblocked_res = await apiClient.post(`/users/unblocked/${userId}`);
      return unblocked_res.data;
    },
  });
};

// [관리자] 학번으로 특정 회원 정보 조회
const fetchUserBySerial = async serial => {
  const userBySerial_res = await apiClient.get(
    `/users/search/by-serial?serial=${serial}`,
  );
  return userBySerial_res.data;
};

export const useUserBySerial = serial => {
  return useQuery({
    queryKey: ['userBySerial'],
    queryFn: () => fetchUserBySerial(serial),
    enabled: false,
  });
};

// [관리자] 이름으로 특정 회원 정보 조회
const fetchUserByName = async name => {
  const userByName_res = await apiClient.get(
    `/users/search/by-name?name=${name}`,
  );
  return userByName_res.data;
};

export const useUserByName = name => {
  return useQuery({
    queryKey: ['userByName'],
    queryFn: () => fetchUserByName(name),
    enabled: false,
  });
};

// 자신의 블락 기간 조회
export const fetchBlockedPeriod = async () => {
  try {
    const blockedPreiod_res = await apiClient.get('/users/me/blocked-period');
    return blockedPreiod_res.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.warn('사용자가 블락 상태가 아님:', error.response.data.message);
      return undefined;
    }
  }
};

export const useBlockedPeriod = () => {
  return useQuery({
    queryKey: ['blockedPeriod'],
    queryFn: fetchBlockedPeriod,
  });
};

// 로그인 후, 자신의 이메일 수정 요청
export const useNewEmailSend = () => {
  return useMutation({
    mutationFn: async ({ password, newEmail }) => {
      const newEmailSend_res = await apiClient.post('/users/me/mail/send', {
        password,
        newEmail,
      });
      return newEmailSend_res.data;
    },
  });
};

// 로그인 후, 인증 코드 검증 후, 이메일 수정 처리
export const useNewEmailVerify = () => {
  return useMutation({
    mutationFn: async ({ verificationId, verifyCode }) => {
      const newEmailVerify_res = await apiClient.post('/users/me/mail/verify', {
        verificationId,
        verifyCode,
      });
      return newEmailVerify_res.data;
    },
  });
};

// [관리자] 사용자 통계 조회
const fetchUserStatics = async () => {
  const userStatics = await apiClient.get('/users/statics');
  return userStatics.data.data;
};

export const useUserStatics = () => {
  return useQuery({
    queryKey: ['userStatics'],
    queryFn: fetchUserStatics,
  });
};

// [관리자] 사용자 정보 Excel 내보내기
export const exportUserExcel = async roles => {
  const userExcel = await apiClient.get(`/users/export/excel?roles=${roles}`, {
    responseType: 'blob', // 중요!
  });

  const rolePart = Array.isArray(roles) ? roles.join('&') : roles;
  const fileName = `${rolePart}-Users.xlsx`;

  // 파일 저장 처리
  const url = window.URL.createObjectURL(new Blob([userExcel.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// [관리자] 사용자 역할 리스트 조회
const fetchUserRoleList = async () => {
  const userRoleList_res = await apiClient.get('/users/roles', {});
  return userRoleList_res.data.data;
};

export const useUserRoleList = () => {
  return useQuery({
    queryKey: ['userRoleList'],
    queryFn: fetchUserRoleList,
  });
};

// [관리자] 회원 검색 조회
export const useUserSearch = () => {
  return useMutation({
    mutationFn: async ({
      username,
      serial,
      name,
      email,
      role,
      departmentId,
      page = 0,
      size = 20,
    }) => {
      const response = await apiClient.post('/users/search', {
        username,
        serial,
        name,
        email,
        role,
        departmentId,
        page,
        size,
      });

      return response.data;
    },
  });
};

// [관리자] 특정 회원 정보 수정
export const useUserUpdate = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      username,
      serial,
      serviceRole,
      name,
      email,
      departmentId,
    }) => {
      const response = await apiClient.patch(`/users/${userId}`, {
        username,
        serial,
        name,
        email,
        serviceRole,
        departmentId,
      });

      return response.data;
    },
  });
};
