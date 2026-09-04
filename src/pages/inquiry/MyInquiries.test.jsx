import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { useMyInquiries, useDeleteInquiry } from '../../api/inquiry.api';

import MyInquiries from './MyInquiries';

jest.mock('../../api/inquiry.api', () => ({
  useMyInquiries: jest.fn(),
  useDeleteInquiry: jest.fn(),
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

const doDelete = jest.fn();

const OPEN_INQUIRY = {
  inquiryId: 1,
  category: 'FACILITY',
  content: '에어컨이 고장났습니다. 확인 부탁드립니다.',
  status: 'OPEN',
  adminMemo: null,
  reservationId: null,
  reservationSummary: null,
  createAt: '2026-09-01T10:00:00',
};

const RESOLVED_INQUIRY = {
  inquiryId: 2,
  category: 'ATTENDANCE',
  content: '출석이 안 잡혔어요.',
  status: 'RESOLVED',
  adminMemo: '확인 후 출석 처리했습니다.',
  reservationId: 10,
  reservationSummary: '2026-08-30 10:00~11:00 201-A',
  createAt: '2026-08-30T09:00:00',
};

beforeEach(() => {
  jest.clearAllMocks();
  doDelete.mockResolvedValue({});
  useDeleteInquiry.mockReturnValue({ mutateAsync: doDelete, isPending: false });
  useMyInquiries.mockReturnValue({
    data: [OPEN_INQUIRY, RESOLVED_INQUIRY],
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  });
});

const openDeleteModal = item =>
  fireEvent.click(within(item).getByRole('button', { name: '삭제' }));

describe('MyInquiries', () => {
  it('접수됨 상태인 문의만 수정·삭제 버튼을 보여준다', () => {
    render(<MyInquiries />);
    const [openItem, resolvedItem] = screen.getAllByRole('listitem');

    expect(
      within(openItem).getByRole('button', { name: '수정' }),
    ).toBeInTheDocument();
    expect(
      within(openItem).getByRole('button', { name: '삭제' }),
    ).toBeInTheDocument();
    expect(
      within(resolvedItem).queryByRole('button', { name: '수정' }),
    ).toBeNull();
    expect(
      within(resolvedItem).queryByRole('button', { name: '삭제' }),
    ).toBeNull();
  });

  it('유형과 상태 배지를 함께 보여준다', () => {
    render(<MyInquiries />);
    const [openItem, resolvedItem] = screen.getAllByRole('listitem');

    expect(within(openItem).getByText('시설·키오스크 고장')).toBeInTheDocument();
    expect(within(openItem).getByText('접수됨')).toBeInTheDocument();
    expect(within(resolvedItem).getByText('출석·예약 이의')).toBeInTheDocument();
    expect(within(resolvedItem).getByText('처리완료')).toBeInTheDocument();
  });

  it('완료된 문의는 처리 메모를 보여준다', () => {
    render(<MyInquiries />);
    const [openItem, resolvedItem] = screen.getAllByRole('listitem');

    expect(
      within(resolvedItem).getByText(/확인 후 출석 처리했습니다\./),
    ).toBeInTheDocument();
    expect(within(openItem).queryByText(/처리 메모/)).toBeNull();
  });

  it('수정 버튼을 누르면 해당 문의의 수정 화면으로 이동한다', () => {
    render(<MyInquiries />);
    const [openItem] = screen.getAllByRole('listitem');

    fireEvent.click(within(openItem).getByRole('button', { name: '수정' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      `/inquiry/${OPEN_INQUIRY.inquiryId}/edit`,
    );
  });

  it('삭제 확인 모달에서 취소를 누르면 삭제 요청을 보내지 않는다', () => {
    render(<MyInquiries />);
    const [openItem] = screen.getAllByRole('listitem');
    openDeleteModal(openItem);

    expect(screen.getByText('해당 문의를 삭제하시겠습니까?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(doDelete).not.toHaveBeenCalled();
    expect(
      screen.queryByText('해당 문의를 삭제하시겠습니까?'),
    ).not.toBeInTheDocument();
  });

  it('삭제 확인 모달에서 확인을 누르면 삭제를 요청한다', async () => {
    render(<MyInquiries />);
    const [openItem] = screen.getAllByRole('listitem');
    openDeleteModal(openItem);

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() =>
      expect(doDelete).toHaveBeenCalledWith(OPEN_INQUIRY.inquiryId),
    );
    expect(mockOpenSuccessSnackbar).toHaveBeenCalledWith(
      '문의를 삭제했습니다.',
      3000,
    );
  });

  it('확인 버튼을 두 번 눌러도 삭제 요청은 한 번만 보낸다', async () => {
    let resolveDelete;
    doDelete.mockReturnValue(
      new Promise(resolve => {
        resolveDelete = resolve;
      }),
    );

    render(<MyInquiries />);
    const [openItem] = screen.getAllByRole('listitem');
    openDeleteModal(openItem);

    const confirmButton = screen.getByRole('button', { name: '확인' });
    await act(async () => {
      confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(doDelete).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDelete({});
    });
  });

  it('삭제 실패는 서버 원문 대신 학생용 문구를 띄운다', async () => {
    doDelete.mockRejectedValue({
      response: {
        status: 403,
        data: { code: 'AUTH-002', message: '서버 원문' },
      },
    });

    render(<MyInquiries />);
    const [openItem] = screen.getAllByRole('listitem');
    openDeleteModal(openItem);
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() =>
      expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
        '본인 문의만 수정하거나 삭제할 수 있습니다.',
        3000,
      ),
    );
  });

  it('문의가 없으면 안내 문구와 문의하기 버튼을 보여준다', () => {
    useMyInquiries.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    render(<MyInquiries />);

    expect(screen.getByText('접수한 문의가 없습니다.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '문의하기' }));

    expect(mockNavigate).toHaveBeenCalledWith('/inquiry/new');
  });

  it('불러오지 못하면 실패 문구와 다시 시도를 보여준다', () => {
    const refetch = jest.fn();
    useMyInquiries.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    });
    render(<MyInquiries />);

    expect(
      screen.getByText('문의 목록을 불러오지 못했습니다.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
