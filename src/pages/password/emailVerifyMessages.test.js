import {
  RESEND_COOLDOWN_SECONDS,
  changeEmailSendErrorMessage,
  changeEmailVerifyErrorMessage,
  resetPasswordErrorMessage,
  sendCodeErrorMessage,
  verifyCodeErrorMessage,
} from './emailVerifyMessages';

const httpError = (status, code, headers = {}) => ({
  response: { status, headers, data: { code, message: '서버 원문' } },
});

describe('sendCodeErrorMessage', () => {
  it('재발송 잠금은 서버 쿨다운 60초와 같다', () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
  });

  it('응답이 없으면 네트워크 안내', () => {
    expect(sendCodeErrorMessage(new Error('Network Error'))).toBe(
      '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
    );
  });

  it('없는 아이디(400 CLIENT-001, 404 USER-001)는 아이디 확인 안내', () => {
    const expected = '등록되지 않은 아이디입니다. 아이디를 다시 확인해 주세요.';
    expect(sendCodeErrorMessage(httpError(400, 'CLIENT-001'))).toBe(expected);
    expect(sendCodeErrorMessage(httpError(404, 'USER-001'))).toBe(expected);
  });

  it('등록된 이메일이 없으면(400 USER-012) 학부 사무실 문의 안내', () => {
    expect(sendCodeErrorMessage(httpError(400, 'USER-012'))).toBe(
      '등록된 이메일이 없어 인증 코드를 보낼 수 없습니다. 학부 사무실에 문의해 주세요.',
    );
  });

  it('429 는 재발송 제한·시간당 상한·IP 제한을 구분한다', () => {
    expect(sendCodeErrorMessage(httpError(429, 'AUTH-020'))).toBe(
      '인증 코드는 1분에 한 번만 보낼 수 있습니다. 잠시 뒤 다시 시도해 주세요.',
    );
    expect(sendCodeErrorMessage(httpError(429, 'AUTH-021'))).toBe(
      '인증 코드 요청이 너무 많습니다. 1시간 뒤 다시 시도해 주세요.',
    );
    expect(
      sendCodeErrorMessage(
        httpError(429, 'CLIENT-008', { 'retry-after': '42' }),
      ),
    ).toBe('요청이 많아 잠시 막혔습니다. 42초 뒤 다시 시도해 주세요.');
    expect(sendCodeErrorMessage(httpError(429, 'CLIENT-008'))).toBe(
      '요청이 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.',
    );
  });

  it('5xx 는 서버 문제 안내이고 서버 원문은 쓰지 않는다', () => {
    const message = sendCodeErrorMessage(httpError(500, 'AUTH-015'));
    expect(message).toBe(
      '서버에 문제가 있어 인증 코드를 보내지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    );
    expect(message).not.toContain('서버 원문');
  });

  it('미매핑 코드는 일반 실패 문구', () => {
    expect(sendCodeErrorMessage(httpError(400, 'SOMETHING-999'))).toBe(
      '인증 코드를 보내지 못했습니다. 다시 시도해 주세요.',
    );
  });
});

describe('verifyCodeErrorMessage', () => {
  it('불일치(AUTH-014)는 잠금을 유지한다', () => {
    expect(verifyCodeErrorMessage(httpError(409, 'AUTH-014'))).toEqual({
      message: '인증 코드가 일치하지 않습니다. 다시 확인해 주세요.',
      resetResend: false,
    });
  });

  it('시도 초과(AUTH-019)와 만료(REDIS-001)는 재발송을 유도한다', () => {
    expect(verifyCodeErrorMessage(httpError(429, 'AUTH-019'))).toEqual({
      message:
        '인증 코드를 5회 넘게 틀려 코드가 폐기되었습니다. 인증 코드를 다시 받아 주세요.',
      resetResend: true,
    });
    expect(verifyCodeErrorMessage(httpError(404, 'REDIS-001'))).toEqual({
      message:
        '인증 코드가 만료되었거나 아직 발송하지 않았습니다. 인증 코드를 다시 받아 주세요.',
      resetResend: true,
    });
  });

  it('요청 제한(429 CLIENT-008)은 남은 초를 안내하고 잠금은 유지한다', () => {
    expect(
      verifyCodeErrorMessage(
        httpError(429, 'CLIENT-008', { 'retry-after': '37' }),
      ),
    ).toEqual({
      message: '요청이 많아 잠시 막혔습니다. 37초 뒤 다시 시도해 주세요.',
      resetResend: false,
    });
    expect(verifyCodeErrorMessage(httpError(429, 'CLIENT-008'))).toEqual({
      message: '요청이 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.',
      resetResend: false,
    });
  });

  it('시도 초과(AUTH-019)도 429 라 요청 제한 분기보다 먼저 걸린다', () => {
    expect(
      verifyCodeErrorMessage(
        httpError(429, 'AUTH-019', { 'retry-after': '37' }),
      ),
    ).toEqual({
      message:
        '인증 코드를 5회 넘게 틀려 코드가 폐기되었습니다. 인증 코드를 다시 받아 주세요.',
      resetResend: true,
    });
  });

  it('네트워크·5xx·미매핑은 일반 안내', () => {
    expect(verifyCodeErrorMessage({}).message).toBe(
      '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
    );
    expect(verifyCodeErrorMessage(httpError(500, 'AUTH-018')).message).toBe(
      '서버에 문제가 있어 인증 코드를 확인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    );
    expect(verifyCodeErrorMessage(httpError(400, 'X-1')).message).toBe(
      '인증 코드를 확인하지 못했습니다. 다시 시도해 주세요.',
    );
  });
});

describe('changeEmailSendErrorMessage', () => {
  it('비밀번호 불일치(USER-006)와 같은 이메일(USER-011)을 구분한다', () => {
    expect(changeEmailSendErrorMessage(httpError(400, 'USER-006'))).toBe(
      '현재 비밀번호가 맞지 않습니다. 다시 확인해 주세요.',
    );
    expect(changeEmailSendErrorMessage(httpError(400, 'USER-011'))).toBe(
      '지금 쓰고 있는 이메일 주소입니다. 다른 주소를 입력해 주세요.',
    );
  });

  it('이메일 형식 오류(400 CLIENT-001)는 아이디 안내가 아니라 이메일 안내', () => {
    const message = changeEmailSendErrorMessage(httpError(400, 'CLIENT-001'));
    expect(message).toBe('새 이메일 주소 형식을 확인해 주세요.');
    expect(message).not.toContain('아이디');
    expect(message).not.toContain('서버 원문');
  });

  it('재발송 제한·요청 제한을 구분한다', () => {
    expect(changeEmailSendErrorMessage(httpError(429, 'AUTH-020'))).toBe(
      '인증 코드는 1분에 한 번만 보낼 수 있습니다. 잠시 뒤 다시 시도해 주세요.',
    );
    expect(
      changeEmailSendErrorMessage(
        httpError(429, 'CLIENT-008', { 'retry-after': '12' }),
      ),
    ).toBe('요청이 많아 잠시 막혔습니다. 12초 뒤 다시 시도해 주세요.');
  });

  it('세션이 만료됐으면 재로그인 안내', () => {
    const error = httpError(401, 'AUTH-013');
    error.sessionExpired = true;
    expect(changeEmailSendErrorMessage(error)).toBe(
      '로그인이 만료되었습니다. 다시 로그인해 주세요.',
    );
  });

  it('미매핑 코드는 서버 원문 없이 일반 실패 문구', () => {
    const message = changeEmailSendErrorMessage(httpError(400, 'X-999'));
    expect(message).toBe('인증 코드를 보내지 못했습니다. 다시 시도해 주세요.');
    expect(message).not.toContain('서버 원문');
  });
});

describe('changeEmailVerifyErrorMessage', () => {
  it('만료된 코드(404 REDIS-001)는 서버 원문 대신 재발송 안내', () => {
    const result = changeEmailVerifyErrorMessage(httpError(404, 'REDIS-001'));
    expect(result).toEqual({
      message:
        '인증 코드가 만료되었거나 아직 발송하지 않았습니다. 인증 코드를 다시 받아 주세요.',
      resetResend: true,
    });
    expect(result.message).not.toContain('서버 원문');
  });

  it('세션이 만료됐으면 재로그인 안내', () => {
    const error = httpError(401, 'AUTH-013');
    error.sessionExpired = true;
    expect(changeEmailVerifyErrorMessage(error)).toEqual({
      message: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
      resetResend: false,
    });
  });
});

describe('resetPasswordErrorMessage', () => {
  const reauth = {
    message: '인증이 만료되었습니다. 이메일 인증을 다시 진행해 주세요.',
    reauth: true,
  };

  it('응답이 없으면 네트워크 안내', () => {
    expect(resetPasswordErrorMessage(new Error('Network Error'))).toEqual({
      message:
        '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
      reauth: false,
    });
  });

  it('만료된 재설정 토큰(401 AUTH-007)은 서버 원문 대신 재인증 안내', () => {
    expect(resetPasswordErrorMessage(httpError(401, 'AUTH-007'))).toEqual(
      reauth,
    );
  });

  it('인터셉터가 세션 만료로 바꾼 오류도 재인증 안내', () => {
    const error = httpError(401, 'AUTH-013');
    error.sessionExpired = true;
    expect(resetPasswordErrorMessage(error)).toEqual(reauth);
  });

  it('토큰 형식 오류(400 AUTH-008)도 재인증 안내', () => {
    expect(resetPasswordErrorMessage(httpError(400, 'AUTH-008'))).toEqual(
      reauth,
    );
  });

  it('5xx 는 서버 문제 안내', () => {
    expect(resetPasswordErrorMessage(httpError(500, 'AUTH-015'))).toEqual({
      message:
        '서버에 문제가 있어 비밀번호를 변경하지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
      reauth: false,
    });
  });

  it('그 밖의 4xx 는 서버 원문 없이 일반 실패 문구', () => {
    const result = resetPasswordErrorMessage(httpError(400, 'CLIENT-001'));
    expect(result).toEqual({
      message: '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.',
      reauth: false,
    });
    expect(result.message).not.toContain('서버 원문');
  });
});
