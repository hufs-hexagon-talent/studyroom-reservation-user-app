import { shortDateLabel } from './dateLabel';

describe('shortDateLabel', () => {
  it('오늘이면 뒤에 (오늘) 을 붙인다', () => {
    expect(shortDateLabel(new Date())).toBe(`${formatToday()} (오늘)`);
  });

  it('오늘이 아니면 아무것도 붙이지 않는다', () => {
    expect(shortDateLabel(new Date('2020-01-15T10:00:00'))).toBe('1월 15일');
  });

  it('한 자리 월·일도 앞에 0을 붙이지 않는다', () => {
    // 실제로 돌아가는 날과 절대 겹치지 않도록 10년 뒤로 고정한다
    const future = new Date();
    future.setFullYear(future.getFullYear() + 10, 2, 7);
    future.setHours(10, 0, 0, 0);
    expect(shortDateLabel(future)).toBe('3월 7일');
  });
});

// 테스트를 실제로 언제 돌리든 오늘 날짜의 기대값을 스스로 계산한다
function formatToday() {
  const now = new Date();
  return `${now.getMonth() + 1}월 ${now.getDate()}일`;
}
