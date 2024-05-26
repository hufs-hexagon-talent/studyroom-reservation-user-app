
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const useAuth = () => {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken') || null,
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken') || null,
  );

  const loggedIn = useMemo(()=> !!accessToken ,[])

  const fetchTokens = useCallback(() => {
    console.log("fetchTokens")
    const storedAccessToken = localStorage.getItem('accessToken') || null;
    const storedRefreshToken = localStorage.getItem('refreshToken') || null;

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

  const login = useCallback(async ({id, password}) => {
    const response = await axios.post(
      'https://api.studyroom.jisub.kim/auth/login',
      {
        username: id,
        password: password,
      },
    );
    localStorage.setItem('accessToken', response.data.access_token);
    localStorage.setItem('refreshToken', response.data.refresh_token);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }, []);

  return { accessToken, refreshToken, loggedIn, login, logout };
};

export default useAuth;