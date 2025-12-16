import axios from 'axios';

const baseUrl = process.env.REACT_APP_QA_API_URL;

export const apiClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// 동시에 여러 요청이 401 터질 때 refresh 중복 호출 방지
let isRefreshing = false;
let refreshQueue = [];

const runQueue = error => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (!error?.response) return Promise.reject(error);

    const originalRequest = error.config;

    // 401만 처리
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // refresh 자체가 401이면 종료 (로그인 만료)
    if (originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // 무한 루프 방지
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // 이미 refresh 중이면 큐에서 대기 후 재시도
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: () => resolve(apiClient(originalRequest)),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // efreshToken 쿠키를 서버가 읽는 구조라면 바디 필요 없음
      await apiClient.post('/auth/refresh');

      runQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      runQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
