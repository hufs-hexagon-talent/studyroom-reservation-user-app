import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from './authState';
import { apiClient } from '../api/client';

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

        // 쿠키는 서버가 Set-Cookie로 심어줌. 프론트는 상태만 갱신.
        setAuth({ isAuthenticated: true });

        return {
          isPasswordChangeRequired,
          message: response?.data?.message,
        };
      } catch (error) {
        console.log(error.response?.data?.message);
        throw new Error(
          error.response?.data?.message || '로그인에 실패했습니다.',
        );
      }
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    // 가능하면 서버에 logout API가 있으면 호출해서 쿠키 만료시키는 게 정석
    // await apiClient.post('/auth/logout');

    setAuth({ isAuthenticated: false });
  }, [setAuth]);

  return { ...auth, loggedIn, login, logout };
};

export default useAuth;
