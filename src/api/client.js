import axios from 'axios';
import { handleSessionExpired } from './session';
import config from '../config';

export const SESSION_EXPIRED_MESSAGE =
  '로그인이 만료되었습니다. 다시 로그인해 주세요.';

export const apiClient = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
  // 서버가 응답을 붙들고 있으면 학생은 끝나지 않는 스피너만 본다.
  // 끊긴 요청은 응답 없는 오류가 되어 아래 인터셉터를 그대로 통과한다.
  timeout: 15000,
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

// 세션 만료 판정은 서버가 갱신을 거부한 경우(401/403)만.
// 네트워크 순단이나 5xx 를 만료로 단정하면 멀쩡한 세션을 버리게 된다.
const isRefreshRejected = refreshError => {
  const status = refreshError?.response?.status;
  return status === 401 || status === 403;
};

// 호출자는 대개 response.data.message 를 그대로 스낵바에 띄운다. 갱신 실패의
// 서버 원문("쿠키에 refreshToken 이 없습니다" 등)은 학생이 이해할 수 없으므로
// 여기서 재로그인 안내로 바꿔 넘긴다. 상태는 401 로 두어 isAuthError 판정과
// 서버 에러 코드는 그대로 남긴다.
const toSessionExpiredError = refreshError => {
  const error = new Error(SESSION_EXPIRED_MESSAGE);
  error.sessionExpired = true;
  error.cause = refreshError;
  error.config = refreshError?.config;
  error.response = {
    ...refreshError?.response,
    status: 401,
    data: { ...refreshError?.response?.data, message: SESSION_EXPIRED_MESSAGE },
  };
  return error;
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

    // refresh 자체이거나 로그인 실패(비밀번호 불일치)면 갱신 시도 없이 종료
    if (
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login')
    ) {
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
      // refreshToken 쿠키를 서버가 읽는 구조라 바디 필요 없음
      await apiClient.post('/auth/refresh');

      runQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      if (!isRefreshRejected(refreshError)) {
        // 갱신 요청이 닿지 않았거나 서버 장애. 세션은 살아 있을 수 있으니 정리하지 않는다.
        runQueue(refreshError);
        return Promise.reject(refreshError);
      }
      // 갱신 거부 = 재로그인 외에 복구 방법이 없음. 남아있는 인증 상태를 정리한다.
      const sessionExpired = toSessionExpiredError(refreshError);
      handleSessionExpired();
      runQueue(sessionExpired);
      return Promise.reject(sessionExpired);
    } finally {
      isRefreshing = false;
    }
  },
);
