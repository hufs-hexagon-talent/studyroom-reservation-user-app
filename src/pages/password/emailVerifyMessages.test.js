import {
  RESEND_COOLDOWN_SECONDS,
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
