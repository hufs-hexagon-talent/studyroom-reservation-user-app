import React from 'react';
import { fireEvent, render } from '@testing-library/react';

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

describe('ReservationTimeTable 접근성', () => {
  it('칸마다 호실과 시각과 상태를 읽을 수 있는 이름이 붙는다', () => {
    const { container } = setup();
    const first = container.querySelector('tbody [data-time-index="0"]');
    expect(first).toHaveAttribute('aria-label', '세미나실-1 09:00 예약 가능');
  });

  it('고를 수 없는 칸은 aria-disabled 다', () => {
    const { container } = setup({
      rooms: [
        room({
          reservationTimeRanges: [
            {
              startDateTime: '2099-01-01T09:00:00',
              endDateTime: '2099-01-01T09:30:00',
            },
          ],
        }),
      ],
    });
    const first = container.querySelector('tbody [data-time-index="0"]');
    expect(first).toHaveAttribute('aria-disabled', 'true');
  });

  it('엔터로도 칸을 고를 수 있다', () => {
    const onCellClick = jest.fn();
    const { container } = setup({ onCellClick });
    const first = container.querySelector('tbody [data-time-index="0"]');
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(onCellClick).toHaveBeenCalledTimes(1);
  });

  it('표에 무엇을 담은 표인지 설명이 있다', () => {
    const { container } = setup();
    expect(container.querySelector('caption').textContent).toBe(
      '호실별 30분 단위 예약 현황',
    );
  });
});
