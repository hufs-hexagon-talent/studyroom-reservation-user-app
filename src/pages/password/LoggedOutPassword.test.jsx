import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { useLoggedOutPassword } from '../../api/user.api';

import LoggedOutPassword from './LoggedOutPassword';

jest.mock('../../api/user.api', () => ({
  useLoggedOutPassword: jest.fn(),
}));

const mockOpenSuccessSnackbar = jest.fn();
const mockOpenErrorSnackbar = jest.fn();
jest.mock('../../components/snackbar/SnackBar', () => ({
  useCustomSnackbars: () => ({
    openSuccessSnackbar: mockOpenSuccessSnackbar,
    openErrorSnackbar: mockOpenErrorSnackbar,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const doPasswordChange = jest.fn();

const fillPasswords = () => {
  fireEvent.change(screen.getByPlaceholderText('새 비밀번호를 입력해주세요'), {
    target: { value: 'newpw1234' },
  });
  fireEvent.change(
    screen.getByPlaceholderText('새 비밀번호를 한번 더 입력해주세요'),
    { target: { value: 'newpw1234' } },
  );
};

// 두 번의 탭을 같은 tick 에 넣는다. 클릭 사이에 렌더가 끼면 상태 가드만으로도 막혀
// 원래 문제(같은 tick 의 두 번째 탭)를 재현하지 못한다.
const doubleTap = async button => {
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.setItem('pwResetToken', 'reset-token');
  doPasswordChange.mockResolvedValue({});
  useLoggedOutPassword.mockReturnValue({ mutateAsync: doPasswordChange });
});

describe('LoggedOutPassword', () => {
  it('변경하기를 두 번 탭해도 재설정 요청은 한 번만 보낸다', async () => {
    let resolveChange;
    doPasswordChange.mockReturnValue(
      new Promise(resolve => {
        resolveChange = resolve;
      }),
    );

    render(<LoggedOutPassword />);
    fillPasswords();

    await doubleTap(screen.getByRole('button', { name: '변경하기' }));

    expect(doPasswordChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '변경 중...' })).toBeDisabled();

    await act(async () => {
      resolveChange({});
    });
    expect(mockOpenErrorSnackbar).not.toHaveBeenCalled();
  });

  it('한 번 성공하면 성공 안내만 뜬다', async () => {
    render(<LoggedOutPassword />);
    fillPasswords();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '변경하기' }));
    });

    await waitFor(() => expect(mockOpenSuccessSnackbar).toHaveBeenCalled());
    expect(mockOpenErrorSnackbar).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('실패하면 서버 원문 대신 학생용 문구를 띄운다', async () => {
    doPasswordChange.mockRejectedValue({
      response: {
        status: 400,
        headers: {},
        data: {
          code: 'USER-007',
          message: '새 비밀번호는 현재 비밀번호와 같을 수 없습니다.',
        },
      },
    });

    render(<LoggedOutPassword />);
    fillPasswords();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '변경하기' }));
    });

    await waitFor(() => expect(mockOpenErrorSnackbar).toHaveBeenCalled());
    expect(mockOpenErrorSnackbar.mock.calls[0][0]).toBe(
      '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.',
    );
  });
});
