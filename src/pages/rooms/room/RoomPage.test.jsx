import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useReservations, useReserve } from '../../../api/reservation.api';

import RoomPage from './RoomPage';

jest.mock('../../../api/reservation.api', () => ({
  useReservations: jest.fn(),
  useReserve: jest.fn(),
}));
// 날짜 목록 조회는 이 시험과 무관하다. 끝나지 않게 두어 렌더 뒤 상태 변경을 막는다.
jest.mock('../../../api/policySchedule.api', () => ({
  fetchDate: jest.fn(() => new Promise(() => {})),
}));
jest.mock('../../../api/user.api', () => ({
  fetchBlockedPeriod: jest.fn(),
  isAuthError: () => false,
}));
jest.mock('../../../hooks/useAuth', () => () => ({ loggedIn: true }));
// 지나간 칸을 피하려고 먼 미래 날짜를 고정한다
jest.mock('../../../hooks/useUrlQuery', () => () => ['2099-01-01', jest.fn()]);
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('react-simple-snackbar', () => ({
  useSnackbar: () => [jest.fn(), jest.fn()],
}));
jest.mock('react-datepicker', () => ({
  __esModule: true,
  default: () => null,
  registerLocale: jest.fn(),
}));
jest.mock('../../admin/banner/Banner', () => () => null);

// 표의 칸은 09:00, 09:30, 10:00, 10:30 네 개가 된다(마지막 라벨은 경계라 렌더하지 않는다).
const room = () => ({
  partitionId: 7,
  roomName: '세미나실',
  partitionNumber: 1,
  operationStartTime: '09:00:00',
  operationEndTime: '11:00:00',
  eachMaxMinute: 120,
  reservationTimeRanges: [],
});

const selectedCells = container =>
  container.querySelectorAll('td.selected').length;

const slotCells = container =>
  Array.from(container.querySelectorAll('tbody td')).slice(1);

beforeEach(() => {
  jest.clearAllMocks();
  useReserve.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
});

describe('RoomPage 시간 선택', () => {
  it('30초마다 다시 불러와 방 객체가 새로 와도 고르던 시간을 연장할 수 있다', () => {
    useReservations.mockReturnValue({
      data: [room()],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { container, rerender } = render(<RoomPage />);

    fireEvent.click(slotCells(container)[0]);
    expect(selectedCells(container)).toBe(1);

    // 다른 학생이 예약해 재조회가 돌면 그 방 객체만 새 참조로 바뀐다
    useReservations.mockReturnValue({
      data: [room()],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    rerender(<RoomPage />);

    // 이어지는 칸을 누르면 새 선택으로 접히지 않고 연장되어야 한다
    fireEvent.click(slotCells(container)[1]);
    expect(selectedCells(container)).toBe(2);
  });

  it('같은 칸을 다시 누르면 선택이 풀린다', () => {
    useReservations.mockReturnValue({
      data: [room()],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { container } = render(<RoomPage />);

    fireEvent.click(slotCells(container)[0]);
    expect(selectedCells(container)).toBe(1);

    fireEvent.click(slotCells(container)[0]);
    expect(selectedCells(container)).toBe(0);
  });
});

// 표가 실제로 그려졌는지 확인해 두어야 선택 칸 수 비교가 뜻을 갖는다
it('호실 이름을 표에 보여 준다', () => {
  useReservations.mockReturnValue({
    data: [room()],
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  });
  render(<RoomPage />);
  expect(screen.getByText('세미나실-1')).toBeInTheDocument();
});
