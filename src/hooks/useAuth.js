import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import axios from 'axios';
import { authState } from './authState';

const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);
  const baseUrl = process.env.REACT_APP_API_URL;
  const isTokenValid = token => token !== undefined && token !== null;

  const loggedIn = auth.isAuthenticated;

  const login = useCallback(
    async ({ id, password }) => {
      try {
        const response = await axios.post(`${baseUrl}/auth/login`, {
          username: id,
          password: password,
        });

        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;
        if (!isTokenValid(accessToken) || !isTokenValid(refreshToken)) {
          throw new Error('유효하지 않는 토큰');
        }

        setAuth({
          isAuthenticated: true,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });

        return true;
      } catch (error) {
        throw new Error(
          error.response?.data?.errorMessage || '로그인에 실패했습니다.',
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
    // navigate('/login'); // 리다이렉트가 필요하다면 사용
  }, [setAuth]);

  return { ...auth, loggedIn, login, logout };
};

export default useAuth;
