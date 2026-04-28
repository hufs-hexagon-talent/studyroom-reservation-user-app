import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  AllPartitionItem,
  CreatePartitionRequest,
  EditPartitionRequest,
} from '@/types/roomPartition';

// partition 단건 조회
const fetchPartition = async (partitionId: number) => {
  const res = await apiClient.get(`/partitions/${partitionId}`);
  return res.data.data;
};

// 여러 partitionId의 partition 정보 조회
export const usePartitions = (partitionIds: number[] | undefined) => {
  return useQuery({
    queryKey: ['partitions', partitionIds],
    queryFn: async () => {
      if (!partitionIds || partitionIds.length === 0) return [];
      return Promise.all(partitionIds.map((id) => fetchPartition(id)));
    },
    enabled: !!partitionIds,
  });
};

// 모든 partition 조회
export const useAllPartitions = () => {
  return useQuery({
    queryKey: ['allPartitions'],
    queryFn: async (): Promise<AllPartitionItem[]> => {
      const res = await apiClient.get('/partitions');
      const partitions = res.data.data.partitions as Array<{
        roomPartitionId: number;
        partitionNumber: number;
        roomName: string;
        roomId: number;
      }>;
      return partitions.map((p) => ({
        partitionId: p.roomPartitionId,
        partitionNumber: p.partitionNumber,
        roomName: p.roomName,
        roomId: p.roomId,
      }));
    },
  });
};

// roomId 배열로 partition들 조회
export const usePartitionsByRoomIds = (roomIds: number[]) => {
  return useQuery({
    queryKey: ['partitionsByRoomIds', roomIds],
    queryFn: async () => {
      const responses = await Promise.all(
        roomIds.map((roomId) => apiClient.get(`/partitions/rooms/${roomId}`)),
      );
      return responses.flatMap((r) => r.data.data.items);
    },
    enabled: roomIds.length > 0,
  });
};

// === 관리자 API ===

export const useCreatePartition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePartitionRequest) => {
      const res = await apiClient.post('/partitions/partition', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartitions'] });
    },
  });
};

export const useDeletePartition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partitionId: number) => {
      const res = await apiClient.delete(`/partitions/${partitionId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartitions'] });
    },
  });
};

export const useEditPartition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EditPartitionRequest) => {
      const { partitionId, ...body } = data;
      const res = await apiClient.patch(`/partitions/${partitionId}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartitions'] });
    },
  });
};
