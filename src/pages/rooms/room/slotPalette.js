// 칸 상태별 색과 라벨. 시각 정리는 이 파일만 고친다.
export const SLOT_PALETTE = {
  free: { background: '#F1EEE9', pattern: null, mark: null },
  selected: { background: '#7599BA', pattern: null, mark: null },
  reserved: { background: '#002D56', pattern: null, mark: '✕' },
  past: { background: '#E3E1DE', pattern: null, mark: null },
  closed: {
    background: '#CFCFCF',
    pattern:
      'repeating-linear-gradient(45deg, transparent 0 4px, rgba(0,0,0,0.09) 4px 8px)',
    mark: null,
  },
};

export const SLOT_LABEL = {
  free: '예약 가능',
  selected: '예약 선택',
  reserved: '예약 완료',
  past: '지난 시간',
  closed: '운영시간 외',
};
