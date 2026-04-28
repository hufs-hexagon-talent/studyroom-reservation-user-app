import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  Banner,
  CreateBannerRequest,
  EditBannerRequest,
} from '@/types/banner';

// [관리자] 모든 배너 조회
export const useAllBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async (): Promise<Banner[]> => {
      const res = await apiClient.get('/banners');
      return res.data.data.bannerInfoResponses;
    },
  });
};

// [관리자] 배너 ID로 조회
export const useBannerById = (bannerId: number) => {
  return useQuery({
    queryKey: ['banners', bannerId],
    queryFn: async (): Promise<Banner> => {
      const res = await apiClient.get(`/banners/${bannerId}`);
      return res.data.data;
    },
    enabled: bannerId != null,
  });
};

// 활성화 배너 조회
export const useActivatedBanner = () => {
  return useQuery({
    queryKey: ['activatedBanner'],
    queryFn: async (): Promise<Banner[]> => {
      const res = await apiClient.get('/banners/active');
      return res.data.data.bannerInfoResponses;
    },
  });
};

// === 관리자 API ===

export const usePostBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBannerRequest) => {
      const res = await apiClient.post('/banners', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bannerId: number) => {
      const res = await apiClient.delete(`/banners/${bannerId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useEditBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EditBannerRequest) => {
      const { bannerId, ...body } = data;
      const res = await apiClient.patch(`/banners/${bannerId}`, body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};
