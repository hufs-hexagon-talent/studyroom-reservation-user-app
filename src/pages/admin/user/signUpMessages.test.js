import { signUpErrorMessage } from './signUpMessages';

const httpError = (status, code, errors, headers = {}) => ({
  response: {
    status,
    headers,
    data: {
      code,
      message: '잘못된 요청입니다. 요청 내용을 다시 확인해주세요.',
      errors,
    },
  },
});

describe('signUpErrorMessage', () => {
  it('응답이 없으면 네트워크 안내', () => {
    expect(signUpErrorMessage(new Error('Network Error'))).toBe(
      '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
    );
  });

  it('중복된 아이디·학번·이메일을 칸별로 알려준다', () => {
    expect(
      signUpErrorMessage(httpError(400, 'CLIENT-001', [{ field: 'username' }])),
    ).toBe('이미 등록된 아이디입니다. 다른 아이디를 입력해주세요.');
    expect(
      signUpErrorMessage(httpError(400, 'CLIENT-001', [{ field: 'serial' }])),
    ).toBe('이미 등록된 학번입니다. 학번을 다시 확인해주세요.');
    expect(
      signUpErrorMessage(httpError(400, 'CLIENT-001', [{ field: 'email' }])),
    ).toBe('이미 등록된 이메일 주소이거나 형식이 올바르지 않습니다.');
  });

  it('없는 학과(400 CLIENT-001 departmentId)는 미선택 안내가 아니라 새로고침 안내', () => {
    const message = signUpErrorMessage(
      httpError(400, 'CLIENT-001', [{ field: 'departmentId' }]),
    );
    expect(message).toBe(
      '선택한 학과를 찾을 수 없습니다. 화면을 새로 고친 뒤 다시 선택해주세요.',
    );
    expect(message).not.toContain('학과를 선택해주세요');
  });

  it('여러 칸이 한꺼번에 걸리면 전부 알려주고 errors 순서에 흔들리지 않는다', () => {
    const forward = signUpErrorMessage(
      httpError(400, 'CLIENT-001', [
        { field: 'username' },
        { field: 'serial' },
      ]),
    );
    const reversed = signUpErrorMessage(
      httpError(400, 'CLIENT-001', [
        { field: 'serial' },
        { field: 'username' },
      ]),
    );
    expect(forward).toContain(
      '이미 등록된 아이디입니다. 다른 아이디를 입력해주세요.',
    );
    expect(forward).toContain(
      '이미 등록된 학번입니다. 학번을 다시 확인해주세요.',
    );
    expect(reversed).toBe(forward);
  });

  it('모르는 칸이면 일반 입력 확인 문구', () => {
    expect(
      signUpErrorMessage(httpError(400, 'CLIENT-001', [{ field: 'nickname' }])),
    ).toBe('입력값을 다시 확인해주세요.');
    expect(signUpErrorMessage(httpError(400, 'CLIENT-001'))).toBe(
      '입력값을 다시 확인해주세요.',
    );
  });

  it('요청 제한(429)은 남은 초를 알려주고, 없으면 시간을 지어내지 않는다', () => {
    expect(
      signUpErrorMessage(
        httpError(429, 'CLIENT-008', undefined, { 'retry-after': '42' }),
      ),
    ).toBe('요청이 많아 잠시 막혔습니다. 42초 뒤 다시 시도해 주세요.');
    expect(signUpErrorMessage(httpError(429, 'CLIENT-008'))).toBe(
      '요청이 많아 잠시 막혔습니다. 잠시 뒤 다시 시도해 주세요.',
    );
  });

  it('권한이 없으면(401·403) 재로그인 안내', () => {
    const expected =
      '계정 생성 권한이 없습니다. 관리자 계정으로 다시 로그인해 주세요.';
    expect(signUpErrorMessage(httpError(401, 'AUTH-001'))).toBe(expected);
    expect(signUpErrorMessage(httpError(403, 'AUTH-002'))).toBe(expected);
  });

  it('5xx 는 서버 문제 안내이고 서버 원문은 쓰지 않는다', () => {
    const message = signUpErrorMessage(httpError(500, 'SERVER-001'));
    expect(message).toBe(
      '서버에 문제가 있어 계정을 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    );
    expect(message).not.toContain('잘못된 요청입니다');
  });

  it('세션 만료는 SessionExpiryWatcher 몫이라 문구를 만들지 않는다', () => {
    const error = httpError(401, 'AUTH-013');
    error.sessionExpired = true;
    expect(signUpErrorMessage(error)).toBeNull();
  });

  it('미매핑 코드는 서버 원문 없이 일반 실패 문구', () => {
    const message = signUpErrorMessage(httpError(404, 'DEPARTMENT-001'));
    expect(message).toBe('계정을 만들지 못했습니다. 다시 시도해 주세요.');
    expect(message).not.toContain('잘못된 요청입니다');
  });
});
