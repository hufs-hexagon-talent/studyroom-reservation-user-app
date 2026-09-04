import { format } from 'date-fns';

// 예약 선택 모달·예약 카드·내 문의 목록이 쓰는 표시 규칙(라벨·포맷·정렬).
// 화면 로직은 여기에만 두고 컴포넌트는 그리기만 한다.

// 출석 상태 라벨. CheckRoom.jsx 의 출석/미출석/처리됨 표기를 따르되, 아직 끝나지 않은
// NOT_VISITED 예약은 "예약 예정" 으로 나눈다 — 서버의 노쇼 판정이 종료 시각 경과
// (reservationEndTime < now) 이고 체크인도 종료 시각까지 가능하므로 경계는 종료 시각이다.
// 내일 예약에 "미출석" 이 붙으면 차단된 학생이 노쇼로 오독한다. CheckRoom 은 손대지 않았다.
export const reservationStateLabel = (reservation, now = new Date()) => {
  const state = reservation?.reservationState;
  if (state === 'VISITED') return '출석';
  if (state === 'NOT_VISITED') {
    return new Date(reservation.reservationEndTime) < now
      ? '미출석'
      : '예약 예정';
  }
  return '처리됨';
};

// 서버가 만드는 스냅샷(reservationSummary)과 같은 포맷. 수정 모드에서 두 값이 한 자리에
// 번갈아 보이고, 연도가 다른 예약이 같은 줄로 보이지 않게 연도를 붙인다.
export const formatReservationTime = reservation => {
  const start = new Date(reservation.reservationStartTime);
  const end = new Date(reservation.reservationEndTime);
  return `${format(start, 'yyyy-MM-dd HH:mm')}~${format(end, 'HH:mm')}`;
};

export const formatRoom = reservation =>
  `${reservation.roomName}-${reservation.partitionNumber}`;

// 시작시각 내림차순. 서버(/reservations/me)는 정렬을 주지 않는다. 상한은 두지 않는다 —
// 모달이 스크롤되고 서버가 이미 전량을 준다.
export const sortReservationsLatestFirst = list => {
  if (!Array.isArray(list)) return [];
  return [...list].sort(
    (a, b) =>
      new Date(b.reservationStartTime) - new Date(a.reservationStartTime),
  );
};

// 문의에 연결된 예약의 한 줄 표시. 학생이 예약을 취소하면 행이 지워져 id 는 null 이 되고
// 스냅샷 문자열만 남는다(FK ON DELETE SET NULL). 목록 카드와 폼 스냅샷 카드가 같이 쓴다.
export const CANCELED_RESERVATION_SUFFIX = ' · 취소된 예약';

export const linkedReservationLabel = inquiry => {
  if (!inquiry?.reservationSummary) return null;
  return inquiry.reservationId == null
    ? `${inquiry.reservationSummary}${CANCELED_RESERVATION_SUFFIX}`
    : inquiry.reservationSummary;
};
