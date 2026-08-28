import React from 'react';
import { act, render, screen } from '@testing-library/react';

import OtpPage from './OtpPage';

jest.mock('qrcode.react', () => ({
  __esModule: true,
  default: ({ value }) => <div data-testid="qr">{value}</div>,
}));

jest.mock('../../api/user.api', () => ({
  useMyInfo: () => ({ data: { name: '학생' } }),
}));

const mockUseOtp = jest.fn();
jest.mock('../../api/checkin.api', () => ({
  useOtp: () => mockUseOtp(),
}));

const T0 = Date.UTC(2026, 7, 28, 1, 0, 0);
const TTL_MS = 300_000;

const otpAt = (receivedAt, code) => ({
  verificationCode: code,
  expiresAt: new Date(receivedAt + TTL_MS).toISOString(),
});

const queryState = overrides => ({
  data: undefined,
  refetch: jest.fn(),
  dataUpdatedAt: 0,
  isPending: false,
  isError: false,
  isFetching: false,
  ...overrides,
});

const renderWith = state => {
  mockUseOtp.mockReturnValue(state);
  return render(<OtpPage />);
};

const advance = ms => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(T0);
  mockUseOtp.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('OtpPage', () => {
  it('처음 불러오는 동안은 QR 대신 불러오는 중을 보여 준다', () => {
    renderWith(queryState({ isPending: true, isFetching: true }));

    expect(screen.queryByTestId('qr')).toBeNull();
    expect(screen.getByText('QR 을 불러오는 중입니다')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('QR 을 받으면 30초부터 1초씩 센다', () => {
    renderWith(queryState({ data: otpAt(T0, 'otp-1'), dataUpdatedAt: T0 }));

    expect(screen.getByTestId('qr')).toHaveTextContent('otp-1');
    expect(screen.getByText('30초 남았습니다')).toBeInTheDocument();

    advance(1000);
    expect(screen.getByText('29초 남았습니다')).toBeInTheDocument();

    advance(28_000);
    expect(screen.getByText('1초 남았습니다')).toBeInTheDocument();
  });

  it('30초가 되면 새 QR 을 요청하고, 응답이 올 때까지 이전 QR 을 그대로 둔다', () => {
    const refetch = jest.fn();
    const { rerender } = renderWith(
      queryState({ data: otpAt(T0, 'otp-1'), dataUpdatedAt: T0, refetch }),
    );

    advance(30_000);

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('qr')).toHaveTextContent('otp-1');
    expect(
      screen.queryByText('QR 이 만료되었습니다. 다시 발급받아 주세요.'),
    ).toBeNull();
    expect(screen.queryByText('QR 을 불러오는 중입니다')).toBeNull();

    // 재조회 중(느린 네트워크)에도 이전 QR 은 그대로다.
    mockUseOtp.mockReturnValue(
      queryState({
        data: otpAt(T0, 'otp-1'),
        dataUpdatedAt: T0,
        refetch,
        isFetching: true,
      }),
    );
    rerender(<OtpPage />);
    advance(3_000);

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('qr')).toHaveTextContent('otp-1');
    expect(
      screen.getByText('QR 을 다시 발급하는 중입니다'),
    ).toBeInTheDocument();
  });

  it('새 QR 이 오면 바로 바꾸고 카운트다운을 30초부터 다시 센다', () => {
    const { rerender } = renderWith(
      queryState({ data: otpAt(T0, 'otp-1'), dataUpdatedAt: T0 }),
    );

    advance(31_500);

    const receivedAt = T0 + 31_500;
    mockUseOtp.mockReturnValue(
      queryState({
        data: otpAt(receivedAt, 'otp-2'),
        dataUpdatedAt: receivedAt,
      }),
    );
    rerender(<OtpPage />);

    expect(screen.getByTestId('qr')).toHaveTextContent('otp-2');
    expect(screen.getByText('30초 남았습니다')).toBeInTheDocument();

    advance(1000);
    expect(screen.getByText('29초 남았습니다')).toBeInTheDocument();
  });

  it('재조회에 실패하면 이전 QR 을 감추고 다시 시도 버튼을 보여 준다', () => {
    const refetch = jest.fn();
    renderWith(
      queryState({
        data: otpAt(T0, 'otp-1'),
        dataUpdatedAt: T0,
        refetch,
        isError: true,
      }),
    );

    advance(31_000);

    expect(screen.queryByTestId('qr')).toBeNull();
    expect(screen.getByText('QR 을 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeEnabled();
    // 실패했을 때는 자동으로 반복하지 않는다.
    expect(refetch).not.toHaveBeenCalled();
  });

  it('서버 만료 시각을 지난 QR 은 감추고 만료로 안내한다', () => {
    renderWith(
      queryState({
        data: otpAt(T0 - TTL_MS - 1000, 'otp-old'),
        dataUpdatedAt: T0 - TTL_MS - 1000,
      }),
    );

    expect(screen.queryByTestId('qr')).toBeNull();
    expect(
      screen.getByText('QR 이 만료되었습니다. 다시 발급받아 주세요.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeEnabled();
  });
});
