// 운영 시각 문자열을 다루는 순수 모듈.
// 서버는 LocalTime 을 초가 0 이면 "HH:mm", 아니면 "HH:mm:ss" 로 내려주므로 두 형태를 모두 받는다.
// 30분 격자 규칙의 단일 진실원천은 서버(SlotAlignedTimeValidator)다. 여기 사본은 저장하기 전에
// 관리자에게 거절 사유를 미리 보여주려고 두는 것이라, 서버 규칙이 바뀌면 함께 바꿔야 한다.

// 격자 폭은 이 모듈 안에서만 쓴다. 화면은 MINUTE_OPTIONS 로 고를 값을 받고,
// 격자 판정·내림은 아래 두 함수가 대신한다.
const SLOT_MINUTES = 30;

export const MINUTE_OPTIONS = ['00', '30'];

const TIME_PATTERN = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;

const pad = value => String(value).padStart(2, '0');

// 문자열이 아니면(Date, undefined, null) null 을 돌려준다. 정책 조회가 끝나기 전 화면 상태가
// 아직 문자열이 아닐 때 TimePicker 가 렌더 중 죽지 않게 하는 방어선이다.
// 초 범위(0~59)까지 보는 것은 '09:00:99' 처럼 형태만 맞는 값이 서버로 나가면
// 검증이 아니라 본문 파싱에서 떨어져 사유 없는 400 이 되기 때문이다.
export const parseTimeValue = value => {
  if (typeof value !== 'string') return null;

  const matched = TIME_PATTERN.exec(value.trim());
  if (!matched) return null;

  const hour = Number(matched[1]);
  const minute = Number(matched[2]);
  const second = matched[3] === undefined ? 0 : Number(matched[3]);
  if (hour > 23 || minute > 59 || second > 59) return null;

  return { hour: pad(hour), minute: pad(minute), second: pad(second) };
};

// 서버가 받는 "HH:mm:ss" 로 맞춘다. 이미 초가 붙어 있으면 덧붙이지 않는다.
export const toApiTime = value => {
  const parsed = parseTimeValue(value);
  if (!parsed) return null;
  return `${parsed.hour}:${parsed.minute}:${parsed.second}`;
};

// 서버 SlotAlignedTimeValidator 와 같은 규칙이다(분이 30의 배수 && 초가 0).
export const isSlotAligned = value => {
  const parsed = parseTimeValue(value);
  if (!parsed) return false;
  return Number(parsed.minute) % SLOT_MINUTES === 0 && parsed.second === '00';
};

// 격자 밖 값을 바로 아래 격자로 내린다. 화면이 자동으로 적용하지 않고 관리자가 누르는
// 정정 버튼에서만 쓴다 — 조용히 내리면 저장 버튼만 눌러도 운영 종료가 29분 앞당겨진다.
export const floorToSlot = value => {
  const parsed = parseTimeValue(value);
  if (!parsed) return null;
  const minute = Number(parsed.minute);
  return `${parsed.hour}:${pad(minute - (minute % SLOT_MINUTES))}:00`;
};
