import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const useAuth = () => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken') || null,
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken') || null,
  );

  const isTokenValid = token => {
    return token !== 'undefined' && token !== null;
  };

  const loggedIn = useMemo(() => !!accessToken, [accessToken]);

  const fetchTokens = useCallback(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (!isTokenValid(storedAccessToken) || !isTokenValid(storedRefreshToken)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return;
    }

    setAccessToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);
  }, []);

  useEffect(() => fetchTokens(), [fetchTokens]);

  useEffect(() => {
    window.addEventListener('storage', fetchTokens);
    return () => {
      window.removeEventListener('storage', fetchTokens);
    };
  }, []);

  const login = useCallback(async ({ id, password }) => {
    try {
      const response = await axios.post(
        'https://api.studyroom.computer.hufs.ac.kr/auth/login',
        {
          username: id,
          password: password,
        },
      );
      const access_token = response.data.data.access_token;
      const refresh_token = response.data.data.refresh_token;

      if (!isTokenValid(access_token) || !isTokenValid(refresh_token)) {
        throw new Error('유효하지 않는 토큰');
      }

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      return true; // 성공 시 true 반환
    } catch (error) {
      throw new Error(error.response.data.errorMessage || '로그인에 실패했습니다.');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    // navigate('/login');
  }, []);

  return { accessToken, refreshToken, loggedIn, login, logout };
};

export default useAuth;
