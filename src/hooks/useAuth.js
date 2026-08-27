import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from './authState';
import { apiClient } from '../api/client';
import { queryClient } from '../queryClient';

const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  const loggedIn = auth.isAuthenticated;

  const login = useCallback(
    async ({ id, password }) => {
      try {
        const response = await apiClient.post('/auth/login', {
          username: id,
          password,
        });

        const data = response?.data?.data;
        const isPasswordChangeRequired = Boolean(
          data?.isPasswordChangeRequired,
        );

        // 이전 계정의 조회 결과(이름·예약·출석 QR)가 남으면 다음 계정에게 보인다
        queryClient.clear();
        // 쿠키는 서버가 Set-Cookie로 심어줌. 프론트는 상태만 갱신.
        setAuth({ isAuthenticated: true });

        return {
          isPasswordChangeRequired,
          message: response?.data?.message,
        };
      } catch (error) {
        console.log(error.response?.data?.message);
        // 비밀번호 오류와 서버·네트워크 문제를 구분해 안내한다
        if (!error.response) {
          throw new Error(
            '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
          );
        }
        if (error.response.status >= 500) {
          throw new Error(
            '서버에 문제가 있어 로그인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
          );
        }
        throw new Error(
          error.response?.data?.message || '로그인에 실패했습니다.',
        );
      }
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // 요청이 실패해도 화면 상태와 계정 캐시는 정리한다.
      // 서버 쿠키가 남아 있으면 다음 부팅 복원에서 다시 로그인 상태가 된다.
      setAuth({ isAuthenticated: false });
      queryClient.clear();
    }
  }, [setAuth]);

  return { ...auth, loggedIn, login, logout };
};

export default useAuth;
