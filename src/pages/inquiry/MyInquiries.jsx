import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import { useMyInquiries, useDeleteInquiry } from '../../api/inquiry.api';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';
import { CATEGORY_LABELS, STATUS_LABELS } from './inquiryLabels';
import { inquiryErrorMessage } from './inquiryErrorMessage';

const MyInquiries = () => {
  const navigate = useNavigate();
  const {
    data: inquiries,
    isPending,
    isError,
    refetch,
  } = useMyInquiries();
  const { mutateAsync: deleteInquiry, isPending: isDeleting } =
    useDeleteInquiry();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  // isPending 은 다음 렌더에서야 true 가 되어 같은 tick 의 두 번째 클릭을 막지 못한다.
  // 실제 차단은 동기 래치가 한다(CheckRoom.jsx 관례).
  const deletingRef = useRef(false);
  const [openModal, setOpenModal] = useState(false);

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
  const hasInquiries = isLoaded && inquiries?.length > 0;

  return (
    <div className="px-4 sm:px-8 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl text-black">내 문의</h1>
        {hasInquiries && (
          <button
            type="button"
            onClick={() => navigate('/inquiry/new')}
            className="rounded-md bg-[#002D56] px-4 py-2 text-white text-sm">
            문의하기
          </button>
        )}
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

      {isLoaded && inquiries?.length === 0 && (
        <div className="text-center text-gray-500 py-16">
          <p className="mb-4">접수한 문의가 없습니다.</p>
          <button
            type="button"
            onClick={() => navigate('/inquiry/new')}
            className="rounded-md bg-[#002D56] px-4 py-2 text-white text-sm">
            문의하기
          </button>
        </div>
      )}

      {hasInquiries && (
        <ul className="space-y-4">
          {inquiries.map(inquiry => (
            <li
              key={inquiry.inquiryId}
              className="border rounded-md p-4 break-keep">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {CATEGORY_LABELS[inquiry.category]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      inquiry.status === 'RESOLVED'
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

              <p className="text-sm text-gray-800 line-clamp-2">
                {inquiry.content}
              </p>

              {inquiry.status === 'RESOLVED' && inquiry.adminMemo && (
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
          ))}
        </ul>
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
