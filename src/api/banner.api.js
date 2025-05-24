import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
const authState = JSON.parse(localStorage.getItem('authState'));
const accessToken = authState?.accessToken;

// [관리자] 모든 배너 조회
const fetchAllBanners = async () => {
  const allBanners_res = await apiClient.get('/banners');
  return allBanners_res.data.data.bannerInfoResponses;
};

export const useAllBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: fetchAllBanners,
  });
};

// [관리자] 배너 생성
export const usePostBanner = () => {
  return useMutation({
    mutationFn: async ({ bannerType, imageUrl, linkUrl }) => {
      const postBanner_res = await apiClient.post('/banners', {
        bannerType,
        imageUrl,
        linkUrl,
      });
      return postBanner_res.data.data;
    },
  });
};

// [관리자] 배너 ID로 조회
const fetchBannerById = async bannerId => {
  const allBanners_res = await apiClient.get(`/banners/${bannerId}`);
  return allBanners_res.data.data.bannerInfoResponses;
};

export const useBannerById = () => {
  useQuery({
    queryKey: ['banners'],
    queryFn: () => fetchBannerById,
  });
};

// [관리자] 배너 삭제
export const useDeleteBanner = () => {
  return useMutation({
    mutationFn: async bannerId => {
      const deleteBanner_res = await apiClient.delete(`/banners/${bannerId}`);
      return deleteBanner_res.data;
    },
  });
};

// [관리자] 배너 수정
export const useEditBanner = () => {
  return useMutation({
    mutationFn: async ({ bannerId, bannerType, imageUrl, linkUrl, active }) => {
      const editBanner_res = await apiClient.patch(`/banners/${bannerId}`, {
        bannerType,
        imageUrl,
        linkUrl,
        active,
      });
      return editBanner_res.data.data;
    },
  });
};

// 활성화 배너 조회
const fetchActivatedBanner = async () => {
  const response = await apiClient.get('/banners/active');
  return response.data.data.bannerInfoResponses;
};

export const useActivatedBanner = () => {
  return useQuery({
    queryKey: ['activatedBanner'],
    queryFn: fetchActivatedBanner,
  });
};
