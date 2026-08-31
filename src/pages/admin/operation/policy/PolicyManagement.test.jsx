import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import {
  useAllPolicies,
  useCreatePolicy,
  useDeletePolicy,
  useEditPolicy,
  usePolicy,
} from '../../../../api/roomOperationPolicy.api';

import PolicyManagement from './PolicyManagement';

jest.mock('../../../../api/roomOperationPolicy.api', () => ({
  useCreatePolicy: jest.fn(),
  useAllPolicies: jest.fn(),
  useDeletePolicy: jest.fn(),
  usePolicy: jest.fn(),
  useEditPolicy: jest.fn(),
}));

const mockOpenSuccessSnackbar = jest.fn();
const mockOpenErrorSnackbar = jest.fn();
jest.mock('../../../../components/snackbar/SnackBar', () => ({
  useCustomSnackbars: () => ({
    openSuccessSnackbar: mockOpenSuccessSnackbar,
    openErrorSnackbar: mockOpenErrorSnackbar,
  }),
}));

// 운영에 남아 있는 격자 밖 정책
const OFF_GRID_POLICY = {
  roomOperationPolicyId: 7,
  operationStartTime: '09:00:00',
  operationEndTime: '23:59:59',
  eachMaxMinute: 120,
};

const doCreatePolicy = jest.fn();
const doEditPolicy = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useCreatePolicy.mockReturnValue({ mutateAsync: doCreatePolicy });
  useDeletePolicy.mockReturnValue({ mutateAsync: jest.fn() });
  useEditPolicy.mockReturnValue({ mutate: doEditPolicy });
  useAllPolicies.mockReturnValue({ data: [], refetch: jest.fn() });
  usePolicy.mockReturnValue({ data: undefined });
});

const createButton = () => screen.getByRole('button', { name: '생성' });

// TimeSelector 는 클릭 두 번(시작·종료)으로 구간을 정한다
const selectRange = () => {
  fireEvent.click(screen.getByText('09:00'));
  fireEvent.click(screen.getByText('11:00'));
};

describe('PolicyManagement 정책 생성', () => {
  it('시간 구간을 고르기 전에는 생성 버튼을 누를 수 없다', () => {
    render(<PolicyManagement />);

    expect(createButton()).toBeDisabled();
    fireEvent.click(createButton());
    expect(doCreatePolicy).not.toHaveBeenCalled();
  });

  it('고른 구간을 서버가 받는 HH:mm:ss 로 보낸다', async () => {
    doCreatePolicy.mockResolvedValue({ message: '정책이 생성되었습니다.' });
    render(<PolicyManagement />);

    selectRange();
    fireEvent.click(createButton());

    await waitFor(() =>
      expect(doCreatePolicy).toHaveBeenCalledWith({
        operationStartTime: '09:00:00',
        operationEndTime: '11:00:00',
        eachMaxMinute: 60,
      }),
    );
  });

  it('거절 사유가 스낵바에 뜬다 — 옛 코드는 TypeError 로 죽어 아무것도 안 떴다', async () => {
    doCreatePolicy.mockRejectedValue({
      response: {
        status: 400,
        data: {
          code: 'CLIENT-001',
          errors: [
            {
              field: 'operationEndTime',
              message: '운영 시간은 30분 단위로만 지정할 수 있습니다.',
            },
          ],
        },
      },
    });
    render(<PolicyManagement />);

    selectRange();
    fireEvent.click(createButton());

    await waitFor(() => expect(mockOpenErrorSnackbar).toHaveBeenCalled());
    expect(mockOpenErrorSnackbar.mock.calls[0][0]).toContain('30분 단위');
  });
});

describe('PolicyManagement 정책 수정', () => {
  const openEditModal = () => {
    useAllPolicies.mockReturnValue({
      data: [OFF_GRID_POLICY],
      refetch: jest.fn(),
    });
    usePolicy.mockReturnValue({ data: OFF_GRID_POLICY });
    render(<PolicyManagement />);

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    return within(screen.getByTestId('modal-overlay'));
  };

  it('격자 밖 종료 시각을 정정 버튼으로 고쳐 저장한다', () => {
    const modal = openEditModal();

    fireEvent.click(modal.getByRole('button', { name: '23:30 로 맞추기' }));
    fireEvent.click(modal.getByRole('button', { name: '수정' }));

    expect(doEditPolicy).toHaveBeenCalledWith(
      {
        roomOperationPolicyId: 7,
        operationStartTime: '09:00:00',
        operationEndTime: '23:30:00',
        eachMaxMinute: 120,
      },
      expect.anything(),
    );
  });

  it('수정 실패 사유를 안내한다 — 옛 코드는 error 를 읽지도 않았다', () => {
    const modal = openEditModal();

    fireEvent.click(modal.getByRole('button', { name: '수정' }));

    const [, handlers] = doEditPolicy.mock.calls[0];
    handlers.onError({
      response: {
        status: 400,
        data: {
          code: 'CLIENT-001',
          errors: [
            {
              field: 'operationEndTime',
              message: '운영 시간은 30분 단위로만 지정할 수 있습니다.',
            },
          ],
        },
      },
    });

    expect(mockOpenErrorSnackbar).toHaveBeenCalled();
    expect(mockOpenErrorSnackbar.mock.calls[0][0]).toContain('30분 단위');
  });
});
