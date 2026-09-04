import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import {
  useCreateInquiry,
  useMyInquiries,
  useUpdateInquiry,
} from '../../api/inquiry.api';
import { useUserReservation } from '../../api/reservation.api';

import InquiryForm, { LINKED_RESERVATION_HINT } from './InquiryForm';

jest.mock('../../api/inquiry.api', () => ({
  useMyInquiries: jest.fn(),
  useCreateInquiry: jest.fn(),
  useUpdateInquiry: jest.fn(),
}));

jest.mock('../../api/reservation.api', () => ({
  useUserReservation: jest.fn(),
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
let mockParamsValue = {};
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParamsValue,
}));

const doCreate = jest.fn();
const doUpdate = jest.fn();

// 종료 시각이 과거여야 NOT_VISITED 가 "미출석" 으로 고정된다(미래면 "예약 예정").
const RESERVATION_A = {
  reservationId: 10,
  roomName: '201',
  partitionNumber: 'A',
  reservationStartTime: '2026-08-05T10:00:00',
  reservationEndTime: '2026-08-05T11:00:00',
  reservationState: 'NOT_VISITED',
};
const RESERVATION_B = {
  reservationId: 20,
  roomName: '302',
  partitionNumber: 'B',
  reservationStartTime: '2026-08-06T14:00:00',
  reservationEndTime: '2026-08-06T15:00:00',
  reservationState: 'VISITED',
};
const CARD_A = '2026-08-05 10:00~11:00 201-A 미출석';
const CARD_B = '2026-08-06 14:00~15:00 302-B 출석';

const mockReservations = (over = {}) =>
  useUserReservation.mockReturnValue({
    data: [RESERVATION_A, RESERVATION_B],
    isPending: false,
    isError: false,
    refetch: jest.fn(),
    ...over,
  });

const openPicker = () =>
  fireEvent.click(screen.getByRole('button', { name: '예약 선택' }));

const pickCard = name => {
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name }),
  );
};

const closePicker = () =>
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

const editInquiry = (over = {}) => ({
  inquiryId: 9,
  category: 'ATTENDANCE',
  content: '출석이 안 잡혔어요',
  status: 'OPEN',
  adminMemo: null,
  reservationId: 10,
  reservationSummary: '2026-08-05 10:00~11:00 201-A',
  ...over,
});

// 두 번의 클릭을 같은 tick 에 넣는다. 클릭 사이에 렌더가 끼면 상태 가드만으로도 막혀
// 원래 문제(같은 tick 의 두 번째 클릭)를 재현하지 못한다.
const doubleTap = async button => {
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockParamsValue = {};
  doCreate.mockResolvedValue({});
  doUpdate.mockResolvedValue({});
  useCreateInquiry.mockReturnValue({ mutateAsync: doCreate, isPending: false });
  useUpdateInquiry.mockReturnValue({ mutateAsync: doUpdate, isPending: false });
  useMyInquiries.mockReturnValue({ data: [], isPending: false });
  mockReservations();
});

describe('InquiryForm', () => {
  it('내용이 비어 있으면 제출 버튼이 비활성 상태다', () => {
    render(<InquiryForm />);

    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();
  });

  it('예약 선택이 필요 없는 유형이어도 내용이 비어 있으면 제출 버튼이 비활성 상태다', () => {
    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('유형'), {
      target: { value: 'ETC' },
    });

    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();
  });

  it('문의 내용은 1000자 제한과 함께 글자 수를 보여준다', () => {
    render(<InquiryForm />);
    const textarea = screen.getByLabelText('문의 내용');

    expect(textarea.maxLength).toBe(1000);
    expect(screen.getByText('0 / 1000')).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: '안녕하세요' } });

    expect(screen.getByText('5 / 1000')).toBeInTheDocument();
  });

  it('ATTENDANCE 유형에서 예약을 고르지 않으면 제출 버튼이 비활성 상태고, 고르면 활성이다', () => {
    render(<InquiryForm />);
    expect(screen.getByLabelText('유형')).toHaveValue('ATTENDANCE');
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '출석이 안 잡혀요' },
    });
    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();

    openPicker();
    pickCard(CARD_A);

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('201-A')).toBeInTheDocument();
    expect(screen.getByText('2026-08-05 10:00~11:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '제출하기' })).toBeEnabled();
  });

  it('관련 예약 영역은 그룹이고 필수·선택 안내가 유형을 따라간다', () => {
    render(<InquiryForm />);
    const group = screen.getByRole('group', { name: '관련 예약' });

    expect(within(group).getByText('필수')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('유형'), {
      target: { value: 'FACILITY' },
    });
    expect(within(group).getByText('선택')).toBeInTheDocument();
  });

  it('ATTENDANCE 유형일 때 기타로 접수하라는 도움말을 보여준다', () => {
    render(<InquiryForm />);

    expect(
      screen.getByText('예약을 특정할 수 없는 출석 문제는 기타로'),
    ).toBeInTheDocument();
  });

  it('예약 선택 모달의 카드에 시각·호실·상태가 보인다', () => {
    render(<InquiryForm />);
    openPicker();
    const dialog = screen.getByRole('dialog');

    expect(
      within(dialog).getByRole('button', { name: CARD_B }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: CARD_A }),
    ).toBeInTheDocument();
  });

  it('예약이 없으면 모달에 빈 상태 안내가 보인다', () => {
    mockReservations({ data: [] });
    render(<InquiryForm />);
    openPicker();

    expect(
      within(screen.getByRole('dialog')).getByText(/예약 내역이 없습니다\./),
    ).toBeInTheDocument();
  });

  it('고른 예약을 변경 버튼으로 바꿀 수 있다', () => {
    render(<InquiryForm />);
    openPicker();
    pickCard(CARD_A);

    fireEvent.click(screen.getByRole('button', { name: '관련 예약 변경' }));
    expect(screen.getByRole('button', { pressed: true })).toHaveAccessibleName(
      CARD_A,
    );
    pickCard(CARD_B);

    expect(screen.getByText('302-B')).toBeInTheDocument();
    expect(screen.queryByText('201-A')).toBeNull();
  });

  it('ATTENDANCE 유형에서는 선택 해제 버튼이 없고, 다른 유형에서는 해제하면 연결 없이 보낸다', async () => {
    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '문의합니다' },
    });
    openPicker();
    pickCard(CARD_A);
    expect(
      screen.queryByRole('button', { name: '관련 예약 선택 해제' }),
    ).toBeNull();

    fireEvent.change(screen.getByLabelText('유형'), {
      target: { value: 'ETC' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: '관련 예약 선택 해제' }),
    );
    expect(
      screen.getByRole('button', { name: '예약 선택' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    await waitFor(() =>
      expect(doCreate).toHaveBeenCalledWith({
        category: 'ETC',
        content: '문의합니다',
        reservationId: null,
      }),
    );
  });

  it('요청이 진행 중이면 제출 버튼이 비활성 상태다', () => {
    useCreateInquiry.mockReturnValue({
      mutateAsync: doCreate,
      isPending: true,
    });
    render(<InquiryForm />);

    fireEvent.change(screen.getByLabelText('유형'), {
      target: { value: 'ETC' },
    });
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '문의합니다' },
    });

    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();
  });

  it('제출 버튼을 두 번 눌러도 요청은 한 번만 보낸다', async () => {
    let resolveCreate;
    doCreate.mockReturnValue(
      new Promise(resolve => {
        resolveCreate = resolve;
      }),
    );

    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('유형'), {
      target: { value: 'ETC' },
    });
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '문의합니다' },
    });

    await doubleTap(screen.getByRole('button', { name: '제출하기' }));

    expect(doCreate).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreate({});
    });
  });

  it('제출하면 접수 요청을 보내고 성공 문구 뒤 목록으로 이동한다', async () => {
    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('유형'), {
      target: { value: 'FACILITY' },
    });
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '  냉방이 안 돼요  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    await waitFor(() =>
      expect(doCreate).toHaveBeenCalledWith({
        category: 'FACILITY',
        content: '냉방이 안 돼요',
        reservationId: null,
      }),
    );
    expect(mockOpenSuccessSnackbar).toHaveBeenCalledWith(
      '문의가 접수되었습니다.',
      3000,
    );
    expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
  });

  it('ATTENDANCE 유형에서 예약을 고르면 reservationId 를 숫자로 보낸다', async () => {
    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '출석이 안 잡혀요' },
    });
    openPicker();
    pickCard(CARD_A);

    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    await waitFor(() =>
      expect(doCreate).toHaveBeenCalledWith({
        category: 'ATTENDANCE',
        content: '출석이 안 잡혀요',
        reservationId: RESERVATION_A.reservationId,
      }),
    );
  });

  it('세션 만료 오류는 스낵바 없이 조용히 처리한다', async () => {
    const expired = {
      sessionExpired: true,
      response: { status: 401, data: { code: 'AUTH-013' } },
    };
    doCreate.mockRejectedValue(expired);

    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('유형'), {
      target: { value: 'ETC' },
    });
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '문의' },
    });
    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    await waitFor(() => expect(doCreate).toHaveBeenCalledTimes(1));
    expect(mockOpenErrorSnackbar).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/inquiry');
  });

  it('선택한 예약을 서버가 거절하면(INQUIRY-002) 선택을 비우고 목록을 다시 읽는다', async () => {
    const refetch = jest.fn();
    mockReservations({ refetch });
    doCreate.mockRejectedValue({
      response: {
        status: 400,
        data: { code: 'INQUIRY-002', message: '서버 원문' },
      },
    });

    render(<InquiryForm />);
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '출석이 안 잡혀요' },
    });
    openPicker();
    pickCard(CARD_A);
    refetch.mockClear();
    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    await waitFor(() =>
      expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
        '선택한 예약을 찾을 수 없습니다. 본인 예약만 선택할 수 있습니다.',
        3000,
      ),
    );
    expect(
      screen.getByRole('button', { name: '예약 선택' }),
    ).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalledWith('/inquiry');
  });

  // select 를 없애면서 남는 <label htmlFor> 가 없는 id 를 가리키면 고아 라벨이 된다.
  it('모든 label 의 htmlFor 가 실제 요소를 가리킨다', () => {
    const { container } = render(<InquiryForm />);
    const labels = container.querySelectorAll('label[for]');

    expect(labels.length).toBeGreaterThan(0);
    labels.forEach(label => {
      expect(
        container.querySelector(`#${label.getAttribute('for')}`),
      ).not.toBeNull();
    });
  });

  describe('수정 모드', () => {
    it('캐시에서 찾은 문의로 초기값을 채우고 저장하면 PATCH 요청을 보낸다', async () => {
      mockParamsValue = { id: '7' };
      useMyInquiries.mockReturnValue({
        data: [
          editInquiry({
            inquiryId: 7,
            category: 'FACILITY',
            content: '냉방이 안 됩니다',
            reservationId: null,
            reservationSummary: null,
          }),
        ],
        isPending: false,
      });

      render(<InquiryForm />);

      expect(screen.getByLabelText('유형')).toHaveValue('FACILITY');
      expect(screen.getByLabelText('문의 내용')).toHaveValue(
        '냉방이 안 됩니다',
      );
      expect(
        screen.getByRole('button', { name: '예약 선택' }),
      ).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('문의 내용'), {
        target: { value: '냉방이 여전히 안 됩니다' },
      });
      fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() =>
        expect(doUpdate).toHaveBeenCalledWith({
          inquiryId: 7,
          category: 'FACILITY',
          content: '냉방이 여전히 안 됩니다',
          reservationId: null,
        }),
      );
      expect(mockOpenSuccessSnackbar).toHaveBeenCalledWith(
        '문의를 수정했습니다.',
        3000,
      );
      expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
    });

    it('예약이 연결된 문의는 스냅샷과 안내를 보여주고, 바꾸지 않으면 reservationId 를 null 로 보낸다', async () => {
      mockParamsValue = { id: '9' };
      useMyInquiries.mockReturnValue({
        data: [editInquiry()],
        isPending: false,
      });

      render(<InquiryForm />);

      expect(
        screen.getByText('2026-08-05 10:00~11:00 201-A'),
      ).toBeInTheDocument();
      expect(screen.getByText(LINKED_RESERVATION_HINT)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '예약 선택' })).toBeNull();
      expect(
        screen.getByRole('button', { name: '다른 예약으로 변경' }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() =>
        expect(doUpdate).toHaveBeenCalledWith({
          inquiryId: 9,
          category: 'ATTENDANCE',
          content: '출석이 안 잡혔어요',
          reservationId: null,
        }),
      );
    });

    it('다른 예약으로 변경에서 고르지 않고 닫으면 아무것도 바뀌지 않는다', async () => {
      mockParamsValue = { id: '9' };
      useMyInquiries.mockReturnValue({
        data: [editInquiry()],
        isPending: false,
      });

      render(<InquiryForm />);
      fireEvent.click(
        screen.getByRole('button', { name: '다른 예약으로 변경' }),
      );
      expect(
        within(screen.getByRole('dialog')).getByRole('button', {
          pressed: true,
        }),
      ).toHaveAccessibleName(CARD_A);
      closePicker();

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(
        screen.getByText('2026-08-05 10:00~11:00 201-A'),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() =>
        expect(doUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ reservationId: null }),
        ),
      );
    });

    it('다른 예약을 고르면 그 예약으로 보내고, 되돌리기로 스냅샷에 복귀할 수 있다', async () => {
      mockParamsValue = { id: '9' };
      useMyInquiries.mockReturnValue({
        data: [editInquiry()],
        isPending: false,
      });

      render(<InquiryForm />);
      fireEvent.click(
        screen.getByRole('button', { name: '다른 예약으로 변경' }),
      );
      pickCard(CARD_B);

      expect(screen.getByText('302-B')).toBeInTheDocument();
      expect(screen.queryByText('2026-08-05 10:00~11:00 201-A')).toBeNull();
      expect(
        screen.queryByRole('button', { name: '관련 예약 선택 해제' }),
      ).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: '수정하기' }));
      await waitFor(() =>
        expect(doUpdate).toHaveBeenCalledWith({
          inquiryId: 9,
          category: 'ATTENDANCE',
          content: '출석이 안 잡혔어요',
          reservationId: RESERVATION_B.reservationId,
        }),
      );

      fireEvent.click(
        screen.getByRole('button', { name: '관련 예약 되돌리기' }),
      );
      expect(
        screen.getByText('2026-08-05 10:00~11:00 201-A'),
      ).toBeInTheDocument();
      expect(screen.queryByText('302-B')).toBeNull();
    });

    // 예약이 학생 취소로 지워지면 id 는 null 이고 스냅샷만 남는다. 서버는 스냅샷이 있으면
    // ATTENDANCE 수정을 통과시키므로 화면도 막지 않는다.
    it('취소된 예약만 남은 문의도 ATTENDANCE 로 수정할 수 있다', async () => {
      mockParamsValue = { id: '9' };
      useMyInquiries.mockReturnValue({
        data: [editInquiry({ reservationId: null })],
        isPending: false,
      });

      render(<InquiryForm />);

      expect(
        screen.getByText('2026-08-05 10:00~11:00 201-A · 취소된 예약'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '수정하기' })).toBeEnabled();

      fireEvent.click(screen.getByRole('button', { name: '수정하기' }));
      await waitFor(() =>
        expect(doUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'ATTENDANCE',
            reservationId: null,
          }),
        ),
      );
    });

    it('수정 대상 문의가 캐시에 없으면 목록으로 돌아간다', () => {
      mockParamsValue = { id: '999' };
      useMyInquiries.mockReturnValue({ data: [], isPending: false });

      render(<InquiryForm />);

      expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
    });

    it('처리 완료된 문의를 수정하려 하면 문구를 보여주고 목록으로 돌려보낸다', async () => {
      mockParamsValue = { id: '3' };
      useMyInquiries.mockReturnValue({
        data: [
          editInquiry({
            inquiryId: 3,
            category: 'ETC',
            content: '내용',
            reservationId: null,
            reservationSummary: null,
          }),
        ],
        isPending: false,
      });
      doUpdate.mockRejectedValue({
        response: {
          status: 400,
          data: { code: 'INQUIRY-003', message: '서버 원문' },
        },
      });

      render(<InquiryForm />);
      fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() =>
        expect(mockOpenErrorSnackbar).toHaveBeenCalledWith(
          '처리 완료된 문의는 수정하거나 삭제할 수 없습니다.',
          3000,
        ),
      );
      expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
    });
  });
});
