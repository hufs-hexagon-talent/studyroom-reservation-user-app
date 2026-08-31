// 로그인 실패를 학생용 문구로 바꾼다. 서버 원문(data.message)은 그대로 띄우지 않는다.
// AUTH-001 의 원문에는 '[사용자 인증에 실패]' 같은 개발용 접두어가 붙어 있고,
// 429 원문에는 언제 풀리는지가 없다.

const NETWORK_MESSAGE =
  '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.';

const CREDENTIAL_MESSAGE =
  '아이디 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.';

// 서버가 남은 초를 Retry-After 로 내려주고 CORS 로 노출까지 해 둔다.
// 값이 없으면 시간을 지어내지 않는다.
const retryAfterSeconds = error => {
  const raw = error?.response?.headers?.['retry-after'];
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
};

export const loginErrorMessage = error => {
  if (!error?.response) return NETWORK_MESSAGE;

  const { status, data } = error.response;
  const code = data?.code;

  if (status >= 500) {
    return '서버에 문제가 있어 로그인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  // 같은 공유망을 쓰는 다른 사람 때문에도 걸린다. 비밀번호 문제로 오해하지 않게 따로 안내한다.
  if (status === 429) {
    const seconds = retryAfterSeconds(error);
    return seconds
      ? `로그인 시도가 많아 잠시 막혔습니다. ${seconds}초 뒤 다시 시도해 주세요.`
      : '로그인 시도가 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  // 계정 만료·아이디 없음도 서버는 AUTH-001 로 내려준다. 아이디 존재 여부를 알려주지 않는다.
  if (code === 'AUTH-001' || code === 'AUTH-004' || status === 401) {
    return CREDENTIAL_MESSAGE;
  }
  if (code === 'USER-001' || status === 404) return CREDENTIAL_MESSAGE;
  if (code === 'CLIENT-001') {
    return '아이디와 비밀번호를 모두 입력해 주세요.';
  }
  return '로그인하지 못했습니다. 다시 시도해 주세요.';
};
