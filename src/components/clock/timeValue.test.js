import {
  floorToSlot,
  isSlotAligned,
  parseTimeValue,
  toApiTime,
} from './timeValue';

describe('parseTimeValue', () => {
  it('초가 있든 없든 두 자리로 맞춘 시·분·초를 돌려준다', () => {
    expect(parseTimeValue('09:00')).toEqual({
      hour: '09',
      minute: '00',
      second: '00',
    });
    expect(parseTimeValue('23:59:59')).toEqual({
      hour: '23',
      minute: '59',
      second: '59',
    });
    expect(parseTimeValue('9:5')).toEqual({
      hour: '09',
      minute: '05',
      second: '00',
    });
  });

  it('문자열이 아니면 null — TimePicker 가 Date 를 받아도 렌더 중 죽지 않는다', () => {
    expect(parseTimeValue(new Date())).toBeNull();
    expect(parseTimeValue(undefined)).toBeNull();
    expect(parseTimeValue(null)).toBeNull();
  });

  it('형태나 범위가 어긋나면 null', () => {
    expect(parseTimeValue('')).toBeNull();
    expect(parseTimeValue('abc')).toBeNull();
    expect(parseTimeValue('25:00')).toBeNull();
    expect(parseTimeValue('09:70')).toBeNull();
    // 초 범위를 안 보면 서버가 본문 파싱에서 떨어져 사유 없는 400 이 된다
    expect(parseTimeValue('09:00:99')).toBeNull();
  });
});

describe('toApiTime', () => {
  it('서버가 받는 HH:mm:ss 로 맞추고 이미 초가 있으면 덧붙이지 않는다', () => {
    expect(toApiTime('09:30')).toBe('09:30:00');
    expect(toApiTime('23:59:59')).toBe('23:59:59');
  });

  it('시각 문자열이 아니면 null 이라 전송 전에 걸러진다', () => {
    expect(toApiTime(new Date())).toBeNull();
    expect(toApiTime('')).toBeNull();
  });
});

describe('isSlotAligned', () => {
  it('서버 SlotAlignedTimeValidator 와 같은 규칙으로 판정한다', () => {
    expect(isSlotAligned('09:00')).toBe(true);
    expect(isSlotAligned('09:30:00')).toBe(true);
    expect(isSlotAligned('09:20')).toBe(false);
    expect(isSlotAligned('23:59:59')).toBe(false);
    expect(isSlotAligned('09:00:30')).toBe(false);
  });

  it('파싱하지 못한 값은 격자에 맞다고 하지 않는다', () => {
    expect(isSlotAligned(new Date())).toBe(false);
    expect(isSlotAligned('')).toBe(false);
  });
});

describe('floorToSlot', () => {
  it('바로 아래 격자로 내린다', () => {
    expect(floorToSlot('23:59:59')).toBe('23:30:00');
    expect(floorToSlot('09:20')).toBe('09:00:00');
  });

  it('이미 격자에 맞으면 그대로 둔다', () => {
    expect(floorToSlot('09:30')).toBe('09:30:00');
  });

  it('파싱하지 못하면 null 이라 정정 버튼을 띄우지 않는다', () => {
    expect(floorToSlot(new Date())).toBeNull();
  });
});
