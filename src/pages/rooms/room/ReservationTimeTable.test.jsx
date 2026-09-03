import React from 'react';
import { render } from '@testing-library/react';

import ReservationTimeTable from './ReservationTimeTable';

const room = (over = {}) => ({
  partitionId: 1,
  roomName: '세미나실',
  partitionNumber: 1,
  operationStartTime: '09:00:00',
  operationEndTime: '11:00:00',
  eachMaxMinute: 120,
  reservationTimeRanges: [],
  ...over,
});

// 마지막 항목은 종료 경계라 본문에 칸이 생기지 않는다
const times = ['09:00', '09:30', '10:00', '10:30', '11:00'];

const setup = (over = {}) =>
  render(
    <ReservationTimeTable
      rooms={[room()]}
      times={times}
      selectedDate="2099-01-01"
      now={new Date('2099-01-01T00:00:00')}
      selection={null}
      onCellClick={jest.fn()}
      {...over}
    />,
  );

describe('ReservationTimeTable 열 구성', () => {
  it('헤더의 시각 열 수가 본문의 칸 수와 같다', () => {
    const { container } = setup();
    const headSlots = container.querySelectorAll('thead [data-time-index]');
    const bodySlots = container.querySelectorAll('tbody [data-time-index]');
    expect(headSlots.length).toBe(times.length - 1);
    expect(bodySlots.length).toBe(times.length - 1);
  });

  it('첫 시각 라벨이 잘리지 않고 그대로 렌더된다', () => {
    const { container } = setup();
    const first = container.querySelector('thead [data-time-index="0"]');
    expect(first.textContent).toBe('09:00');
  });

  it('운영 종료 시각을 표 끝에 캡션으로 보여준다', () => {
    const { getByText } = setup();
    expect(getByText('11:00 운영 종료')).toBeInTheDocument();
  });
});
