import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  CreatePolicyRequest,
  EditPolicyRequest,
} from '@/types/roomOperationPolicy';

// 모든 RoomOperationPolicy 조회
export const useAllPolicies = () => {
  return useQuery({
    queryKey: ['allPolicies'],
    queryFn: async () => {
      const res = await apiClient.get('/policies');
      return res.data.data.operationPolicyInfos;
    },
  });
};

// 단건 RoomOperationPolicy 조회
export const usePolicy = (policyId: number) => {
  return useQuery({
    queryKey: ['policy', policyId],
    queryFn: async () => {
      const res = await apiClient.get(`/policies/${policyId}`);
      return res.data.data;
    },
    enabled: !!policyId,
  });
};

// === 관리자 API ===

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePolicyRequest) => {
      const res = await apiClient.post('/policies/policy', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPolicies'] });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (policyId: number) => {
      const res = await apiClient.delete(`/policies/${policyId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPolicies'] });
    },
  });
};

export const useEditPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EditPolicyRequest) => {
      const { roomOperationPolicyId, ...body } = data;
      const res = await apiClient.patch(
        `/policies/policy/${roomOperationPolicyId}`,
        body,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPolicies'] });
    },
  });
};
