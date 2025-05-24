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
      const createPolicy_res = await apiClient.post('/policies/policy', {
        operationStartTime,
        operationEndTime,
        eachMaxMinute,
      });
      return createPolicy_res.data;
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

// [관리자] RoomOperationPolicy 삭제
export const useDeletePolicy = () => {
  return useMutation({
    mutationFn: async policyId => {
      const deletePolicy_res = await apiClient.delete(`/policies/${policyId}`);
      return deletePolicy_res.data;
    },
  });
};

// [관리자] RoomOperationPolicy 조회
const fetchPolicy = async policyId => {
  const response = await apiClient.get(`/policies/${policyId}`);
  return response.data.data;
};

export const usePolicy = policyId => {
  return useQuery({
    queryKey: ['policy', policyId],
    queryFn: () => fetchPolicy(policyId),
    enabled: !!policyId,
  });
};

// [관리자] RoomOperationPolicy 정보 업데이트
export const useEditPolicy = () => {
  return useMutation({
    mutationFn: async ({
      roomOperationPolicyId,
      operationStartTime,
      operationEndTime,
      eachMaxMinute,
    }) => {
      const response = await apiClient.patch(
        `/policies/policy/${roomOperationPolicyId}`,
        {
          operationStartTime,
          operationEndTime,
          eachMaxMinute,
        },
      );
      return response.data;
    },
  });
};
