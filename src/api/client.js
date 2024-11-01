import axios from 'axios';

// 기존 authState를 가져오는 함수 정의
const getAuthState = () => {
  const authState = localStorage.getItem('authState');
  return authState ? JSON.parse(authState) : null;
};

const baseUrl =
  process.env.REACT_APP_API_URL || 'https://api.studyroom.computer.hufs.ac.kr';

export const apiClient = axios.create({
  baseURL: 'https://api.studyroom-qa.alpaon.net/',
  headers: {
    Authorization: `Bearer ${getAuthState()?.accessToken}`,
  },
});

apiClient.interceptors.request.use(
  config => {
    const authState = getAuthState(); // authState 객체를 가져옵니다.
    const accessToken = authState?.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (error.response && error.response.status === 401) {
      // 리프레시 토큰 가져오기
      const authState = getAuthState(); // authState 객체를 가져옵니다.
      const refreshToken = authState?.refreshToken;

      if (!refreshToken) {
        // 리프레시 토큰이 없으면 로그아웃 처리
        return Promise.reject(error);
      }

      // 현재 요청이 리프레시 요청인지 확인
      if (error.config.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      try {
        // 리프레시 토큰으로 액세스 토큰 갱신
        const response = await axios.post(
          'https://api.studyroom-qa.alpaon.net/auth/refresh',
          {
            refresh_token: refreshToken, // 올바른 키 사용
          },
        );
        const accessToken = response.data.data.accessToken;

        // authState 업데이트
        const updatedAuthState = {
          ...authState,
          accessToken: accessToken,
        };

        localStorage.setItem('authState', JSON.stringify(updatedAuthState));
        // 새로운 토큰으로 원래 요청 재시도
        error.config.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(error.config); // 원래 요청 재시도
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
