import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { modalTheme } from '../../components/modal/modalTheme';

import ReservationPickerModal, {
  PICKER_EMPTY_MESSAGE,
  PICKER_ERROR_MESSAGE,
  PICKER_LOADING_MESSAGE,
  PICKER_STALE_MESSAGE,
} from './ReservationPickerModal';

const RESERVATION_A = {
  reservationId: 10,
  roomName: '201',
  partitionNumber: 'A',
  reservationStartTime: '2026-09-05T10:00:00',
  reservationEndTime: '2026-09-05T11:00:00',
  reservationState: 'VISITED',
};
const RESERVATION_B = {
  reservationId: 20,
  roomName: '302',
  partitionNumber: 'B',
  reservationStartTime: '2026-09-06T14:00:00',
  reservationEndTime: '2026-09-06T15:00:00',
  reservationState: 'PROCESSED',
};

const renderPicker = (over = {}) => {
  const props = {
    show: true,
    onClose: jest.fn(),
    onPick: jest.fn(),
    selectedId: null,
    reservations: [RESERVATION_A, RESERVATION_B],
    isPending: false,
    isError: false,
    refetch: jest.fn(),
    ...over,
  };
  const utils = render(<ReservationPickerModal {...props} />);
  return { ...utils, props };
};

describe('ReservationPickerModal', () => {
  it('열리면 dialog 에 공용 테마가 적용되고 제목이 하나다', () => {
    renderPicker();
    const dialog = screen.getByRole('dialog');

    // flowbite 는 dialog div 에 content.base 와 root.sizes[size] 를 twMerge 로 합쳐 붙인다.
    // 기대값을 테마 상수에서 조립해 정확히 같은 집합인지 본다 — 다른 테마가 섞이면 깨진다.
    expect(dialog.className.split(/\s+/).filter(Boolean).sort()).toEqual(
      [
        ...modalTheme.content.base.split(/\s+/),
        ...modalTheme.root.sizes['2xl'].split(/\s+/),
      ]
        .filter(Boolean)
        .sort(),
    );
    expect(dialog.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1);
    expect(within(dialog).getByText('예약 선택')).toBeInTheDocument();
    // 공용 테마의 body 는 pb-0 이고 footer 가 여백을 만드는데 이 모달엔 footer 가 없다.
    expect(dialog.querySelector('.pb-5')).not.toBeNull();
  });

  it('열릴 때 refetch 를 한 번 부르고, 닫혀 있으면 부르지 않는다', () => {
    const { props, rerender } = renderPicker({ show: false });
    expect(props.refetch).not.toHaveBeenCalled();

    rerender(<ReservationPickerModal {...props} show />);
    expect(props.refetch).toHaveBeenCalledTimes(1);
  });

  it('예약을 최신순 카드로 보여주고 각 항목에 버튼이 하나다', () => {
    renderPicker();
    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(within(items[0]).getAllByRole('button')).toHaveLength(1);
    expect(
      within(items[0]).getByRole('button', {
        name: '2026-09-06 14:00~15:00 302-B 처리됨',
      }),
    ).toBeInTheDocument();
    expect(
      within(items[1]).getByRole('button', {
        name: '2026-09-05 10:00~11:00 201-A 출석',
      }),
    ).toBeInTheDocument();
  });

  it('카드를 누르면 onPick 뒤 onClose 가 불린다', () => {
    const { props } = renderPicker();

    fireEvent.click(
      screen.getByRole('button', { name: '2026-09-05 10:00~11:00 201-A 출석' }),
    );

    expect(props.onPick).toHaveBeenCalledWith(RESERVATION_A);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('selectedId 와 같은 카드만 aria-pressed 와 선택됨 표시를 갖는다', () => {
    renderPicker({ selectedId: RESERVATION_B.reservationId });
    const pressed = screen.getByRole('button', { pressed: true });

    expect(pressed).toHaveAccessibleName('2026-09-06 14:00~15:00 302-B 처리됨');
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(1);
    expect(screen.getByText('선택됨').closest('li')).toBe(
      pressed.closest('li'),
    );
  });

  it('데이터가 없고 로딩 중이면 안내만 보여준다', () => {
    renderPicker({ reservations: undefined, isPending: true });

    expect(screen.getByText(PICKER_LOADING_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).toBeNull();
  });

  it('데이터가 없고 실패하면 실패 문구와 다시 시도를 보여준다', () => {
    const { props } = renderPicker({ reservations: undefined, isError: true });

    expect(screen.getByText(PICKER_ERROR_MESSAGE)).toBeInTheDocument();
    props.refetch.mockClear();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(props.refetch).toHaveBeenCalledTimes(1);
  });

  // react-query 는 재조회가 실패해도 data 를 유지한 채 status 만 error 로 바꾼다.
  // 오류를 먼저 보면 손에 쥔 캐시를 버려 오프라인에서 출석 이의 접수가 막힌다.
  it('실패했어도 캐시 목록이 있으면 목록을 그리고 배너만 얹는다', () => {
    const { props } = renderPicker({ isError: true });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(PICKER_STALE_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(PICKER_ERROR_MESSAGE)).toBeNull();
    props.refetch.mockClear();
    const retry = screen.getByRole('button', { name: '다시 시도' });
    // 배너 안의 글자 버튼이라 패딩이 없으면 높이가 ~20px 로 떨어진다.
    expect(retry).toHaveClass('min-h-[44px]');
    fireEvent.click(retry);
    expect(props.refetch).toHaveBeenCalledTimes(1);
  });

  it('예약이 없으면 빈 상태 안내를 보여준다', () => {
    renderPicker({ reservations: [] });

    expect(screen.getByText(PICKER_EMPTY_MESSAGE)).toBeInTheDocument();
  });

  it('닫혀 있으면 아무것도 그리지 않는다', () => {
    renderPicker({ show: false });

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
