import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { useReservations, useReserve } from '../../../api/reservation.api';

import RoomPage, { reserveModalTheme } from './RoomPage';

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
  Array.from(container.querySelectorAll('tbody [data-time-index]'));

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

describe('예약 확인 모달', () => {
  // 09:00 ~ 10:00 두 칸을 골라 예약하기를 눌러 모달을 연다.
  // 데스크톱용·모바일용(SelectionBar) 두 곳에 "예약하기" 버튼이 함께 렌더되므로
  // DOM 순서상 먼저 오는 데스크톱 버튼을 누른다.
  const openModal = container => {
    fireEvent.click(slotCells(container)[0]);
    fireEvent.click(slotCells(container)[1]);
    fireEvent.click(screen.getAllByText('예약하기')[0]);
  };

  beforeEach(() => {
    useReservations.mockReturnValue({
      data: [room()],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('호실명·시간·길이를 보여준다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('세미나실-1')).toBeInTheDocument();
    expect(within(dialog).getByText(/09:00 ~ 10:00/)).toBeInTheDocument();
    expect(within(dialog).getByText('1시간')).toBeInTheDocument();
  });

  it('취소 버튼이 flowbite light 색이고 빨간 배경 클래스가 없다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);

    const dialog = screen.getByRole('dialog');
    const cancel = within(dialog).getByRole('button', { name: '취소' });
    const classes = cancel.className.split(/\s+/);

    // 부정: color가 'failure'(bg-red-700) 등 빨간 계열로 바뀌면 잡아낸다.
    // bg-red-600 하나만 보면 색상이 bg-red-700 등 다른 빨강으로 바뀌었을 때
    // 놓치므로 'bg-red-'로 시작하는 클래스 전체를 본다.
    expect(classes.some(c => c.startsWith('bg-red-'))).toBe(false);

    // 긍정: node_modules/flowbite-react 의 Button/theme.mjs 에서 읽은 color.light 문자열
    // ("border border-gray-300 bg-white text-gray-900 ...")의 border-gray-300 은
    // 이 앱이 쓰는 다른 색(dark/failure 등) 어디에도 없는 light 고유 클래스라
    // light 로 바뀌었는지 안정적으로 가려낸다.
    expect(classes).toContain('border-gray-300');
  });

  it('바깥을 누르면 모달이 닫힌다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ESC 를 누르면 모달이 닫힌다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // jsdom 은 레이아웃이 없어 h-full 때문에 래퍼가 화면을 덮어 바깥 클릭이
  // 오버레이까지 못 내려가는 걸 폭·좌표로는 재현할 수 없다. 대신 그 원인이었던
  // 클래스가 되돌아오지 않는지 테마 상수 자체로 회귀를 막는다.
  it('content.base 에 모바일에서 래퍼가 화면을 덮는 h-full 이 없다', () => {
    const classes = reserveModalTheme.content.base.split(/\s+/);
    expect(classes).not.toContain('h-full');
  });
});
