import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryClient } from '../index';

// 모든 roomPolicy 조회
export const fetchAllPolicies = async () => {
  const all_policies_res = await apiClient.get('/policies');
  return all_policies_res.data;
};

export const useAllPolicies = () => {
  return useQuery({
    queryKey: ['allPolicies'],
    queryFn: fetchAllPolicies,
  });
};
