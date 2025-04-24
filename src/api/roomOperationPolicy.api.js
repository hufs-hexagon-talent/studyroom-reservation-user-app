import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// [관리자] RoomOperationPolicy 생성
export const useCreatePolicy = () => {
  return useMutation({
    mutationFn: async ({
      operationStartTime,
      operationEndTime,
      eachMaxMinute,
    }) => {
      try {
        const createPolicy_res = await apiClient.post('/policies/policy', {
          operationStartTime,
          operationEndTime,
          eachMaxMinute,
        });
        return createPolicy_res.data.data;
      } catch (error) {
        // 에러 발생 시 에러 응답을 반환
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message);
        }
        throw error;
      }
    },
  });
};

// [관리자] 모든 RoomOperationPolicy 조회
export const fetchAllPolicies = async () => {
  const all_policies_res = await apiClient.get('/policies');
  return all_policies_res.data.data.operationPolicyInfos;
};

export const useAllPolicies = () => {
  return useQuery({
    queryKey: ['allPolicies'],
    queryFn: fetchAllPolicies,
  });
};
