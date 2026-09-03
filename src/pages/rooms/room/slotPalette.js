// 칸 상태별 색과 라벨. 시각 정리는 이 파일만 고친다.
export const SLOT_PALETTE = {
  free: { background: '#F1EEE9', pattern: null, mark: null },
  selected: { background: '#7599BA', pattern: null, mark: null },
  reserved: { background: '#002D56', pattern: null, mark: '✕' },
  past: { background: '#AAAAAA', pattern: null, mark: null },
  closed: { background: '#AAAAAA', pattern: null, mark: null },
};

export const SLOT_LABEL = {
  free: '예약 가능',
  selected: '예약 선택',
  reserved: '예약 완료',
  past: '지난 시간',
  closed: '운영시간 외',
};
