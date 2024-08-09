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

  const loggedIn = useMemo(() => !!accessToken, []);

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
  }, [setAccessToken, setRefreshToken]);

  useEffect(() => fetchTokens(), [fetchTokens]);

  useEffect(() => {
    // storage 이벤트 발생할 때마다 fetchTokens 함수 실행
    window.addEventListener('storage', fetchTokens);
    //fetchTokens 함수를 storage 이벤트에 연결했다면 이벤트 제거
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
    } catch (error) {
      if (error.response && error.response.status === 412) {
        alert('아이디 또는 비밀번호가 틀렸습니다.');
      }
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // navigate('/login');
  }, []);

  return { accessToken, refreshToken, loggedIn, login, logout };
};

export default useAuth;
