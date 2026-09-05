import React, { useRef, useState } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button, Modal } from 'flowbite-react';
import { ChevronDown } from 'lucide-react';

import { useDeleteInquiry, useMyInquiries } from '../../api/inquiry.api';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';

import { inquiryErrorMessage } from './inquiryErrorMessage';
import { CATEGORY_LABELS, STATUS_LABELS } from './inquiryLabels';
import { linkedReservationLabel } from './reservationView';

// 학생이 관리자 답변을 확인할 통로는 이 목록뿐이다(완료 알림 없음). 접힌 줄에 답변 신호를 남긴다.
export const resolvedToggleLabel = (resolvedCount, answeredCount) =>
  answeredCount > 0
    ? `처리완료 ${resolvedCount}건 · 관리자 답변 ${answeredCount}건`
    : `처리완료 ${resolvedCount}건`;

const newInquiryButtonClass =
  'rounded-md bg-[#002D56] px-4 py-2 text-white text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]';

const MyInquiries = () => {
  const navigate = useNavigate();
  const { data: inquiries, isPending, isError, refetch } = useMyInquiries();
  const { mutateAsync: deleteInquiry, isPending: isDeleting } =
    useDeleteInquiry();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  // isPending 은 다음 렌더에서야 true 가 되어 같은 tick 의 두 번째 클릭을 막지 못한다.
  // 실제 차단은 동기 래치가 한다(CheckRoom.jsx 관례).
  const deletingRef = useRef(false);
  const [openModal, setOpenModal] = useState(false);
  // 처리완료 그룹의 접힘은 "사용자 오버라이드 + 파생값" 이다. 첫 렌더는 로딩이라 목록이
  // 비어 있으므로, useState 초기값으로 굳히면 응답이 온 뒤에도 영영 펼쳐진 채가 된다.
  const [resolvedOverride, setResolvedOverride] = useState(null);

  const handleDelete = async inquiryId => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    try {
      await deleteInquiry(inquiryId);
      openSuccessSnackbar('문의를 삭제했습니다.', 3000);
    } catch (error) {
      const message = inquiryErrorMessage(error);
      if (message) openErrorSnackbar(message, 3000);
    } finally {
      deletingRef.current = false;
    }
    setOpenModal(false);
  };

  const isLoaded = !isPending && !isError;
  const list = Array.isArray(inquiries) ? inquiries : [];
  // 서버가 접수일 내림차순으로 준다. 여기서는 나누기만 하고 정렬하지 않는다.
  const open = list.filter(inquiry => inquiry.status !== 'RESOLVED');
  const resolved = list.filter(inquiry => inquiry.status === 'RESOLVED');
  const answered = resolved.filter(inquiry => inquiry.adminMemo);
  const isResolvedExpanded = resolvedOverride ?? open.length === 0;

  const renderCard = inquiry => {
    const linked = linkedReservationLabel(inquiry);
    const isResolved = inquiry.status === 'RESOLVED';
    return (
      <li key={inquiry.inquiryId} className="border rounded-md p-4 break-keep">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {CATEGORY_LABELS[inquiry.category]}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isResolved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-700'
              }`}>
              {STATUS_LABELS[inquiry.status]}
            </span>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {format(new Date(inquiry.createAt), 'yyyy-MM-dd HH:mm')}
          </span>
        </div>

        {linked && <p className="mb-2 text-xs text-gray-500">예약 {linked}</p>}

        {/* 처리완료 문의는 본문을 끝까지 읽을 다른 길이 없어 전문을 보여준다. 접수됨은
            항상 펼쳐진 그룹이라 클램프를 유지한다(전문은 수정 화면에서 읽힌다). */}
        <p
          className={
            isResolved
              ? 'text-sm text-gray-800 whitespace-pre-wrap break-words'
              : 'text-sm text-gray-800 line-clamp-2'
          }>
          {inquiry.content}
        </p>

        {isResolved && inquiry.adminMemo && (
          <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
            처리 메모: {inquiry.adminMemo}
          </p>
        )}

        {inquiry.status === 'OPEN' && (
          <div className="mt-3 flex justify-end gap-3 text-sm">
            <button
              type="button"
              onClick={() => navigate(`/inquiry/${inquiry.inquiryId}/edit`)}
              className="text-blue-600 hover:underline">
              수정
            </button>
            <button
              type="button"
              onClick={() => setOpenModal(inquiry.inquiryId)}
              className="text-red-600 hover:underline">
              삭제
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-2xl mx-auto">
      {/* 문의하기 버튼은 로딩·실패·빈 목록에서도 항상 그린다. 마이페이지에서 폼으로 바로 가는
          항목이 없어졌으므로 목록 API 가 죽어도 접수 경로가 살아 있어야 한다(폼은 이 API 에
          의존하지 않는다). */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl text-black">1:1 문의</h1>
        <button
          type="button"
          onClick={() => navigate('/inquiry/new')}
          className={newInquiryButtonClass}>
          문의하기
        </button>
      </div>

      {isPending && (
        <div className="text-center text-gray-500 py-16">
          문의 목록을 불러오는 중입니다.
        </div>
      )}

      {!isPending && isError && (
        <div className="text-center text-gray-500 py-16">
          문의 목록을 불러오지 못했습니다.
          <div className="mt-4 flex justify-center">
            <Button size="sm" color="dark" onClick={() => refetch()}>
              다시 시도
            </Button>
          </div>
        </div>
      )}

      {isLoaded && list.length === 0 && (
        <div className="text-center text-gray-500 py-16">
          접수한 문의가 없습니다.
        </div>
      )}

      {isLoaded && open.length > 0 && (
        <ul className="space-y-4">{open.map(renderCard)}</ul>
      )}

      {isLoaded && resolved.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={isResolvedExpanded}
            onClick={() => setResolvedOverride(!isResolvedExpanded)}
            className={`flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 ${
              open.length > 0 ? 'mt-6' : 'mt-0'
            }`}>
            <span>{resolvedToggleLabel(resolved.length, answered.length)}</span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition ${
                isResolvedExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
          {isResolvedExpanded && (
            <ul className="mt-4 space-y-4">{resolved.map(renderCard)}</ul>
          )}
        </>
      )}

      <div className="flex justify-center items-center">
        <Modal
          className="flex justify-center items-center w-full p-4 sm:p-0"
          show={openModal}
          size="md"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClose={() => setOpenModal(false)}
          popup>
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                해당 문의를 삭제하시겠습니까?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="gray" onClick={() => setOpenModal(false)}>
                  취소
                </Button>
                <Button
                  color="failure"
                  disabled={isDeleting}
                  onClick={() => handleDelete(openModal)}>
                  확인
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default MyInquiries;
