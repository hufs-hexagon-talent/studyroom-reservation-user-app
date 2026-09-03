import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryClient } from '../queryClient';

// 내 문의 목록 조회
export const fetchMyInquiries = async () => {
  const response = await apiClient.get('/inquiries/me');
  return response.data.data.inquiryInfoResponses;
};

export const useMyInquiries = () =>
  useQuery({
    queryKey: ['inquiries', 'me'],
    queryFn: fetchMyInquiries,
  });

// 문의 접수
export const useCreateInquiry = () =>
  useMutation({
    mutationFn: async ({ category, content, reservationId }) => {
      const response = await apiClient.post('/inquiries', {
        category,
        content,
        reservationId,
      });
      return response.data;
    },
    // 성공이든 실패든 목록을 다시 읽어야 화면이 실제 상태를 따라간다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries', 'me'] });
    },
  });

// 문의 수정 (OPEN 상태에서만 가능 — 서버가 INQUIRY-003 으로 막는다)
export const useUpdateInquiry = () =>
  useMutation({
    mutationFn: async ({ inquiryId, category, content, reservationId }) => {
      const response = await apiClient.patch(`/inquiries/me/${inquiryId}`, {
        category,
        content,
        reservationId,
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries', 'me'] });
    },
  });

// 문의 삭제
export const useDeleteInquiry = () =>
  useMutation({
    mutationFn: async inquiryId => {
      const response = await apiClient.delete(`/inquiries/me/${inquiryId}`);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries', 'me'] });
    },
  });
