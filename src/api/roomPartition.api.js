import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// partition 조회
export const fetchPartiiton = async partitonId => {
  const partition_res = await apiClient.get(`/partitions/${partitonId}`);
  return partition_res.data.data;
};

export const usePartition = partitionIds =>
  useQuery({
    queryKey: ['partitions', partitionIds],
    queryFn: async () => {
      if (!partitionIds) return [];
      const partitions = await Promise.all(
        partitionIds.map(partitionId => fetchPartiiton(partitionId)),
      );
      return partitions;
    },
  });

// 모든 partition 조회
export const fetchAllPartitions = async () => {
  const all_partitions_response = await apiClient.get('/partitions');
  return all_partitions_response.data.data.partitions;
};

export const useAllPartitions = () =>
  useQuery({
    queryKey: ['allPartitions'],
    queryFn: async () => {
      const allPartitions = await fetchAllPartitions();
      return allPartitions.map(partition => ({
        partitionId: partition.roomPartitionId,
        partitionNumber: partition.partitionNumber,
        roomName: partition.roomName,
        roomId: partition.roomId,
      }));
    },
  });

// roomId로 partition들 조회
export const fetchPartitionsByRoomIds = async roomIds => {
  const partitions = await Promise.all(
    roomIds.map(roomId => apiClient.get(`/partitions/rooms/${roomId}`)),
  );
  return partitions.flatMap(partition => partition.data.data.items);
};

export const usePartitionsByRoomIds = roomIds => {
  return useQuery({
    queryKey: ['partitionsByRoomIds', roomIds],
    queryFn: () => fetchPartitionsByRoomIds(roomIds),
    enabled: !!roomIds.length, // roomIds가 비어있지 않을 때만 쿼리 실행
  });
};
