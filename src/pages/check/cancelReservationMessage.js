// 예약 취소 실패 응답을 학생용 문구로 바꾼다. 서버 원문(data.message)은 쓰지 않는다.
const CANCEL_ERROR_MESSAGES = {
  'RESERVATION-001':
    '이미 취소되었거나 없는 예약입니다. 목록을 새로 고쳤습니다.',
  'RESERVATION-010': '이미 출석한 예약은 취소할 수 없습니다.',
  'RESERVATION-011': '이미 시작된 예약은 취소할 수 없습니다.',
  'AUTH-002': '본인 예약만 취소할 수 있습니다.',
};

export const CANCEL_FAILED_MESSAGE =
  '예약 취소에 실패했습니다. 잠시 뒤 다시 시도해 주세요.';

// 인터셉터가 세션 만료로 확정한 오류는 SessionExpiryWatcher 가 안내하므로 null 을 돌려
// 스낵바를 생략하게 한다.
// 서버 코드 문자열에 앞뒤 공백이 섞여 오는 경우가 있어 정리해서 비교한다.
export const cancelReservationErrorMessage = error => {
  if (error?.sessionExpired) return null;

  const code = error?.response?.data?.code;
  const normalized = typeof code === 'string' ? code.trim() : null;
  return CANCEL_ERROR_MESSAGES[normalized] || CANCEL_FAILED_MESSAGE;
};
