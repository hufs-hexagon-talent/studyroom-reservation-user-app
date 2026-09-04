import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { useReservations, useReserve } from '../../../api/reservation.api';

import RoomPage, { reserveModalTheme } from './RoomPage';
import { shortDateLabel } from './dateLabel';
import { durationLabel } from './durationLabel';

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

  // handleSlotClick 의 !state.selectable 가드가 유일한 클라이언트 방어선이다.
  // 칸에 pointer-events:none 이 걸려 있지 않아 클릭 자체는 들어온다.
  it('이미 예약된 칸을 누르면 선택되지 않는다', () => {
    useReservations.mockReturnValue({
      data: [
        {
          ...room(),
          reservationTimeRanges: [
            {
              startDateTime: '2099-01-01T09:00:00',
              endDateTime: '2099-01-01T09:30:00',
            },
          ],
        },
      ],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { container } = render(<RoomPage />);

    fireEvent.click(slotCells(container)[0]);

    // td.selected 로는 판별할 수 없다. getSlotState 의 우선순위가 reserved 를 먼저 보므로
    // 가드가 없어 선택이 생겨도 status 는 계속 reserved 다. 선택이 실제로 생겼는지는
    // 모바일 SelectionBar 가 뜨는지로 본다(선택이 없으면 null 을 반환한다).
    expect(screen.queryAllByText('예약하기')).toHaveLength(1);
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

  // 모바일에서는 SelectionBar 의 버튼이 유일한 예약 경로다. 데스크톱 버튼만 누르는
  // 테스트로는 이 배선(onReserve={openReserveConfirm})이 끊겨도 잡히지 않는다.
  it('모바일 SelectionBar 의 예약하기로도 모달이 열린다', () => {
    const { container } = render(<RoomPage />);

    fireEvent.click(slotCells(container)[0]);
    fireEvent.click(slotCells(container)[1]);
    fireEvent.click(screen.getAllByText('예약하기')[1]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Modal.Header 는 children 을 자기 <h3> 안에 넣으므로 여기에 heading 을 또 넣으면
  // <h3><h2>..</h2></h3> 가 된다. 제목은 정확히 하나여야 한다.
  it('제목 heading 이 하나만 있다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);

    const dialog = screen.getByRole('dialog');
    const headings = dialog.querySelectorAll('h1, h2, h3, h4, h5, h6');

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('이대로 예약할까요?');
  });

  it('호실명·시작 시각·종료 시각·날짜·길이가 모두 화면에 있다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);

    const dialog = screen.getByRole('dialog');
    // useUrlQuery 가 '2099-01-01' 로 고정돼 있다. 시간대에 따라 "(오늘)" 여부가 달라질 수
    // 있어 하드코딩하지 않고 실제 쓰는 함수로 기대값을 계산한다.
    expect(
      within(dialog).getByText(shortDateLabel('2099-01-01')),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('세미나실-1')).toBeInTheDocument();
    expect(within(dialog).getByText('09:00')).toBeInTheDocument();
    expect(within(dialog).getByText('10:00')).toBeInTheDocument();
    expect(within(dialog).getByText(durationLabel(60))).toBeInTheDocument();
  });

  it('시간 블록에 aria-label 이 있고 시작·종료·길이가 들어 있다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);

    const dialog = screen.getByRole('dialog');
    const timeBlock = within(dialog).getByRole('group');

    expect(timeBlock).toHaveAttribute(
      'aria-label',
      expect.stringContaining('09:00'),
    );
    expect(timeBlock.getAttribute('aria-label')).toContain('10:00');
    expect(timeBlock.getAttribute('aria-label')).toContain(durationLabel(60));
  });

  it('취소 버튼에 빨간 배경 클래스가 없다', () => {
    const { container } = render(<RoomPage />);
    openModal(container);

    const dialog = screen.getByRole('dialog');
    const cancel = within(dialog).getByRole('button', { name: '취소' });
    const classes = cancel.className.split(/\s+/);

    // color가 'failure'(bg-red-700) 등 빨간 계열로 바뀌면 잡아낸다. bg-red-600 하나만
    // 보면 다른 빨강으로 바뀌었을 때 놓치므로 'bg-red-'로 시작하는 클래스 전체를 본다.
    expect(classes.some(c => c.startsWith('bg-red-'))).toBe(false);
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
  // 클래스가 되돌아오지 않는지 테마 상수 자체로 회귀를 막는다. h-full 뿐 아니라
  // h-dvh·min-h-screen 등 같은 버그를 재현하는 전체 높이 유틸 전반을 막는다.
  it('content.base 에 모바일에서 래퍼가 화면을 덮는 전체 높이 유틸이 없다', () => {
    const forbidden =
      /\b(h-full|h-screen|h-dvh|h-\[100[a-z]*\]|min-h-screen|min-h-dvh)\b/;
    expect(reserveModalTheme.content.base).not.toMatch(forbidden);
  });

  // 대화상자 컨테이너가 initialFocus 대상이 되려면 그 role="dialog" div 의 className 이
  // content.base 를 그대로 쓰므로, 포커스를 받아도 링이 안 보이려면 여기에
  // focus:outline-none 이 있어야 한다.
  it('content.base 에 focus:outline-none 이 있다', () => {
    expect(reserveModalTheme.content.base).toMatch(/\bfocus:outline-none\b/);
  });
});
