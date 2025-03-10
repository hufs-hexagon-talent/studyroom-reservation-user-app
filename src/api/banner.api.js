import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

// [관리자] 모든 배너 조회
const fetchAllBanners = async () => {
  const allBanners_res = await axios.get(
    'https://api.studyroom-qa.alpaon.net/banners',
  );
  return allBanners_res.data.data.bannerInfoResponses;
};

export const useAllBanners = () => {
  useQuery({
    queryKey: ['banners'],
    queryFn: () => fetchAllBanners(),
  });
};

// [관리자] 배너 생성
export const usePostBanner = () => {
  return useMutation({
    mutationFn: async ({ bannerType, imageUrl, linkUrl }) => {
      const postBanner_res = await axios.post(
        'https://api.studyroom-qa.alpaon.net/banners',
        {
          bannerType,
          imageUrl,
          linkUrl,
        },
      );
      return postBanner_res.data.data;
    },
  });
};

// [관리자] 배너 ID로 조회
const fetchBannerById = async bannerId => {
  const allBanners_res = await axios.get(
    `https://api.studyroom-qa.alpaon.net/banners/${bannerId}`,
  );
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
      const deleteBanner_res = await axios.delete(
        `https://api.studyroom-qa.alpaon.net/banners/${bannerId}`,
      );
      return deleteBanner_res.data;
    },
  });
};

// 활성화 배너 조회
const fetchActivatedBanner = async () => {
  const response = await axios.get(
    'https://api.studyroom-qa.alpaon.net/banners/active',
  );
  return response.data.data.bannerInfoResponses;
};

export const useActivatedBanner = () => {
  return useQuery({
    queryKey: ['activatedBanner'],
    queryFn: fetchActivatedBanner,
  });
};

// https://i.ibb.co/y2DMdzy/banner-2.png
// https://i.ibb.co/zTPK3rbt/banner-1.png
