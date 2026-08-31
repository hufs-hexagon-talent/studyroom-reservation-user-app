import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { useSignUp } from '../../../api/user.api';
import { useDepartmets } from '../../../api/department.api';

import SignUp from './SignUp';

jest.mock('../../../api/user.api', () => ({
  useSignUp: jest.fn(),
}));

jest.mock('../../../api/department.api', () => ({
  useDepartmets: jest.fn(),
}));

const mockOpenSuccessSnackbar = jest.fn();
const mockOpenErrorSnackbar = jest.fn();
jest.mock('../../../components/snackbar/SnackBar', () => ({
  useCustomSnackbars: () => ({
    openSuccessSnackbar: mockOpenSuccessSnackbar,
    openErrorSnackbar: mockOpenErrorSnackbar,
  }),
}));

const doSignUp = jest.fn();

// 두 번의 클릭을 같은 tick 에 넣는다. 클릭 사이에 렌더가 끼면 상태 가드만으로도 막혀
// 원래 문제(같은 tick 의 두 번째 클릭)를 재현하지 못한다.
const doubleTap = async button => {
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

const httpError = (status, code, errors) => ({
  response: {
    status,
    headers: {},
    data: {
      code,
      message: '잘못된 요청입니다. 요청 내용을 다시 확인해주세요.',
      errors,
    },
  },
});

const FIELDS = [
  ['이름', '홍길동'],
  ['학번', '202512345'],
  ['아이디', 'admin1'],
  ['비밀번호', 'pw'],
  ['이메일', 'a@hufs.ac.kr'],
  ['학과', '2'],
];

// skip 에 넣은 칸만 비워 둔다. 모든 케이스가 같은 입력에서 출발해야
// 이중 제출 가드처럼 뒤쪽 분기에 있는 동작을 실제로 밟는다.
const fillAll = (skip = []) => {
  FIELDS.filter(([label]) => !skip.includes(label)).forEach(
    ([label, value]) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    },
  );
};

const clickCreate = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '회원 생성' }));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  doSignUp.mockResolvedValue({});
  useSignUp.mockReturnValue({ mutateAsync: doSignUp });
  useDepartmets.mockReturnValue({
    data: [
      { departmentId: 1, departmentName: '컴퓨터공학부' },
      { departmentId: 2, departmentName: '정보통신공학과' },
    ],
  });
});

describe('SignUp', () => {
  it('학과를 고르면 departmentId 를 숫자로 함께 보낸다', async () => {
    render(<SignUp />);
    fillAll();
    await clickCreate();

    expect(doSignUp).toHaveBeenCalledWith({
      username: 'admin1',
      password: 'pw',
      serial: '202512345',
      name: '홍길동',
      email: 'a@hufs.ac.kr',
      departmentId: 2,
    });
  });

  it('학과를 고르지 않으면 요청을 보내지 않는다', async () => {
    render(<SignUp />);
    fillAll(['학과']);
    await clickCreate();

    expect(doSignUp).not.toHaveBeenCalled();
    expect(mockOpenErrorSnackbar.mock.calls[0][0]).toBe('학과를 선택해주세요.');
  });

  it('필수 입력이 비면 요청을 보내지 않는다', async () => {
    render(<SignUp />);
    fillAll(['이름']);
    await clickCreate();

    expect(doSignUp).not.toHaveBeenCalled();
    expect(mockOpenErrorSnackbar.mock.calls[0][0]).toBe(
      '이름·학번·아이디·비밀번호를 모두 입력해주세요.',
    );
  });

  it('생성 버튼을 두 번 눌러도 한 번만 보낸다', async () => {
    let resolveSignUp;
    doSignUp.mockReturnValue(
      new Promise(resolve => {
        resolveSignUp = resolve;
      }),
    );

    render(<SignUp />);
    fillAll();
    await doubleTap(screen.getByRole('button', { name: '회원 생성' }));

    expect(doSignUp).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '회원 생성' })).toBeDisabled();

    await act(async () => {
      resolveSignUp({});
    });
  });

  it('실패는 서버 원문 대신 관리자용 문구를 띄운다', async () => {
    doSignUp.mockRejectedValue(
      httpError(400, 'CLIENT-001', [{ field: 'username' }]),
    );

    render(<SignUp />);
    fillAll();
    await clickCreate();

    await waitFor(() => expect(mockOpenErrorSnackbar).toHaveBeenCalled());
    const [message] = mockOpenErrorSnackbar.mock.calls[0];
    expect(message).toBe(
      '이미 등록된 아이디입니다. 다른 아이디를 입력해주세요.',
    );
    expect(message).not.toContain('잘못된 요청입니다');
  });

  it('세션 만료는 SessionExpiryWatcher 가 안내하므로 스낵바를 겹쳐 띄우지 않는다', async () => {
    const expired = httpError(401, 'AUTH-013');
    expired.sessionExpired = true;
    doSignUp.mockRejectedValue(expired);

    render(<SignUp />);
    fillAll();
    await clickCreate();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '회원 생성' })).toBeEnabled(),
    );
    expect(mockOpenErrorSnackbar).not.toHaveBeenCalled();
  });

  it('성공하면 입력이 비워져 다음 계정을 바로 만들 수 있다', async () => {
    render(<SignUp />);
    fillAll();
    await clickCreate();

    await waitFor(() => expect(mockOpenSuccessSnackbar).toHaveBeenCalled());
    expect(screen.getByLabelText('이름')).toHaveValue('');
    expect(screen.getByLabelText('이메일')).toHaveValue('');
    expect(screen.getByLabelText('학과')).toHaveValue('');
  });
});
