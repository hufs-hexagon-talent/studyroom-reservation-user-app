import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import axios from 'axios';
import { authState } from './authState';

const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  const isTokenValid = token => token !== 'undefined' && token !== null;

  const loggedIn = auth.isAuthenticated;

  const login = useCallback(
    async ({ id, password }) => {
      try {
        const response = await axios.post(
          'https://api.studyroom-qa.alpaon.net/auth/login',
          {
            username: id,
            password: password,
          },
        );
        const access_token = response.data.data.accessToken;
        const refresh_token = response.data.data.refreshToken;

        if (!isTokenValid(access_token) || !isTokenValid(refresh_token)) {
          throw new Error('유효하지 않는 토큰');
        }

        setAuth({
          isAuthenticated: true,
          accessToken: access_token,
          refreshToken: refresh_token,
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
