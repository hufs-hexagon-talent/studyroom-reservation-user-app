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
  if (code === 'AUTH-020') {
    return '인증 코드는 1분에 한 번만 보낼 수 있습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  if (code === 'AUTH-021') {
    return '인증 코드 요청이 너무 많습니다. 1시간 뒤 다시 시도해 주세요.';
  }
  if (status === 429) {
    const seconds = retryAfterSeconds(error);
    return seconds
      ? `요청이 많아 잠시 막혔습니다. ${seconds}초 뒤 다시 시도해 주세요.`
      : '요청이 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.';
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
  return {
    message: '인증 코드를 확인하지 못했습니다. 다시 시도해 주세요.',
    resetResend: false,
  };
};
