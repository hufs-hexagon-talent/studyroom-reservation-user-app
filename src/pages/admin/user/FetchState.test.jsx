import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import {
  useBlockedUser,
  useUnblocked,
  useUserRoleList,
  useUserSearch,
  useUserUpdate,
} from '../../../api/user.api';
import { useDepartmets } from '../../../api/department.api';
import { useAllRooms } from '../../../api/room.api';

import FetchState from './FetchState';

jest.mock('../../../api/user.api', () => ({
  useUnblocked: jest.fn(),
  useBlockedUser: jest.fn(),
  useUserRoleList: jest.fn(),
  exportUserExcel: jest.fn(),
  useUserSearch: jest.fn(),
  useUserUpdate: jest.fn(),
}));

jest.mock('../../../api/department.api', () => ({
  useDepartmets: jest.fn(),
}));

jest.mock('../../../api/room.api', () => ({
  useAllRooms: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [{ getAll: () => [] }, jest.fn()],
}));

const mockOpenSuccessSnackbar = jest.fn();
const mockOpenErrorSnackbar = jest.fn();
jest.mock('../../../components/snackbar/SnackBar', () => ({
  useCustomSnackbars: () => ({
    openSuccessSnackbar: mockOpenSuccessSnackbar,
    openErrorSnackbar: mockOpenErrorSnackbar,
  }),
}));

const RESIDENT_USER = {
  userId: 5,
  username: 'room306',
  serial: '000012345',
  name: '306관리실',
  email: 'room306@hufs.ac.kr',
  serviceRole: 'RESIDENT',
  departmentId: 1,
  roomId: 1,
  roomName: '306',
};

const STUDENT_USER = {
  userId: 6,
  username: 'student',
  serial: '202612345',
  name: '홍길동',
  email: 'student@hufs.ac.kr',
  serviceRole: 'USER',
  departmentId: 1,
  roomId: null,
  roomName: null,
};

const userUpdate = jest.fn();
const userSearch = jest.fn();

// 모달은 flowbite 가 show 일 때만 렌더한다. 열기 전에는 툴바의 '수정' 하나뿐이라
// 이름으로 잡을 수 있고, 연 다음부터는 modal() 로 범위를 좁혀야 한다.
const modal = () => within(screen.getByTestId('modal-overlay'));

// 역할 필터 체크박스가 표보다 먼저 오므로 행으로 범위를 좁혀 고른다.
const openModalFor = user => {
  const row = screen.getByText(user.serial).closest('tr');
  fireEvent.click(within(row).getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: '수정' }));
};

const changeInModal = (label, value) => {
  fireEvent.change(modal().getByLabelText(label), { target: { value } });
};

const submit = async () => {
  await act(async () => {
    fireEvent.click(modal().getByRole('button', { name: '수정' }));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  userUpdate.mockResolvedValue({ message: '수정되었습니다.' });
  userSearch.mockImplementation((payload, { onSuccess }) =>
    onSuccess({
      data: {
        items: [RESIDENT_USER, STUDENT_USER],
        meta: { totalPages: 1, size: 30 },
      },
    }),
  );

  useUserSearch.mockReturnValue({ mutate: userSearch });
  useUserUpdate.mockReturnValue({ mutateAsync: userUpdate });
  useUnblocked.mockReturnValue({ mutate: jest.fn(), refetch: jest.fn() });
  useBlockedUser.mockReturnValue({ data: [] });
  useUserRoleList.mockReturnValue({
    data: ['USER', 'ADMIN', 'RESIDENT', 'BLOCKED', 'EXPIRED'],
  });
  useDepartmets.mockReturnValue({
    data: [{ departmentId: 1, departmentName: '컴퓨터공학부' }],
  });
  useAllRooms.mockReturnValue({
    data: [
      {
        roomId: 1,
        roomName: '306',
        departmentId: 1,
        departmentName: '컴퓨터공학부',
      },
      {
        roomId: 2,
        roomName: '428',
        departmentId: 1,
        departmentName: '컴퓨터공학부',
      },
    ],
  });
});

afterEach(() => {
  console.error.mockRestore();
});

describe('FetchState 담당 호실', () => {
  it('목록에서 담당 호실 지정 여부를 바로 볼 수 있다', () => {
    render(<FetchState />);

    expect(screen.getByText('담당 호실')).toBeInTheDocument();
    expect(screen.getByText('306')).toBeInTheDocument();

    const studentRow = screen.getByText('홍길동').closest('tr');
    expect(within(studentRow).getByText('-')).toBeInTheDocument();
  });

  it('관리실 계정이 아니면 담당 호실을 고를 수 없고, 역할을 바꾸면 열린다', () => {
    render(<FetchState />);
    openModalFor(STUDENT_USER);

    expect(modal().getByLabelText('담당 호실')).toBeDisabled();
    expect(
      modal().getByText('관리실(RESIDENT) 계정만 담당 호실을 지정합니다.'),
    ).toBeInTheDocument();

    changeInModal('ROLE', 'RESIDENT');
    expect(modal().getByLabelText('담당 호실')).toBeEnabled();
  });

  it('호실 이름이 부서마다 겹치므로 선택지에 부서명을 함께 적는다', () => {
    render(<FetchState />);
    openModalFor(RESIDENT_USER);

    expect(
      within(modal().getByLabelText('담당 호실')).getByText(
        '306 (컴퓨터공학부)',
      ),
    ).toBeInTheDocument();
  });

  it('이미 관리실 계정이면 서버가 준 담당 호실이 골라져 있다', () => {
    render(<FetchState />);
    openModalFor(RESIDENT_USER);

    expect(modal().getByLabelText('담당 호실')).toHaveValue('1');
  });

  it('호실을 고르지 않고 승격하면 요청을 보내지 않는다', async () => {
    render(<FetchState />);
    openModalFor(STUDENT_USER);
    changeInModal('ROLE', 'RESIDENT');
    await submit();

    expect(userUpdate).not.toHaveBeenCalled();
    expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
      '관리실 계정으로 바꾸려면 담당 호실을 지정해 주세요.',
      3000,
    );
  });

  it('호실을 고르고 저장하면 roomId 를 숫자로 보낸다', async () => {
    render(<FetchState />);
    openModalFor(STUDENT_USER);
    changeInModal('ROLE', 'RESIDENT');
    changeInModal('담당 호실', '2');
    await submit();

    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 6,
        serviceRole: 'RESIDENT',
        roomId: 2,
      }),
    );
  });

  it('관리실에서 내리면 예전 호실이 실려 나가지 않는다', async () => {
    render(<FetchState />);
    openModalFor(RESIDENT_USER);
    changeInModal('ROLE', 'USER');
    await submit();

    const payload = userUpdate.mock.calls[0][0];
    expect(payload.serviceRole).toBe('USER');
    expect(payload).not.toHaveProperty('roomId');
  });

  it('이미 관리실인 계정은 호실을 다시 고르지 않아도 저장된다', async () => {
    render(<FetchState />);
    openModalFor(RESIDENT_USER);
    await submit();

    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 5, roomId: 1 }),
    );
  });

  it('역할을 내리면 골라져 있던 호실이 화면에서도 지워진다', () => {
    // 전송 가드만 있으면 화면에는 옛 호실이 남아, 다시 RESIDENT 로 되돌렸을 때
    // 아무도 고르지 않은 값이 그대로 실려 나간다.
    render(<FetchState />);
    openModalFor(RESIDENT_USER);
    expect(modal().getByLabelText('담당 호실')).toHaveValue('1');

    changeInModal('ROLE', 'USER');
    changeInModal('ROLE', 'RESIDENT');

    expect(modal().getByLabelText('담당 호실')).toHaveValue('');
  });

  it('담당 호실의 선택 항목도 고를 수 없다. 담당을 비우는 경로가 서버에 없기 때문이다', () => {
    render(<FetchState />);
    openModalFor(RESIDENT_USER);

    expect(
      within(modal().getByLabelText('담당 호실')).getByText('선택'),
    ).toBeDisabled();
  });

  it('호실 목록을 못 불러오면 승격이 막다른 길이 되지 않게 원인을 알린다', () => {
    useAllRooms.mockReturnValue({ data: undefined, isError: true });
    render(<FetchState />);
    openModalFor(RESIDENT_USER);

    expect(
      modal().getByText(
        '호실 목록을 불러오지 못했습니다. 새로 고친 뒤 다시 시도해 주세요.',
      ),
    ).toBeInTheDocument();
  });

  it('부서의 선택 항목은 고를 수 없다. 값을 비우는 경로가 서버에 없기 때문이다', () => {
    render(<FetchState />);
    openModalFor(STUDENT_USER);

    expect(
      within(modal().getByLabelText('부서')).getByText('선택'),
    ).toBeDisabled();
  });
});

describe('FetchState 실패 안내', () => {
  it('수정 실패는 서버 원문 대신 고칠 방법이 보이는 문구를 띄운다', async () => {
    userUpdate.mockRejectedValue({
      response: {
        status: 404,
        data: { code: 'ROOM-001', message: '해당 방은 존재하지 않습니다.' },
      },
    });

    render(<FetchState />);
    openModalFor(RESIDENT_USER);
    await submit();

    expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
      '선택한 호실을 찾을 수 없습니다. 목록을 새로 고친 뒤 다시 선택해 주세요.',
      3000,
    );
    expect(mockOpenErrorSnackbar).not.toHaveBeenCalledWith(
      expect.stringContaining('해당 방은'),
      expect.anything(),
    );
    expect(mockOpenErrorSnackbar).not.toHaveBeenCalledWith(
      '유저 정보 수정에 실패했습니다.',
      expect.anything(),
    );
  });

  it('중복 값이 500 으로 와도 서버 예외 문구를 노출하지 않는다', async () => {
    userUpdate.mockRejectedValue({
      response: {
        status: 500,
        data: {
          code: 'SERVER-001',
          message: 'could not execute statement; ConstraintViolationException',
        },
      },
    });

    render(<FetchState />);
    openModalFor(RESIDENT_USER);
    await submit();

    expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
      expect.not.stringContaining('Exception'),
      3000,
    );
  });

  it('세션 만료는 화면이 따로 안내하지 않는다', async () => {
    userUpdate.mockRejectedValue({
      sessionExpired: true,
      response: { status: 401, data: {} },
    });

    render(<FetchState />);
    openModalFor(RESIDENT_USER);
    await submit();

    expect(mockOpenErrorSnackbar).not.toHaveBeenCalled();
  });

  it('목록 조회 실패도 서버 원문을 띄우지 않는다', () => {
    userSearch.mockImplementation((payload, { onError }) =>
      onError({
        response: { status: 500, data: { message: '서버 원문' } },
      }),
    );

    render(<FetchState />);

    expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
      '유저 목록을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
      3000,
    );
  });
});
