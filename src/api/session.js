const AUTH_STORAGE_KEY = 'authState';

let handler = null;
let pending = false;

const isAuthenticatedLocally = () => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved).isAuthenticated === true : false;
  } catch (e) {
    return false;
  }
};

export const setSessionExpiredHandler = fn => {
  handler = fn;

  // 라우터가 로딩 중일 때 만료를 감지했다면 등록 시점에 밀린 처리를 진행한다
  if (pending) {
    pending = false;
    handler();
  }
};

export const clearSessionExpiredHandler = () => {
  handler = null;
};

/**
 * 토큰 갱신에 실패해 재로그인 외에는 복구할 수 없는 상태를 앱에 알린다.
 *
 * 인증 상태는 localStorage 에, 토큰은 쿠키에 있어서 둘이 어긋나면
 * "로그인된 것처럼 보이지만 모든 요청이 401" 인 상태로 고착된다.
 *
 * - 로그인한 적 없는 방문자의 401 은 무시한다. (예: 공개 페이지에서의 /users/me)
 * - 저장된 인증 플래그를 먼저 지우므로 동시에 401 이 여러 건 나도 한 번만 처리된다.
 * - 앱 부팅 직후처럼 핸들러가 아직 없으면 보류해 두었다가 등록될 때 처리한다.
 */
export const handleSessionExpired = () => {
  if (!isAuthenticatedLocally()) return;

  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    // localStorage 를 쓸 수 없는 환경은 무시한다
  }

  if (handler) handler();
  else pending = true;
};
