import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// [관리자] 모든 부서 조회
const fetchDepartments = async () => {
  const response = await apiClient.get('/departments');
  return response.data.data;
};

export const useDepartmets = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });
};
