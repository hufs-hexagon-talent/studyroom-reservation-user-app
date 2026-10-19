import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

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
