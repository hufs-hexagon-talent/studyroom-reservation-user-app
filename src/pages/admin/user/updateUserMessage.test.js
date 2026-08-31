import {
  UPDATE_USER_DUPLICATED_MESSAGE,
  UPDATE_USER_FAILED_MESSAGE,
  UPDATE_USER_FORBIDDEN_MESSAGE,
  updateUserErrorMessage,
} from './updateUserMessage';

const httpError = (status, code, errors) => ({
  response: {
    status,
    data: { code, message: '서버 원문', errors },
  },
});

describe('updateUserErrorMessage', () => {
  it('담당 호실·학과 관련 코드는 고칠 방법이 보이는 문구로 바꾼다', () => {
    expect(updateUserErrorMessage(httpError(404, 'ROOM-001'))).toBe(
      '선택한 호실을 찾을 수 없습니다. 목록을 새로 고친 뒤 다시 선택해 주세요.',
    );
    expect(updateUserErrorMessage(httpError(404, 'DEPARTMENT-001'))).toBe(
      '선택한 학과를 찾을 수 없습니다. 목록을 새로 고친 뒤 다시 선택해 주세요.',
    );
    expect(updateUserErrorMessage(httpError(400, 'USER-013'))).toBe(
      '관리실 계정으로 바꾸려면 담당 호실을 함께 지정해 주세요.',
    );
    expect(updateUserErrorMessage(httpError(400, 'USER-014'))).toBe(
      '담당 호실은 관리실 계정에만 지정할 수 있습니다.',
    );
    expect(updateUserErrorMessage(httpError(400, 'USER-015'))).toBe(
      '담당 호실은 계정과 같은 부서의 호실만 지정할 수 있습니다.',
    );
  });

  it('코드 앞뒤 공백은 무시한다', () => {
    expect(updateUserErrorMessage(httpError(404, ' ROOM-001'))).toBe(
      '선택한 호실을 찾을 수 없습니다. 목록을 새로 고친 뒤 다시 선택해 주세요.',
    );
  });

  it('400 CLIENT-001 은 걸린 칸을 모두 알려준다', () => {
    expect(
      updateUserErrorMessage(
        httpError(400, 'CLIENT-001', [{ field: 'roomId' }]),
      ),
    ).toBe(
      '선택한 호실을 찾을 수 없습니다. 화면을 새로 고친 뒤 다시 선택해 주세요.',
    );

    const message = updateUserErrorMessage(
      httpError(400, 'CLIENT-001', [{ field: 'email' }, { field: 'serial' }]),
    );
    expect(message).toContain('학번을 다시 확인해 주세요.');
    expect(message).toContain('이메일 주소 형식을 다시 확인해 주세요.');
  });

  it('403 은 권한 문제로 안내한다. 다시 로그인해도 풀리지 않기 때문이다', () => {
    const message = updateUserErrorMessage(httpError(403, 'AUTH-002'));

    expect(message).toBe(UPDATE_USER_FORBIDDEN_MESSAGE);
    expect(message).not.toContain('로그인이 만료');
  });

  it('중복 값 충돌은 겹침을 먼저 의심하게 안내한다', () => {
    expect(updateUserErrorMessage(httpError(409, 'CLIENT-009'))).toBe(
      UPDATE_USER_DUPLICATED_MESSAGE,
    );
  });

  it('5xx 로는 겹침을 안내하지 않는다. 그 자리에 DB 순단이 온다', () => {
    // 유니크 충돌은 GlobalExceptionHandler 가 409 로 내리므로 위 분기가 잡는다.
    // 반대로 인증 경로의 DB 순단이 503 SYS-002 로 여기 도달하는데, 그때 학번·이메일을
    // 의심하게 하면 관리자가 멀쩡한 값을 계속 고쳐 보게 된다.
    expect(updateUserErrorMessage(httpError(503, 'SYS-002'))).toBe(
      UPDATE_USER_FAILED_MESSAGE,
    );
    expect(updateUserErrorMessage(httpError(500, 'SYS-001'))).not.toContain(
      '겹치지',
    );
  });

  it('응답 없음은 네트워크 문구이고 미매핑 코드는 일반 실패 문구다', () => {
    expect(updateUserErrorMessage(new Error('Network Error'))).toBe(
      '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
    );
    expect(updateUserErrorMessage(httpError(404, 'ROOM-002'))).toBe(
      UPDATE_USER_FAILED_MESSAGE,
    );
  });

  it('어떤 분기에서도 서버 원문을 그대로 돌려주지 않는다', () => {
    const cases = [
      httpError(404, 'ROOM-001'),
      httpError(400, 'CLIENT-001', [{ field: 'roomId' }]),
      httpError(403, 'AUTH-002'),
      httpError(409, 'CLIENT-002'),
      httpError(500, 'SERVER-001'),
      httpError(404, 'ROOM-002'),
    ];

    cases.forEach(error => {
      expect(updateUserErrorMessage(error)).not.toContain('서버 원문');
    });
  });

  it('세션 만료로 확정된 오류는 스낵바를 생략한다', () => {
    const error = httpError(401, 'AUTH-013');
    error.sessionExpired = true;

    expect(updateUserErrorMessage(error)).toBeNull();
  });
});
