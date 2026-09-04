import React, { useEffect, useRef } from 'react';
import { Modal } from 'flowbite-react';

import { modalTheme } from '../../components/modal/modalTheme';

import ReservationCard from './ReservationCard';
import {
  formatReservationTime,
  formatRoom,
  reservationStateLabel,
  sortReservationsLatestFirst,
} from './reservationView';

export const PICKER_LOADING_MESSAGE = '예약을 불러오는 중입니다.';
export const PICKER_ERROR_MESSAGE = '예약을 불러오지 못했습니다.';
export const PICKER_STALE_MESSAGE = '최신 상태를 못 받아왔습니다.';
export const PICKER_EMPTY_MESSAGE =
  '예약 내역이 없습니다. 출석 문제인데 예약을 특정할 수 없으면 유형을 기타로 바꿔 접수해 주세요.';

const retryButtonClass =
  'rounded-md bg-[#002D56] px-4 py-2 text-sm text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]';

// 문의 폼의 "관련 예약" 선택 모달. 호출 형태는 RoomPage 의 예약 확인 모달과 같다 —
// ref + initialFocus 로 열릴 때 포커스 링을 막고, <Modal> 에 style/display 클래스를 주지
// 않으며(패널이 내용 크기로 줄어든다), size 는 테마 sizes 에 있는 '2xl' 을 명시한다 — 기본값이 2xl
// 이라는 암묵 의존을 없애고 테스트 기대값을 테마 상수에서 조립할 수 있게 한다.
// 분기 순서가 중요하다: 목록이 있으면 isError 여도 목록을 그린다. react-query v5 는 재조회가
// 실패하면 data 를 유지한 채 status 만 error 로 바꾸고 다음 성공 전까지 error 로 눌러앉는다 —
// 오류를 먼저 보면 손에 쥔 캐시를 버려 오프라인에서 출석 이의 접수가 막힌다.
const ReservationPickerModal = ({
  show,
  onClose,
  onPick,
  selectedId,
  reservations,
  isPending,
  isError,
  refetch,
}) => {
  const dialogRef = useRef(null);

  // 열릴 때마다 한 번 다시 읽는다 — 예약 직후·키오스크 출석 직후의 상태를 반영한다.
  // 캐시가 있으면 그 목록을 먼저 보여 주고 응답이 오면 바뀐다.
  useEffect(() => {
    if (show) refetch();
  }, [show, refetch]);

  const list = sortReservationsLatestFirst(reservations);

  let body;
  if (isPending) {
    body = (
      <p className="py-6 text-center text-sm text-gray-500">
        {PICKER_LOADING_MESSAGE}
      </p>
    );
  } else if (list.length > 0) {
    body = (
      <>
        {isError && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
            <span>{PICKER_STALE_MESSAGE}</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="whitespace-nowrap font-bold text-[#002D56] hover:underline">
              다시 시도
            </button>
          </div>
        )}
        <ul className="space-y-2">
          {list.map(reservation => {
            const room = formatRoom(reservation);
            const time = formatReservationTime(reservation);
            const state = reservationStateLabel(reservation);
            const selected = reservation.reservationId === selectedId;
            return (
              <li key={reservation.reservationId}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${time} ${room} ${state}`}
                  onClick={() => {
                    onPick(reservation);
                    onClose();
                  }}
                  className="min-h-[44px] w-full rounded-md focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]">
                  <ReservationCard
                    room={room}
                    time={time}
                    state={state}
                    selected={selected}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </>
    );
  } else if (isError) {
    body = (
      <div className="py-6 text-center text-sm text-gray-500">
        {PICKER_ERROR_MESSAGE}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => refetch()}
            className={retryButtonClass}>
            다시 시도
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <p className="py-6 text-center text-sm text-gray-500 break-keep">
        {PICKER_EMPTY_MESSAGE}
      </p>
    );
  }

  return (
    <Modal
      ref={dialogRef}
      initialFocus={dialogRef}
      className="flex items-center justify-center"
      theme={modalTheme}
      size="2xl"
      dismissible
      show={show}
      onClose={onClose}>
      <Modal.Header>예약 선택</Modal.Header>
      <Modal.Body>
        {/* 공용 테마의 body 는 pb-0 이고 그 아래 여백은 footer 가 만드는데 이 모달에는
            footer 가 없다. 마지막 카드가 패널의 둥근 모서리에 붙지 않게 여기서 준다. */}
        <div className="pb-5">{body}</div>
      </Modal.Body>
    </Modal>
  );
};

export default ReservationPickerModal;
