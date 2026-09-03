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
  useMyInquiries,
  useCreateInquiry,
  useUpdateInquiry,
} from '../../api/inquiry.api';
import { useUserReservation } from '../../api/reservation.api';

import InquiryForm, { pickRecentReservations } from './InquiryForm';

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

const RESERVATION_A = {
  reservationId: 10,
  roomName: '201',
  partitionNumber: 'A',
  reservationStartTime: '2026-09-05T10:00:00',
  reservationEndTime: '2026-09-05T11:00:00',
  reservationState: 'NOT_VISITED',
};
const RESERVATION_B = {
  reservationId: 20,
  roomName: '302',
  partitionNumber: 'B',
  reservationStartTime: '2026-09-06T14:00:00',
  reservationEndTime: '2026-09-06T15:00:00',
  reservationState: 'VISITED',
};

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
  useUserReservation.mockReturnValue({ data: [RESERVATION_A, RESERVATION_B] });
});

describe('pickRecentReservations', () => {
  const reservationAt = (id, startTime) => ({
    reservationId: id,
    roomName: '201',
    partitionNumber: 'A',
    reservationStartTime: startTime,
    reservationEndTime: startTime,
    reservationState: 'NOT_VISITED',
  });

  it('startTime 내림차순으로 정렬한다', () => {
    const list = [
      reservationAt(2, '2026-09-06T00:00:00'),
      reservationAt(1, '2026-09-01T00:00:00'),
      reservationAt(3, '2026-09-03T00:00:00'),
    ];

    const result = pickRecentReservations(list, 20);

    expect(result.map(r => r.reservationId)).toEqual([2, 3, 1]);
  });

  it('20건으로 제한하되, 앞에서 자르지 않고 정렬한 뒤 최신 20건을 남긴다', () => {
    // 오래된 순으로 그대로 넣는다 — 먼저 20건을 잘라내고 나서 정렬하는 버그가 있다면
    // 앞에서부터 잘린 1~20(가장 오래된 20건)을 내림차순으로 뒤집은 [20,19,...,1] 을
    // 돌려주므로, 올바른 정렬 뒤 최신 20건인 [25,24,...,6] 과 값이 달라 이 테스트가
    // 실제로 실패한다. (뒤섞어 넣으면 우연히 앞 20개가 이미 최신 20건이 되는 셔플도
    // 있어 버그를 못 잡을 수 있다 — 오래된 순 그대로가 가장 확실하다.)
    const chronological = Array.from({ length: 25 }, (_, i) =>
      reservationAt(i + 1, `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00`),
    );

    const result = pickRecentReservations(chronological, 20);

    expect(result).toHaveLength(20);
    expect(result.map(r => r.reservationId)).toEqual(
      Array.from({ length: 20 }, (_, i) => 25 - i),
    );
  });

  it('목록이 없으면 빈 배열을 돌려준다', () => {
    expect(pickRecentReservations(undefined, 20)).toEqual([]);
    expect(pickRecentReservations([], 20)).toEqual([]);
  });
});

describe('InquiryForm', () => {
  it('내용이 비어 있으면 제출 버튼이 비활성 상태다', () => {
    render(<InquiryForm />);

    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();
  });

  it('예약 선택이 필요 없는 유형이어도 내용이 비어 있으면 제출 버튼이 비활성 상태다', () => {
    // 기본 유형인 ATTENDANCE 는 예약 미선택으로도 비활성화되어, 위 테스트만으로는
    // 내용 검사가 실제로 작동하는지 알 수 없다. 예약 선택이 필요 없는 ETC 로 바꿔
    // 내용 검사만 남기고 확인한다.
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

  it('ATTENDANCE 유형에서 예약을 고르지 않으면 제출 버튼이 비활성 상태다', () => {
    render(<InquiryForm />);
    // 기본 유형은 ATTENDANCE(출석·예약 이의) 다.
    expect(screen.getByLabelText('유형')).toHaveValue('ATTENDANCE');

    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '출석이 안 잡혀요' },
    });
    expect(screen.getByRole('button', { name: '제출하기' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('관련 예약'), {
      target: { value: String(RESERVATION_A.reservationId) },
    });
    expect(screen.getByRole('button', { name: '제출하기' })).toBeEnabled();
  });

  it('ATTENDANCE 유형일 때 기타로 접수하라는 도움말을 보여준다', () => {
    render(<InquiryForm />);

    expect(
      screen.getByText('예약을 특정할 수 없는 출석 문제는 기타로'),
    ).toBeInTheDocument();
  });

  it('예약이 없으면 해당 없음만 고를 수 있다', () => {
    useUserReservation.mockReturnValue({ data: [] });
    render(<InquiryForm />);

    const options = within(screen.getByLabelText('관련 예약')).getAllByRole(
      'option',
    );
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('해당 없음');
  });

  it('예약 옵션은 시간·호실과 함께 출석 상태 라벨을 보여준다', () => {
    render(<InquiryForm />);
    const select = screen.getByLabelText('관련 예약');

    expect(
      within(select).getByText('09-06 14:00~15:00 302-B · 출석'),
    ).toBeInTheDocument();
    expect(
      within(select).getByText('09-05 10:00~11:00 201-A · 미출석'),
    ).toBeInTheDocument();
  });

  it('요청이 진행 중이면 제출 버튼이 비활성 상태다', () => {
    useCreateInquiry.mockReturnValue({ mutateAsync: doCreate, isPending: true });
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
    fireEvent.change(screen.getByLabelText('관련 예약'), {
      target: { value: String(RESERVATION_A.reservationId) },
    });

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

  describe('수정 모드', () => {
    it('캐시에서 찾은 문의로 초기값을 채우고 저장하면 PATCH 요청을 보낸다', async () => {
      mockParamsValue = { id: '7' };
      useMyInquiries.mockReturnValue({
        data: [
          {
            inquiryId: 7,
            category: 'FACILITY',
            content: '냉방이 안 됩니다',
            status: 'OPEN',
            adminMemo: null,
            reservationId: null,
            reservationSummary: null,
          },
        ],
        isPending: false,
      });

      render(<InquiryForm />);

      expect(screen.getByLabelText('유형')).toHaveValue('FACILITY');
      expect(screen.getByLabelText('문의 내용')).toHaveValue('냉방이 안 됩니다');

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

    it('예약이 연결된 문의는 기존 예약을 읽기 전용으로 보여주고, 바꾸지 않으면 reservationId 를 null 로 보낸다', async () => {
      mockParamsValue = { id: '9' };
      useMyInquiries.mockReturnValue({
        data: [
          {
            inquiryId: 9,
            category: 'ATTENDANCE',
            content: '출석이 안 잡혔어요',
            status: 'OPEN',
            adminMemo: null,
            reservationId: 10,
            reservationSummary: '2026-09-05 10:00~11:00 201-A',
          },
        ],
        isPending: false,
      });

      render(<InquiryForm />);

      expect(
        screen.getByText('2026-09-05 10:00~11:00 201-A'),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('관련 예약')).not.toBeInTheDocument();
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

    it('다른 예약으로 변경을 누르면 선택기가 나타나고, 고른 예약으로 보낸다', async () => {
      mockParamsValue = { id: '9' };
      useMyInquiries.mockReturnValue({
        data: [
          {
            inquiryId: 9,
            category: 'ATTENDANCE',
            content: '출석이 안 잡혔어요',
            status: 'OPEN',
            adminMemo: null,
            reservationId: 10,
            reservationSummary: '2026-09-05 10:00~11:00 201-A',
          },
        ],
        isPending: false,
      });

      render(<InquiryForm />);
      fireEvent.click(screen.getByRole('button', { name: '다른 예약으로 변경' }));

      fireEvent.change(screen.getByLabelText('관련 예약'), {
        target: { value: String(RESERVATION_B.reservationId) },
      });
      fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() =>
        expect(doUpdate).toHaveBeenCalledWith({
          inquiryId: 9,
          category: 'ATTENDANCE',
          content: '출석이 안 잡혔어요',
          reservationId: RESERVATION_B.reservationId,
        }),
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
          {
            inquiryId: 3,
            category: 'ETC',
            content: '내용',
            status: 'OPEN',
            adminMemo: null,
            reservationId: null,
            reservationSummary: null,
          },
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
