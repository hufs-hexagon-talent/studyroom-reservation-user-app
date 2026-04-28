import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// 모든 room 조회
export const useAllRooms = () => {
  return useQuery({
    queryKey: ['allRooms'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data.data.rooms;
    },
  });
};

// 특정 room 조회
export const useRoom = (roomId: number) => {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms/${roomId}`);
      return res.data.data;
    },
    enabled: roomId != null,
  });
};

// room의 partition 조회
export const usePartitionsByRoomId = (roomId: number) => {
  return useQuery({
    queryKey: ['roomId', roomId],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms/rooms/${roomId}`);
      return res.data;
    },
    enabled: !!roomId,
  });
};

// === 관리자 API ===

export const useCreateRoom = () => {
  return useMutation({
    mutationFn: async (data: { roomName: string; departmentId: number }) => {
      const res = await apiClient.post('/rooms/room', data);
      return res.data;
    },
  });
};

export const useDeleteRoom = () => {
  return useMutation({
    mutationFn: async (roomId: number) => {
      const res = await apiClient.delete(`/rooms/${roomId}`);
      return res.data;
    },
  });
};

export const useEditRoom = () => {
  return useMutation({
    mutationFn: async (data: {
      roomId: number;
      roomName: string;
      departmentId: number;
    }) => {
      const { roomId, ...body } = data;
      const res = await apiClient.patch(`/rooms/${roomId}`, body);
      return res.data;
    },
  });
};
