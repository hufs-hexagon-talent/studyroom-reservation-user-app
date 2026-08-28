import { SESSION_EXPIRED_MESSAGE } from '../../api/client';
import { PASSWORD_RULE_MESSAGE } from './passwordRule';

// 비로그인 비밀번호 찾기의 인증 코드 발송·확인 실패를 학생용 문구로 바꾼다.
// 서버 원문(data.message)은 그대로 띄우지 않는다. 400 은 일반 문구라 원인을 구분할 수 없고,
// 429 는 재발송 제한·시간당 상한·IP 제한이 같은 상태 코드로 온다.

// 서버 쿨다운(authCodeResendCooldownSeconds)과 같은 값. 이보다 길면 학생이 헛되이 기다린다.
export const RESEND_COOLDOWN_SECONDS = 60;

const NETWORK_MESSAGE =
  '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.';

const retryAfterSeconds = error => {
  const raw = error?.response?.headers?.['retry-after'];
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
};

// 서버가 Retry-After 로 남은 초를 알려준다. 없으면 시간을 지어내지 않는다.
const rateLimitMessage = error => {
  const seconds = retryAfterSeconds(error);
  return seconds
    ? `요청이 많아 잠시 막혔습니다. ${seconds}초 뒤 다시 시도해 주세요.`
    : '요청이 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.';
};

// 인증 코드 발송 실패
export const sendCodeErrorMessage = error => {
  if (!error?.response) return NETWORK_MESSAGE;

  const { status, data } = error.response;
  const code = data?.code;

  if (status >= 500) {
    return '서버에 문제가 있어 인증 코드를 보내지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  if (code === 'USER-001' || code === 'CLIENT-001') {
    return '등록되지 않은 아이디입니다. 아이디를 다시 확인해 주세요.';
  }
  if (code === 'USER-012') {
    return '등록된 이메일이 없어 인증 코드를 보낼 수 없습니다. 학부 사무실에 문의해 주세요.';
  }
  if (code === 'AUTH-020') {
    return '인증 코드는 1분에 한 번만 보낼 수 있습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  if (code === 'AUTH-021') {
    return '인증 코드 요청이 너무 많습니다. 1시간 뒤 다시 시도해 주세요.';
  }
  if (status === 429) {
    return rateLimitMessage(error);
  }
  return '인증 코드를 보내지 못했습니다. 다시 시도해 주세요.';
};

// 인증 코드 확인 실패. resetResend 가 true 면 서버에 남은 코드가 없으니
// 재발송 잠금을 풀어 새 코드를 요청하게 한다.
export const verifyCodeErrorMessage = error => {
  if (!error?.response) return { message: NETWORK_MESSAGE, resetResend: false };

  const { status, data } = error.response;
  const code = data?.code;

  if (status >= 500) {
    return {
      message:
        '서버에 문제가 있어 인증 코드를 확인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
      resetResend: false,
    };
  }
  if (code === 'AUTH-014') {
    return {
      message: '인증 코드가 일치하지 않습니다. 다시 확인해 주세요.',
      resetResend: false,
    };
  }
  if (code === 'AUTH-019') {
    return {
      message:
        '인증 코드를 5회 넘게 틀려 코드가 폐기되었습니다. 인증 코드를 다시 받아 주세요.',
      resetResend: true,
    };
  }
  if (code === 'REDIS-001' || status === 404) {
    return {
      message:
        '인증 코드가 만료되었거나 아직 발송하지 않았습니다. 인증 코드를 다시 받아 주세요.',
      resetResend: true,
    };
  }
  // 시도 초과(AUTH-019)도 429 라 반드시 그 뒤에 온다. 여기 걸리는 429 는 IP 제한(CLIENT-008)이고
  // 서버에 코드는 남아 있으니 재발송 잠금은 풀지 않는다.
  if (status === 429) {
    return { message: rateLimitMessage(error), resetResend: false };
  }
  return {
    message: '인증 코드를 확인하지 못했습니다. 다시 시도해 주세요.',
    resetResend: false,
  };
};

// 비로그인 비밀번호 재설정 실패. 401(재설정 토큰 만료 AUTH-007)이나 400 AUTH-008~011(토큰
// 형식 오류)은 새 비밀번호를 다시 넣어도 소용없고 이메일 인증부터 다시 해야 한다.
// reauth 가 true 면 화면이 재설정 토큰을 지우고 이메일 인증 화면으로 보낸다.
export const resetPasswordErrorMessage = error => {
  if (!error?.response) return { message: NETWORK_MESSAGE, reauth: false };

  const { status, data } = error.response;
  const code = data?.code;

  if (status >= 500) {
    return {
      message:
        '서버에 문제가 있어 비밀번호를 변경하지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
      reauth: false,
    };
  }
  if (
    error.sessionExpired ||
    status === 401 ||
    (typeof code === 'string' && code.startsWith('AUTH-'))
  ) {
    return {
      message: '인증이 만료되었습니다. 이메일 인증을 다시 진행해 주세요.',
      reauth: true,
    };
  }
  // 400 CLIENT-001 은 요청 검증 실패인데, 이 요청에서 걸릴 수 있는 것은 새 비밀번호 규칙뿐이다.
  if (code === 'CLIENT-001') {
    return { message: PASSWORD_RULE_MESSAGE, reauth: false };
  }
  return {
    message: '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.',
    reauth: false,
  };
};

// 이메일 변경(로그인 상태) 화면의 인증 코드 발송 실패. 같은 인증 코드 흐름이지만
// 앞에 현재 비밀번호 검증과 새 이메일 검사가 붙어 실패 코드가 다르다.
// 여기서 400 CLIENT-001 은 '없는 아이디'가 아니라 새 이메일 형식·길이 오류다.
export const changeEmailSendErrorMessage = error => {
  if (!error?.response) return NETWORK_MESSAGE;
  if (error.sessionExpired) return SESSION_EXPIRED_MESSAGE;

  const { status, data } = error.response;
  const code = data?.code;

  if (status >= 500) {
    return '서버에 문제가 있어 인증 코드를 보내지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  if (code === 'USER-006') {
    return '현재 비밀번호가 맞지 않습니다. 다시 확인해 주세요.';
  }
  if (code === 'USER-011') {
    return '지금 쓰고 있는 이메일 주소입니다. 다른 주소를 입력해 주세요.';
  }
  if (code === 'USER-005') {
    return '이미 등록된 이메일 주소입니다. 다른 주소를 입력해 주세요.';
  }
  if (code === 'CLIENT-001') {
    return '새 이메일 주소 형식을 확인해 주세요.';
  }
  if (code === 'AUTH-020') {
    return '인증 코드는 1분에 한 번만 보낼 수 있습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  if (code === 'AUTH-021') {
    return '인증 코드 요청이 너무 많습니다. 1시간 뒤 다시 시도해 주세요.';
  }
  if (status === 429) {
    return rateLimitMessage(error);
  }
  return '인증 코드를 보내지 못했습니다. 다시 시도해 주세요.';
};

// 이메일 변경 화면의 인증 코드 확인 실패. 코드 판정은 비밀번호 찾기와 같고,
// 로그인 상태라 세션 만료만 따로 안내한다.
export const changeEmailVerifyErrorMessage = error => {
  if (error?.sessionExpired) {
    return { message: SESSION_EXPIRED_MESSAGE, resetResend: false };
  }
  return verifyCodeErrorMessage(error);
};
