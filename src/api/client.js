import axios from 'axios';

export const apiClient = axios.create({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // 리프레시 토큰 가져오기
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // 리프레시 토큰이 없으면 로그아웃 하기
        console.log('리프레시 토큰 없음. 로그아웃');
        return Promise.reject(error);
      }

      try {
        // 리프레시 토큰으로 액세스 토큰 와서 헤더 업데이트 하고 새 액세스 토큰으로 재요청하기
        const response = await axios.post('https://api.user.connect.alpaon.dev/user/auth/login', { refreshToken });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        return apiClient(error.config);
      } catch (refreshError) {
        // 토큰 갱신 실패하면 로그아웃
        console.log('토큰 갱신 실패. 로그아웃');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
