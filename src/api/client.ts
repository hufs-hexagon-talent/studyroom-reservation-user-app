import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 15000,
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const runQueue = (error: unknown | null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error?.response) return Promise.reject(error);

    const originalRequest = error.config;

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

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
