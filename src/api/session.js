let handler = null;
let pending = false;

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
 * 로그인 여부 판단은 화면(SessionExpiryWatcher)이 한다. 인증 상태를 어디에
 * 보관하는지와 무관하게 동작해야 하므로 여기서는 저장소를 읽지 않는다.
 * 앱 부팅 직후처럼 처리 함수가 아직 없으면 보류했다가 등록될 때 처리한다.
 */
export const handleSessionExpired = () => {
  if (handler) handler();
  else pending = true;
};
