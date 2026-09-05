import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { useDeleteInquiry, useMyInquiries } from '../../api/inquiry.api';

import MyInquiries, { resolvedToggleLabel } from './MyInquiries';

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

const mockList = (data, over = {}) =>
  useMyInquiries.mockReturnValue({
    data,
    isPending: false,
    isError: false,
    refetch: jest.fn(),
    ...over,
  });

beforeEach(() => {
  jest.clearAllMocks();
  doDelete.mockResolvedValue({});
  useDeleteInquiry.mockReturnValue({ mutateAsync: doDelete, isPending: false });
  mockList([OPEN_INQUIRY, RESOLVED_INQUIRY]);
});

const itemOf = text => screen.getByText(text).closest('li');
const openItem = () => itemOf(OPEN_INQUIRY.content);
const resolvedToggle = () =>
  screen.getByRole('button', { name: /^처리완료 \d+건/ });
const expandResolved = () => fireEvent.click(resolvedToggle());
const resolvedItem = () => itemOf(RESOLVED_INQUIRY.content);

const openDeleteModal = item =>
  fireEvent.click(within(item).getByRole('button', { name: '삭제' }));

describe('resolvedToggleLabel', () => {
  it('답변이 있으면 건수를 덧붙이고 없으면 처리완료 건수만', () => {
    expect(resolvedToggleLabel(3, 0)).toBe('처리완료 3건');
    expect(resolvedToggleLabel(3, 2)).toBe('처리완료 3건 · 관리자 답변 2건');
  });
});

describe('MyInquiries', () => {
  it('제목은 1:1 문의다', () => {
    render(<MyInquiries />);

    expect(
      screen.getByRole('heading', { name: '1:1 문의' }),
    ).toBeInTheDocument();
  });

  it('접수됨 상태인 문의만 수정·삭제 버튼을 보여준다', () => {
    render(<MyInquiries />);
    expandResolved();

    expect(
      within(openItem()).getByRole('button', { name: '수정' }),
    ).toBeInTheDocument();
    expect(
      within(openItem()).getByRole('button', { name: '삭제' }),
    ).toBeInTheDocument();
    expect(
      within(resolvedItem()).queryByRole('button', { name: '수정' }),
    ).toBeNull();
    expect(
      within(resolvedItem()).queryByRole('button', { name: '삭제' }),
    ).toBeNull();
  });

  it('유형과 상태 배지를 함께 보여준다', () => {
    render(<MyInquiries />);
    expandResolved();

    expect(
      within(openItem()).getByText('시설·키오스크 고장'),
    ).toBeInTheDocument();
    expect(within(openItem()).getByText('접수됨')).toBeInTheDocument();
    expect(
      within(resolvedItem()).getByText('출석·예약 이의'),
    ).toBeInTheDocument();
    expect(within(resolvedItem()).getByText('처리완료')).toBeInTheDocument();
  });

  it('완료된 문의는 처리 메모를 보여준다', () => {
    render(<MyInquiries />);
    expandResolved();

    expect(
      within(resolvedItem()).getByText(/확인 후 출석 처리했습니다\./),
    ).toBeInTheDocument();
    expect(within(openItem()).queryByText(/처리 메모/)).toBeNull();
  });

  it('연결된 예약 요약을 카드에 보여주고, 예약이 지워졌으면 취소된 예약이라고 적는다', () => {
    mockList([
      OPEN_INQUIRY,
      RESOLVED_INQUIRY,
      {
        ...OPEN_INQUIRY,
        inquiryId: 3,
        content: '취소한 예약인데 출석 문제가 있어요.',
        reservationId: null,
        reservationSummary: '2026-08-28 13:00~14:00 306-1',
      },
    ]);
    render(<MyInquiries />);
    expandResolved();

    expect(
      within(resolvedItem()).getByText('예약 2026-08-30 10:00~11:00 201-A'),
    ).toBeInTheDocument();
    expect(
      within(itemOf('취소한 예약인데 출석 문제가 있어요.')).getByText(
        '예약 2026-08-28 13:00~14:00 306-1 · 취소된 예약',
      ),
    ).toBeInTheDocument();
    expect(within(openItem()).queryByText(/^예약 /)).toBeNull();
  });

  // 처리완료 문의는 본문을 끝까지 읽을 다른 길이 없다. 접수됨은 항상 펼쳐진 그룹이라
  // 클램프를 유지한다(전문은 수정 화면에서 읽힌다).
  it('처리완료 카드는 본문 전문을, 접수됨 카드는 2줄 클램프를 쓴다', () => {
    const longContent = `첫 줄입니다.\n둘째 줄입니다.\n${'가'.repeat(400)}`;
    mockList([OPEN_INQUIRY, { ...RESOLVED_INQUIRY, content: longContent }]);
    render(<MyInquiries />);
    expandResolved();

    // 기본 문자열 매처는 줄바꿈을 공백으로 정규화하므로 textContent 를 직접 비교한다.
    const resolvedBody = screen.getByText(
      (_, el) => el.tagName === 'P' && el.textContent === longContent,
    );
    expect(resolvedBody).toHaveClass('whitespace-pre-wrap');
    expect(resolvedBody).not.toHaveClass('line-clamp-2');
    expect(screen.getByText(OPEN_INQUIRY.content)).toHaveClass('line-clamp-2');
  });

  it('수정 버튼을 누르면 해당 문의의 수정 화면으로 이동한다', () => {
    render(<MyInquiries />);

    fireEvent.click(within(openItem()).getByRole('button', { name: '수정' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      `/inquiry/${OPEN_INQUIRY.inquiryId}/edit`,
    );
  });

  it('삭제 확인 모달에서 취소를 누르면 삭제 요청을 보내지 않는다', () => {
    render(<MyInquiries />);
    openDeleteModal(openItem());

    expect(
      screen.getByText('해당 문의를 삭제하시겠습니까?'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(doDelete).not.toHaveBeenCalled();
    expect(
      screen.queryByText('해당 문의를 삭제하시겠습니까?'),
    ).not.toBeInTheDocument();
  });

  it('삭제 확인 모달에서 확인을 누르면 삭제를 요청한다', async () => {
    render(<MyInquiries />);
    openDeleteModal(openItem());

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
    openDeleteModal(openItem());

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
    openDeleteModal(openItem());
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    await waitFor(() =>
      expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
        '본인 문의만 수정하거나 삭제할 수 있습니다.',
        3000,
      ),
    );
  });

  it('문의가 없으면 안내 문구를 보여주고 헤더의 문의하기로 접수 화면에 간다', () => {
    mockList([]);
    render(<MyInquiries />);

    expect(screen.getByText('접수한 문의가 없습니다.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '문의하기' }));

    expect(mockNavigate).toHaveBeenCalledWith('/inquiry/new');
  });

  // 마이페이지에서 폼으로 바로 가는 항목이 사라졌다. 목록 API 가 죽어도 접수 경로는 살아야 한다.
  it('불러오지 못해도 문의하기 버튼이 있고, 다시 시도는 refetch 를 부른다', () => {
    const refetch = jest.fn();
    mockList(undefined, { isError: true, refetch });
    render(<MyInquiries />);

    expect(
      screen.getByText('문의 목록을 불러오지 못했습니다.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '문의하기' }));
    expect(mockNavigate).toHaveBeenCalledWith('/inquiry/new');
  });

  it('불러오는 중에도 문의하기 버튼이 있다', () => {
    mockList(undefined, { isPending: true });
    render(<MyInquiries />);

    expect(
      screen.getByText('문의 목록을 불러오는 중입니다.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '문의하기' }),
    ).toBeInTheDocument();
  });

  it('접수됨이 있으면 처리완료는 접혀 있고 토글로 펼쳐진다', () => {
    render(<MyInquiries />);

    expect(resolvedToggle()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(RESOLVED_INQUIRY.content)).toBeNull();
    expect(screen.getByText(OPEN_INQUIRY.content)).toBeInTheDocument();

    expandResolved();
    expect(resolvedToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(RESOLVED_INQUIRY.content)).toBeInTheDocument();

    expandResolved();
    expect(screen.queryByText(RESOLVED_INQUIRY.content)).toBeNull();
  });

  it('접수됨이 없으면 처리완료가 기본으로 펼쳐져 있다', () => {
    mockList([RESOLVED_INQUIRY]);
    render(<MyInquiries />);

    expect(resolvedToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(RESOLVED_INQUIRY.content)).toBeInTheDocument();
  });

  it('처리완료가 없으면 토글 행을 그리지 않는다', () => {
    mockList([OPEN_INQUIRY]);
    render(<MyInquiries />);

    expect(screen.queryByRole('button', { name: /^처리완료/ })).toBeNull();
  });

  // 첫 방문은 첫 렌더가 로딩(inquiries undefined)이다. 접힘 여부를 useState 초기값으로
  // 굳히면 응답이 와서 접수됨이 생겨도 영영 펼쳐진 채다.
  it('로딩 뒤에 데이터가 와도 접수됨이 있으면 처리완료가 접혀 있다', () => {
    mockList(undefined, { isPending: true });
    const { rerender } = render(<MyInquiries />);
    expect(screen.queryByRole('button', { name: /^처리완료/ })).toBeNull();

    mockList([OPEN_INQUIRY, RESOLVED_INQUIRY]);
    rerender(<MyInquiries />);

    expect(resolvedToggle()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(RESOLVED_INQUIRY.content)).toBeNull();
  });

  it('토글 라벨은 답변이 달린 처리완료가 있을 때만 답변 건수를 붙인다', () => {
    const { unmount } = render(<MyInquiries />);
    expect(
      screen.getByRole('button', { name: '처리완료 1건 · 관리자 답변 1건' }),
    ).toBeInTheDocument();
    unmount();

    mockList([OPEN_INQUIRY, { ...RESOLVED_INQUIRY, adminMemo: null }]);
    render(<MyInquiries />);
    expect(
      screen.getByRole('button', { name: '처리완료 1건' }),
    ).toBeInTheDocument();
  });
});
