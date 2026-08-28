import {
  CANCEL_FAILED_MESSAGE,
  cancelReservationErrorMessage,
} from './cancelReservationMessage';

const httpError = (status, code) => ({
  response: { status, data: { code, message: '서버 원문' } },
});

describe('cancelReservationErrorMessage', () => {
  it('업무 규칙 코드는 학생용 문구로 바꾼다', () => {
    expect(
      cancelReservationErrorMessage(httpError(412, 'RESERVATION-010')),
    ).toBe('이미 출석한 예약은 취소할 수 없습니다.');
    expect(
      cancelReservationErrorMessage(httpError(412, 'RESERVATION-011')),
    ).toBe('이미 시작된 예약은 취소할 수 없습니다.');
    expect(cancelReservationErrorMessage(httpError(403, 'AUTH-002'))).toBe(
      '본인 예약만 취소할 수 있습니다.',
    );
  });

  it('이미 사라진 예약(RESERVATION-001)은 다시 시도하라고 하지 않는다', () => {
    const message = cancelReservationErrorMessage(
      httpError(404, 'RESERVATION-001'),
    );

    expect(message).toBe(
      '이미 취소되었거나 없는 예약입니다. 목록을 새로 고쳤습니다.',
    );
    expect(message).not.toBe(CANCEL_FAILED_MESSAGE);
  });

  it('코드 앞뒤 공백은 무시한다', () => {
    expect(
      cancelReservationErrorMessage(httpError(412, ' RESERVATION-010')),
    ).toBe('이미 출석한 예약은 취소할 수 없습니다.');
  });

  it('미매핑 코드·응답 없음은 일반 실패 문구이고 서버 원문은 쓰지 않는다', () => {
    expect(cancelReservationErrorMessage(httpError(500, 'SERVER-001'))).toBe(
      CANCEL_FAILED_MESSAGE,
    );
    expect(cancelReservationErrorMessage(new Error('Network Error'))).toBe(
      CANCEL_FAILED_MESSAGE,
    );
  });

  it('매핑된 코드여도 서버 원문을 그대로 돌려주지 않는다', () => {
    expect(
      cancelReservationErrorMessage(httpError(404, 'RESERVATION-001')),
    ).not.toContain('서버 원문');
  });

  it('세션 만료로 확정된 오류는 스낵바를 생략한다', () => {
    const error = httpError(401, 'AUTH-013');
    error.sessionExpired = true;
    expect(cancelReservationErrorMessage(error)).toBeNull();
  });
});
