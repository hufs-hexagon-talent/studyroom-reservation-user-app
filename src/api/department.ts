import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// [관리자] 모든 부서 조회
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/departments');
      return res.data.data;
    },
  });
};
