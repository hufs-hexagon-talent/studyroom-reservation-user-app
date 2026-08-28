import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  useDeleteReservation,
  useLatestReservation,
  useNoShow,
  useUserReservation,
} from '../../api/reservation.api';
import { useBlockedPeriod, useMyInfo } from '../../api/user.api';

import Check from './CheckRoom';

jest.mock('../../api/reservation.api', () => ({
  useDeleteReservation: jest.fn(),
  useLatestReservation: jest.fn(),
  useNoShow: jest.fn(),
  useUserReservation: jest.fn(),
}));
jest.mock('../../api/user.api', () => ({
  useBlockedPeriod: jest.fn(),
  useMyInfo: jest.fn(),
}));

const mockOpenSuccessSnackbar = jest.fn();
const mockOpenErrorSnackbar = jest.fn();
jest.mock('../../components/snackbar/SnackBar', () => ({
  useCustomSnackbars: () => ({
    openSuccessSnackbar: mockOpenSuccessSnackbar,
    openErrorSnackbar: mockOpenErrorSnackbar,
  }),
}));

const loaded = data => ({
  data,
  isPending: false,
  isError: false,
  refetch: jest.fn(),
});
const pending = () => ({
  data: undefined,
  isPending: true,
  isError: false,
  refetch: jest.fn(),
});
const failed = () => ({
  data: undefined,
  isPending: false,
  isError: true,
  refetch: jest.fn(),
});

const reservation = (id, overrides = {}) => ({
  reservationId: id,
  reservationStartTime: '2099-01-01T10:00:00',
  reservationEndTime: '2099-01-01T11:00:00',
  reservationState: 'NOT_VISITED',
  roomName: '세미나실',
  partitionNumber: 1,
  ...overrides,
});

const noShowOf = (count, list = []) => ({
  noShowCount: count,
  reservationList: { reservationInfoResponses: list },
});

const openNoShowPopover = () =>
  fireEvent.click(screen.getByRole('button', { name: '내 노쇼 현황' }));

beforeEach(() => {
  jest.clearAllMocks();
  useNoShow.mockReturnValue(loaded(noShowOf(1)));
  useUserReservation.mockReturnValue(loaded([]));
  useLatestReservation.mockReturnValue(loaded([]));
  useMyInfo.mockReturnValue(loaded({ name: '홍길동', serviceRole: 'USER' }));
  useDeleteReservation.mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  });
  useBlockedPeriod.mockReturnValue(loaded(null));
});

describe('예약 목록', () => {
  test('불러오는 중에는 로딩 문구를 보여준다', () => {
    useUserReservation.mockReturnValue(pending());
    render(<Check />);

    expect(screen.getByText('예약 목록을 불러오는 중입니다.')).toBeVisible();
    expect(screen.queryByText('예약 내역이 없습니다.')).toBeNull();
  });

  test('조회에 실패하면 빈 목록이 아니라 실패 문구와 다시 시도를 보여준다', () => {
    const query = failed();
    useUserReservation.mockReturnValue(query);
    render(<Check />);

    expect(screen.getByText('예약 목록을 불러오지 못했습니다.')).toBeVisible();
    expect(screen.queryByText('예약 내역이 없습니다.')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(query.refetch).toHaveBeenCalledTimes(1);
  });

  test('예약이 없으면 없음 문구를 보여준다', () => {
    render(<Check />);

    expect(screen.getByText('예약 내역이 없습니다.')).toBeVisible();
  });

  test('예약이 있으면 목록을 보여준다', () => {
    useUserReservation.mockReturnValue(loaded([reservation(1)]));
    render(<Check />);

    expect(screen.getByText('세미나실-1')).toBeVisible();
    expect(screen.queryByText('예약 내역이 없습니다.')).toBeNull();
  });
});

describe('예약 취소', () => {
  test('확인을 누르면 취소 요청을 보내고 성공 안내를 띄운다', async () => {
    const mutateAsync = jest.fn().mockResolvedValue({});
    useDeleteReservation.mockReturnValue({ mutateAsync, isPending: false });
    useUserReservation.mockReturnValue(loaded([reservation(7)]));
    render(<Check />);

    fireEvent.click(screen.getByRole('link', { name: '삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() =>
      expect(mockOpenSuccessSnackbar).toHaveBeenCalledWith(
        '예약을 취소했습니다.',
        3000,
      ),
    );
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(7);
  });

  test('취소 실패는 서버 원문 대신 학생용 문구를 띄운다', async () => {
    const mutateAsync = jest.fn().mockRejectedValue({
      response: {
        status: 412,
        data: {
          code: 'RESERVATION-010',
          message: '이미 방문 처리된 예약은 삭제할 수 없습니다.',
        },
      },
    });
    useDeleteReservation.mockReturnValue({ mutateAsync, isPending: false });
    useUserReservation.mockReturnValue(loaded([reservation(7)]));
    render(<Check />);

    fireEvent.click(screen.getByRole('link', { name: '삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() =>
      expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
        '이미 출석한 예약은 취소할 수 없습니다.',
        3000,
      ),
    );
  });

  test('취소 요청이 진행 중이면 확인을 다시 누를 수 없다', () => {
    const mutateAsync = jest.fn(() => new Promise(() => {}));
    useDeleteReservation.mockReturnValue({ mutateAsync, isPending: true });
    useUserReservation.mockReturnValue(loaded([reservation(7)]));
    render(<Check />);

    fireEvent.click(screen.getByRole('link', { name: '삭제' }));
    const confirm = screen.getByRole('button', { name: '확인' });
    expect(confirm).toBeDisabled();

    fireEvent.click(confirm);
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});

describe('내 노쇼 현황 팝오버', () => {
  test('여는 시점에 제한 기간을 조회해 첫 열람부터 보여준다', () => {
    useBlockedPeriod.mockImplementation(({ enabled }) =>
      enabled
        ? loaded({
            data: {
              startBlockedDate: '2026-08-01',
              endBlockedDate: '2026-09-01',
            },
          })
        : pending(),
    );
    render(<Check />);
    expect(useBlockedPeriod).toHaveBeenLastCalledWith({ enabled: false });

    openNoShowPopover();

    expect(useBlockedPeriod).toHaveBeenLastCalledWith({ enabled: true });
    expect(
      screen.getByText('현재 예약 제한 기간 : 2026-08-01 ~ 2026-09-01'),
    ).toBeVisible();
  });

  test('이미 제한 상태인 학생은 화면에 들어올 때 제한 기간을 미리 조회한다', () => {
    useMyInfo.mockReturnValue(
      loaded({ name: '홍길동', serviceRole: 'BLOCKED' }),
    );
    render(<Check />);

    expect(useBlockedPeriod).toHaveBeenLastCalledWith({ enabled: true });
  });

  test('제한 상태가 아니면 제한 기간 줄을 보여주지 않는다', () => {
    render(<Check />);
    openNoShowPopover();

    expect(screen.queryByText(/예약 제한 기간/)).toBeNull();
    expect(screen.getByText(/방문하지 않은 횟수는 1번 입니다/)).toBeVisible();
  });

  test('팝오버 안을 눌러도 닫히지 않는다', () => {
    render(<Check />);
    // 팝오버가 열리면 나머지 화면은 aria-hidden 이 되므로 버튼은 열기 전에 잡아 둔다.
    const button = screen.getByRole('button', { name: '내 노쇼 현황' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-describedby', 'simple-popover');

    fireEvent.click(screen.getByText(/방문하지 않은 횟수는 1번 입니다/));

    expect(button).toHaveAttribute('aria-describedby', 'simple-popover');
  });

  test('노쇼 횟수를 불러오기 전에는 횟수 문구를 보여주지 않는다', () => {
    useNoShow.mockReturnValue(pending());
    render(<Check />);
    openNoShowPopover();

    expect(screen.getByText('노쇼 현황을 불러오는 중입니다.')).toBeVisible();
    expect(screen.queryByText(/undefined/)).toBeNull();
  });

  test('노쇼 횟수 조회에 실패하면 실패 문구와 다시 시도를 보여준다', () => {
    const query = failed();
    useNoShow.mockReturnValue(query);
    render(<Check />);
    openNoShowPopover();

    expect(screen.getByText('노쇼 현황을 불러오지 못했습니다.')).toBeVisible();
    expect(screen.queryByText(/undefined/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(query.refetch).toHaveBeenCalledTimes(1);
  });

  test('제한 기간 조회에 실패하면 그 사실을 알린다', () => {
    useBlockedPeriod.mockReturnValue(failed());
    render(<Check />);
    openNoShowPopover();

    expect(
      screen.getByText('예약 제한 기간을 불러오지 못했습니다.'),
    ).toBeVisible();
  });
});
