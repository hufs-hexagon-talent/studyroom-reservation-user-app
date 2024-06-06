import axios from 'axios';

export const apiClient = axios.create({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
});

apiClient.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken');
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
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // 리프레시 토큰이 없으면 로그아웃 하기

        return Promise.reject(error);
      }
      // todo : refresh가 401이 떴을 때 새로 refresh 떳을때) 지금 요청하려고 하는 api가 refresh면? 바로 종료
      // 현재 요청이 리프레시 요청이냐
      if (error.config.url === 'https://api.studyroom.jisub.kim/auth/refresh') {
        return Promise.reject(error);
      }
      try {
        // 리프레시 토큰으로 액세스 토큰 와서 새 액세스 토큰으로 재요청하기
        const response = await axios.post(
          'https://api.studyroom.jisub.kim/auth/refresh',
          { refreshToken },
        );
        const accessToken = response.data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        return apiClient(error.config);
      } catch (refreshError) {
        // 토큰 갱신 실패하면 로그아웃

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
