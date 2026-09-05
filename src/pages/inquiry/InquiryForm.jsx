import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useCreateInquiry,
  useMyInquiries,
  useUpdateInquiry,
} from '../../api/inquiry.api';
import { useUserReservation } from '../../api/reservation.api';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';

import { inquiryErrorMessage } from './inquiryErrorMessage';
import { CATEGORY_LABELS } from './inquiryLabels';
import ReservationCard from './ReservationCard';
import ReservationPickerModal from './ReservationPickerModal';
import {
  formatReservationTime,
  formatRoom,
  linkedReservationLabel,
  reservationStateLabel,
} from './reservationView';

const CONTENT_MAX_LENGTH = 1000;
const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS);

// 서버에 연결 해제가 없다(수정의 reservationId null = 기존 연결 유지). 접수에서는 "선택 해제"
// 를 배웠는데 수정에서 사라지면 버튼을 찾아 헤매므로, 제약을 화면에 적는다.
export const LINKED_RESERVATION_HINT =
  '연결한 예약은 다른 예약으로 바꿀 수만 있습니다';

// Tailwind 는 소스를 정적으로 스캔한다 — 클래스 문자열은 조립하지 않고 완결된 리터럴로 둔다.
const fieldClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]';
const primaryButtonClass =
  'w-full rounded-md bg-[#002D56] px-4 py-2 text-sm text-white disabled:opacity-50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]';
const outlineButtonClass =
  'rounded-md border border-[#002D56] bg-white px-4 py-2 text-sm font-semibold text-[#002D56] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]';
// 글자만 있는 보조 버튼이라 높이가 ~20px 이었다. 모달 카드와 같은 44px 탭 영역을 준다.
const linkButtonClass =
  'inline-flex min-h-[44px] items-center px-2 text-sm text-[#002D56] hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]';

const InquiryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { data: inquiries, isPending: isListPending } = useMyInquiries();
  const {
    data: reservations,
    isPending: isReservationsPending,
    isError: isReservationsError,
    refetch: refetchReservations,
  } = useUserReservation();
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
  // 모달에서 고른 예약 객체. id 만 두면 폼 안에 카드를 그릴 수 없다.
  const [pickedReservation, setPickedReservation] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // flowbite 모달(내부적으로 floating-ui)은 닫힐 때 "아직 DOM 에 붙어 있는" 원래 트리거로만
  // 포커스를 되돌린다. 예약을 고르면 트리거였던 "예약 선택" 버튼이 그 자리에서 사라져 되돌릴
  // 대상이 없어지고 포커스가 <body> 로 떨어졌다. 그래서 (1) 피커를 여는 주 버튼은 세 상태에서
  // 같은 엘리먼트로 두어 항상 연결돼 있게 하고, (2) 자기 자신을 언마운트하는 보조 버튼
  // (선택 해제·되돌리기)과 선택 성공 경로에서는 여기서 직접 포커스를 옮긴다.
  const primaryButtonRef = useRef(null);
  const [focusPrimary, setFocusPrimary] = useState(false);
  useEffect(() => {
    if (!focusPrimary) return;
    primaryButtonRef.current?.focus();
    setFocusPrimary(false);
  }, [focusPrimary]);

  // 수정 모드 초기값: 캐시에서 찾은 문의로 채운다. 기존 연결은 읽기 전용 스냅샷으로
  // 따로 보여주므로 고른 예약은 비운다.
  useEffect(() => {
    if (!inquiry) return;
    setCategory(inquiry.category);
    setContent(inquiry.content ?? '');
    setPickedReservation(null);
  }, [inquiry]);

  // 수정 대상이 캐시에 없으면(직접 주소 접근·이미 삭제됨 등) 목록으로 돌려보낸다.
  useEffect(() => {
    if (!isEditMode || isListPending) return;
    if (!inquiry) navigate('/inquiry');
  }, [isEditMode, isListPending, inquiry, navigate]);

  // 예약이 학생 취소로 지워져 id 가 null 이어도 스냅샷이 남아 있으면 연결로 본다 —
  // 서버(InquiryCommandService.updateMine)는 예약도 스냅샷도 없을 때만 거절한다.
  const existingLink =
    isEditMode &&
    (inquiry?.reservationId != null || inquiry?.reservationSummary != null);
  const linkedLabel = existingLink ? linkedReservationLabel(inquiry) : null;

  const reservationRequired = category === 'ATTENDANCE';
  const hasReservation = pickedReservation != null || existingLink;
  const contentValid = content.trim().length > 0;
  const canSubmit = contentValid && (!reservationRequired || hasReservation);
  const selectedId =
    pickedReservation?.reservationId ?? inquiry?.reservationId ?? null;

  const isPending = isEditMode ? isUpdating : isCreating;

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!canSubmit) return;
    submittingRef.current = true;
    try {
      // 고른 예약이 없으면 null 을 보낸다 — 접수에서는 "연결 없음", 수정에서는 서버가
      // "그대로 둔다" 로 해석한다. 연결을 끊는 방법은 의도적으로 없다.
      const payload = {
        category,
        content: content.trim(),
        reservationId: pickedReservation
          ? pickedReservation.reservationId
          : null,
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
      // 고른 예약이 그사이 사라졌다(취소·목록 갱신). 선택을 비우고 목록을 다시 읽어 같은
      // 실패를 되풀이하지 않게 한다. 문구는 inquiryErrorMessage 가 이미 낸다. 서버가 제출 때
      // 소유를 재검증하므로 클라이언트에서 stale 캐시를 잠그지는 않는다.
      if (normalizedCode === 'INQUIRY-002') {
        setPickedReservation(null);
        refetchReservations();
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const openPicker = () => setIsPickerOpen(true);

  // 보조 버튼은 자기 자신을 지우므로 누른 뒤 포커스를 주 버튼으로 옮긴다.
  const clearPicked = () => {
    setPickedReservation(null);
    setFocusPrimary(true);
  };

  // 내용(카드/스냅샷/없음)만 상태별로 갈리고, 버튼 줄은 어떤 상태에서도 같은 자리에 그린다 —
  // 주 버튼이 언마운트되지 않아야 모달이 포커스를 되돌릴 곳을 잃지 않는다.
  let reservationContent = null;
  let primaryText = '예약 선택';
  let primaryLabel;
  let primaryDescribedBy = 'reservation-requirement';
  let primaryClass = outlineButtonClass;
  let secondaryButton = null;

  if (pickedReservation) {
    reservationContent = (
      <ReservationCard
        room={formatRoom(pickedReservation)}
        time={formatReservationTime(pickedReservation)}
        state={reservationStateLabel(pickedReservation)}
      />
    );
    primaryText = '변경';
    primaryLabel = '관련 예약 변경';
    primaryClass = linkButtonClass;
    if (existingLink) {
      secondaryButton = (
        <button
          type="button"
          aria-label="관련 예약 되돌리기"
          onClick={clearPicked}
          className={linkButtonClass}>
          되돌리기
        </button>
      );
    } else if (!reservationRequired) {
      // ATTENDANCE 에서는 해제하면 제출만 잠기는 막다른 버튼이라 그리지 않는다.
      secondaryButton = (
        <button
          type="button"
          aria-label="관련 예약 선택 해제"
          onClick={clearPicked}
          className={linkButtonClass}>
          선택 해제
        </button>
      );
    }
  } else if (existingLink) {
    reservationContent = (
      <>
        <div className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 break-keep">
          {linkedLabel}
        </div>
        <p className="mt-1 text-xs text-gray-500">{LINKED_RESERVATION_HINT}</p>
      </>
    );
    primaryText = '다른 예약으로 변경';
    primaryDescribedBy = undefined;
    primaryClass = linkButtonClass;
  }

  const buttonsRowClass = reservationContent
    ? 'mt-2 flex justify-end gap-4'
    : 'flex justify-end gap-4';

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
            className={fieldClass}
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

        {/* select 가 없어져 label 이 가리킬 컨트롤이 없다. 영역을 그룹으로 묶어 이름을 주고
            버튼들은 필수/선택 안내를 aria-describedby 로 잇는다. */}
        <div role="group" aria-label="관련 예약">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
            관련 예약
            <span
              id="reservation-requirement"
              className="text-xs font-normal text-gray-500">
              {reservationRequired ? '필수' : '선택'}
            </span>
          </p>
          {reservationContent}
          <div className={buttonsRowClass}>
            <button
              type="button"
              ref={primaryButtonRef}
              aria-label={primaryLabel}
              aria-describedby={primaryDescribedBy}
              onClick={openPicker}
              className={primaryClass}>
              {primaryText}
            </button>
            {secondaryButton}
          </div>
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
            className={fieldClass}
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
          className={primaryButtonClass}>
          {isEditMode ? '수정하기' : '제출하기'}
        </button>
      </div>

      <ReservationPickerModal
        show={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onPick={reservation => {
          setPickedReservation(reservation);
          setFocusPrimary(true);
        }}
        selectedId={selectedId}
        reservations={reservations}
        isPending={isReservationsPending}
        isError={isReservationsError}
        refetch={refetchReservations}
      />
    </div>
  );
};

export default InquiryForm;
