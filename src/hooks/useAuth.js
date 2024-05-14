
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

    window.addEventListener('storage', fetchTokens);

    return () => {
      window.removeEventListener('storage', fetchTokens);
    };
  }, []);

  const login = useCallback(async ({id, password}) => {
    const response = await axios.post(
      'https://api.user.connect.alpaon.dev/user/auth/login',
      {
        username: id,
        password: password,
      },
    );
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }, []);

  return { accessToken, refreshToken, loggedIn, login, logout };
};

export default useAuth;