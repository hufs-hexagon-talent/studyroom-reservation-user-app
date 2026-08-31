import { loginErrorMessage } from './loginErrorMessage';

const httpError = (status, code, headers = {}) => ({
  response: {
    status,
    headers,
    data: {
      code,
      message: '[사용자 인증에 실패] 아이디 혹은 비밀번호를 확인해주세요.',
    },
  },
});

describe('loginErrorMessage', () => {
  it('응답이 없으면 네트워크 안내', () => {
    expect(loginErrorMessage(new Error('Network Error'))).toBe(
      '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
    );
  });

  it('자격증명 실패(401 AUTH-001)는 서버 원문 대신 학생용 문구', () => {
    const message = loginErrorMessage(httpError(401, 'AUTH-001'));
    expect(message).toBe(
      '아이디 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.',
    );
    expect(message).not.toContain('[');
  });

  it('AUTH-004·USER-001 도 같은 문구라 아이디 존재 여부가 드러나지 않는다', () => {
    const expected =
      '아이디 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.';
    expect(loginErrorMessage(httpError(401, 'AUTH-004'))).toBe(expected);
    expect(loginErrorMessage(httpError(404, 'USER-001'))).toBe(expected);
  });

  it('429 는 Retry-After 의 남은 초를 안내에 넣는다', () => {
    expect(
      loginErrorMessage(httpError(429, 'CLIENT-008', { 'retry-after': '48' })),
    ).toBe('로그인 시도가 많아 잠시 막혔습니다. 48초 뒤 다시 시도해 주세요.');
  });

  it('Retry-After 가 없거나 쓸 수 없으면 시간을 지어내지 않는다', () => {
    const expected =
      '로그인 시도가 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.';
    expect(loginErrorMessage(httpError(429, 'CLIENT-008'))).toBe(expected);
    expect(
      loginErrorMessage(httpError(429, 'CLIENT-008', { 'retry-after': 'x' })),
    ).toBe(expected);
  });

  it('5xx 는 서버 문제 안내', () => {
    expect(loginErrorMessage(httpError(500, 'SYS-001'))).toBe(
      '서버에 문제가 있어 로그인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    );
  });

  it('입력 누락(400 CLIENT-001)은 입력 안내', () => {
    expect(loginErrorMessage(httpError(400, 'CLIENT-001'))).toBe(
      '아이디와 비밀번호를 모두 입력해 주세요.',
    );
  });

  it('만료 계정(403 USER-010)은 명단에서 빠졌다는 것과 문의처를 안내한다', () => {
    expect(loginErrorMessage(httpError(403, 'USER-010'))).toBe(
      '재학생 명단에 없어 만료된 계정입니다. 학부 사무실에 문의해 주세요.',
    );
  });

  it('USER-010 이 아닌 403(AUTH-002)은 만료 안내로 새지 않는다', () => {
    expect(loginErrorMessage(httpError(403, 'AUTH-002'))).toBe(
      '로그인하지 못했습니다. 다시 시도해 주세요.',
    );
  });

  it('미매핑 4xx 는 서버 원문 없이 일반 실패 문구', () => {
    const message = loginErrorMessage(httpError(409, 'X-999'));
    expect(message).toBe('로그인하지 못했습니다. 다시 시도해 주세요.');
    expect(message).not.toContain('사용자 인증에 실패');
  });
});
