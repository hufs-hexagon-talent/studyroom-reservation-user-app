import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { authState } from './authState';
import { apiClient } from '../api/client';

const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);
  const isTokenValid = token => token !== undefined && token !== null;

  const loggedIn = auth.isAuthenticated;

  const login = useCallback(
    async ({ id, password }) => {
      try {
        const response = await apiClient.post(`/auth/login`, {
          username: id,
          password: password,
        });

        const data = response?.data?.data;
        const accessToken = data?.accessToken;
        const refreshToken = data?.refreshToken;
        const tokenType = data?.tokenType;
        const isPasswordChangeRequired = Boolean(
          data?.isPasswordChangeRequired,
        );

        if (!isTokenValid(accessToken) || !isTokenValid(refreshToken)) {
          throw new Error('유효하지 않는 토큰');
        }

        setAuth({
          isAuthenticated: true,
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenType: tokenType ?? 'bearer',
        });

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

  const logout = useCallback(() => {
    setAuth({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  }, [setAuth]);

  return { ...auth, loggedIn, login, logout };
};

export default useAuth;
