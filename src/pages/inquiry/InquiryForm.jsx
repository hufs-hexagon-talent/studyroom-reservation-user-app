import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

import {
  useMyInquiries,
  useCreateInquiry,
  useUpdateInquiry,
} from '../../api/inquiry.api';
import { useUserReservation } from '../../api/reservation.api';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';
import { CATEGORY_LABELS } from './inquiryLabels';
import { inquiryErrorMessage } from './inquiryErrorMessage';

const CONTENT_MAX_LENGTH = 1000;
const RESERVATION_PAGE_SIZE = 20;
const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS);

// CheckRoom.jsx 의 출석 상태 표기(출석/미출석/처리됨)를 그대로 따른다.
const reservationStateLabel = state => {
  if (state === 'VISITED') return '출석';
  if (state === 'NOT_VISITED') return '미출석';
  return '처리됨';
};

const formatReservationOption = reservation => {
  const start = new Date(reservation.reservationStartTime);
  const end = new Date(reservation.reservationEndTime);
  return `${format(start, 'MM-dd HH:mm')}~${format(end, 'HH:mm')} ${
    reservation.roomName
  }-${reservation.partitionNumber} · ${reservationStateLabel(
    reservation.reservationState,
  )}`;
};

// startTime 내림차순으로 정렬한 뒤 자른다 — 자르고 나서 정렬하면 최신 예약이
// 20건 밖으로 밀려날 수 있다. 컴포넌트 밖에서 직접 테스트할 수 있도록 별도 export 한다.
export const pickRecentReservations = (list, limit) => {
  if (!Array.isArray(list)) return [];
  return [...list]
    .sort(
      (a, b) =>
        new Date(b.reservationStartTime) - new Date(a.reservationStartTime),
    )
    .slice(0, limit);
};

const InquiryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { data: inquiries, isPending: isListPending } = useMyInquiries();
  const { data: reservations } = useUserReservation();
  const { mutateAsync: createInquiry, isPending: isCreating } =
    useCreateInquiry();
  const { mutateAsync: updateInquiry, isPending: isUpdating } =
    useUpdateInquiry();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  // isPending 은 다음 렌더에서야 true 가 되어 같은 tick 의 두 번째 클릭을 막지 못한다.
  // 실제 차단은 동기 래치가 한다.
  const submittingRef = useRef(false);

  const inquiry = isEditMode
    ? inquiries?.find(item => String(item.inquiryId) === id)
    : null;

  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [content, setContent] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [isChangingReservation, setIsChangingReservation] = useState(false);

  // 수정 모드 초기값: 캐시에서 찾은 문의로 채운다. 예약 선택기는 건드리지 않는다 —
  // 기존 연결은 읽기 전용 스냅샷으로 따로 보여준다.
  useEffect(() => {
    if (!inquiry) return;
    setCategory(inquiry.category);
    setContent(inquiry.content ?? '');
    setReservationId('');
    setIsChangingReservation(false);
  }, [inquiry]);

  // 수정 대상이 캐시에 없으면(직접 주소 접근·이미 삭제됨 등) 목록으로 돌려보낸다.
  useEffect(() => {
    if (!isEditMode || isListPending) return;
    if (!inquiry) navigate('/inquiry');
  }, [isEditMode, isListPending, inquiry, navigate]);

  const recentReservations = pickRecentReservations(
    reservations,
    RESERVATION_PAGE_SIZE,
  );

  const hasExistingLink = isEditMode && Boolean(inquiry?.reservationId);
  const showReservationSelect =
    !isEditMode || !hasExistingLink || isChangingReservation;

  const reservationRequired = category === 'ATTENDANCE';
  // 읽기 전용 스냅샷이 보이는 동안은 그 예약이 곧 선택된 예약이다.
  const hasReservationSelected = showReservationSelect
    ? reservationId !== ''
    : true;

  const contentValid = content.trim().length > 0;
  const canSubmit =
    contentValid && (!reservationRequired || hasReservationSelected);

  const isPending = isEditMode ? isUpdating : isCreating;

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!canSubmit) return;
    submittingRef.current = true;
    try {
      // 선택기를 보여주지 않는 동안(기존 연결을 그대로 두는 경우)에는 reservationId 를
      // null 로 보낸다 — 서버는 null 을 "그대로 둔다"로 해석한다. 연결을 끊는 방법은
      // 의도적으로 없다.
      const payloadReservationId = showReservationSelect
        ? reservationId === ''
          ? null
          : Number(reservationId)
        : null;
      const payload = {
        category,
        content: content.trim(),
        reservationId: payloadReservationId,
      };

      if (isEditMode) {
        await updateInquiry({ inquiryId: inquiry.inquiryId, ...payload });
        openSuccessSnackbar('문의를 수정했습니다.', 3000);
      } else {
        await createInquiry(payload);
        openSuccessSnackbar('문의가 접수되었습니다.', 3000);
      }
      navigate('/inquiry');
    } catch (error) {
      const code = error?.response?.data?.code;
      const normalizedCode = typeof code === 'string' ? code.trim() : null;
      const message = inquiryErrorMessage(error);
      if (message) openErrorSnackbar(message, 3000);
      // 처리 완료된 문의는 더 이상 수정할 수 없다 — 목록으로 돌려보낸다.
      if (normalizedCode === 'INQUIRY-003') navigate('/inquiry');
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-2xl mx-auto">
      <h1 className="font-bold text-2xl text-black mb-6">
        {isEditMode ? '문의 수정' : '문의하기'}
      </h1>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-gray-900">
            유형
          </label>
          <select
            id="category"
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            value={category}
            onChange={e => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map(key => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
          {category === 'ATTENDANCE' && (
            <p className="mt-1 text-sm text-gray-500">
              예약을 특정할 수 없는 출석 문제는 기타로
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="reservationId"
            className="mb-2 block text-sm font-medium text-gray-900">
            관련 예약
          </label>
          {showReservationSelect ? (
            <select
              id="reservationId"
              className="w-full border border-gray-300 rounded-md px-2 py-1"
              value={reservationId}
              onChange={e => setReservationId(e.target.value)}>
              <option value="">해당 없음</option>
              {recentReservations.map(reservation => (
                <option
                  key={reservation.reservationId}
                  value={reservation.reservationId}>
                  {formatReservationOption(reservation)}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center justify-between border border-gray-200 rounded-md px-2 py-1 bg-gray-50">
              <span className="text-sm text-gray-700">
                {inquiry.reservationSummary}
              </span>
              <button
                type="button"
                onClick={() => setIsChangingReservation(true)}
                className="text-sm text-blue-600 hover:underline whitespace-nowrap ml-2">
                다른 예약으로 변경
              </button>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-gray-900">
            문의 내용
          </label>
          <textarea
            id="content"
            rows={6}
            maxLength={CONTENT_MAX_LENGTH}
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <p className="mt-1 text-right text-sm text-gray-500">
            {content.length} / {CONTENT_MAX_LENGTH}
          </p>
        </div>

        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={handleSubmit}
          className="w-full rounded-md bg-[#002D56] px-4 py-2 text-white text-sm disabled:opacity-50">
          {isEditMode ? '수정하기' : '제출하기'}
        </button>
      </div>
    </div>
  );
};

export default InquiryForm;
