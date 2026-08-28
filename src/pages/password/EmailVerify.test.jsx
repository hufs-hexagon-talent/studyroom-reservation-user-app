import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { useEmailSend, useEmailVerify } from '../../api/auth.api';

import EmailVerify from './EmailVerify';

jest.mock('../../api/auth.api', () => ({
  useEmailSend: jest.fn(),
  useEmailVerify: jest.fn(),
}));

const mockOpenSnackbar = jest.fn();
jest.mock('react-simple-snackbar', () => ({
  useSnackbar: () => [mockOpenSnackbar, jest.fn()],
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const doEmailSend = jest.fn();
const doEmailVerify = jest.fn();

// 두 번의 탭을 같은 tick 에 넣는다. 클릭 사이에 렌더가 끼면 상태 가드만으로도 막혀
// 원래 문제(같은 tick 의 두 번째 탭)를 재현하지 못한다.
const doubleTap = async button => {
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

const sendCode = async () => {
  fireEvent.change(screen.getByPlaceholderText('아이디 입력'), {
    target: { value: '202012345' },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '인증 코드 발송' }));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  doEmailSend.mockResolvedValue({ verificationId: 'v-1' });
  doEmailVerify.mockResolvedValue({ data: { passwordResetToken: 't-1' } });
  useEmailSend.mockReturnValue({ mutateAsync: doEmailSend });
  useEmailVerify.mockReturnValue({ mutateAsync: doEmailVerify });
});

describe('EmailVerify', () => {
  it('확인을 두 번 탭해도 인증 코드 확인은 한 번만 보낸다', async () => {
    let resolveVerify;
    doEmailVerify.mockReturnValue(
      new Promise(resolve => {
        resolveVerify = resolve;
      }),
    );

    render(<EmailVerify />);
    await sendCode();

    await doubleTap(screen.getByRole('button', { name: '확인' }));

    expect(doEmailVerify).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '확인 중...' })).toBeDisabled();

    await act(async () => {
      resolveVerify({ data: { passwordResetToken: 't-1' } });
    });
  });

  it('요청 제한(429)은 남은 초를 안내한다', async () => {
    doEmailVerify.mockRejectedValue({
      response: {
        status: 429,
        headers: { 'retry-after': '30' },
        data: {
          code: 'CLIENT-008',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
      },
    });

    render(<EmailVerify />);
    await sendCode();
    mockOpenSnackbar.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '확인' }));
    });

    await waitFor(() => expect(mockOpenSnackbar).toHaveBeenCalled());
    expect(mockOpenSnackbar).toHaveBeenCalledWith(
      '요청이 많아 잠시 막혔습니다. 30초 뒤 다시 시도해 주세요.',
    );
  });
});
