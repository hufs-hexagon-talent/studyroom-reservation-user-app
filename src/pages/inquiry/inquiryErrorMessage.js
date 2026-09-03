// 문의 접수·수정·삭제 실패를 학생용 문구로 바꾼다. 서버 원문(data.message)은 쓰지 않는다.
const INQUIRY_ERROR_MESSAGES = {
  'INQUIRY-001': '문의를 찾을 수 없습니다. 목록을 새로 고쳤습니다.',
  'INQUIRY-002':
    '선택한 예약을 찾을 수 없습니다. 본인 예약만 선택할 수 있습니다.',
  'INQUIRY-003': '처리 완료된 문의는 수정하거나 삭제할 수 없습니다.',
  'AUTH-002': '본인 문의만 수정하거나 삭제할 수 있습니다.',
  'CLIENT-008': '문의 접수가 너무 많습니다. 잠시 뒤 다시 시도해 주세요.',
};

export const INQUIRY_FAILED_MESSAGE =
  '문의 처리에 실패했습니다. 잠시 뒤 다시 시도해 주세요.';

const RESERVATION_FIELD_MESSAGE = '예약을 선택해 주세요.';

// ATTENDANCE 문의는 예약 선택이 필수다. 서버는 이를 CLIENT-001 + errors[].field 로 알리는데,
// 실제 field 명은 @AssertTrue 파생 프로퍼티명인 reservationIdPresentForAttendance 로 온다
// (설계 문서 서술의 reservationId 가 아니다 — 서버에서 Bean Validation 으로 실측 확인됨).
// 어느 이름으로 오든 같은 문구로 잡는다.
const RESERVATION_FIELDS = [
  'reservationId',
  'reservationIdPresentForAttendance',
];

const hasReservationFieldError = errors =>
  Array.isArray(errors) &&
  errors.some(item => RESERVATION_FIELDS.includes(item?.field));

// 인터셉터가 세션 만료로 확정한 오류는 SessionExpiryWatcher 가 안내하므로 null 을 돌려
// 스낵바를 생략하게 한다.
// 서버 코드 문자열에 앞뒤 공백이 섞여 오는 경우가 있어 정리해서 비교한다.
export const inquiryErrorMessage = error => {
  if (error?.sessionExpired) return null;

  const code = error?.response?.data?.code;
  const normalized = typeof code === 'string' ? code.trim() : null;

  if (normalized === 'CLIENT-001') {
    const errors = error?.response?.data?.errors;
    if (hasReservationFieldError(errors)) return RESERVATION_FIELD_MESSAGE;
  }

  return INQUIRY_ERROR_MESSAGES[normalized] || INQUIRY_FAILED_MESSAGE;
};
