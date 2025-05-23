import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// [관리자] room 생성
export const useCreateRoom = () => {
  return useMutation({
    mutationFn: async ({ roomName, departmentId }) => {
      const createRoom_res = await apiClient.post('/rooms/room', {
        roomName,
        departmentId,
      });
      return createRoom_res.data;
    },
  });
};

// room 조회
export const fetchRoom = async roomId => {
  const room_response = await apiClient.get(`/rooms/${roomId}`);
  return room_response.data.data;
};

export const useRooms = roomId =>
  useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => fetchRoom(roomId),
    enabled: roomId !== null && roomId !== undefined,
  });

// [관리자] room 삭제
export const useDeleteRoom = () => {
  return useMutation({
    mutationFn: async ({ roomId }) => {
      const deleteRoom_res = await apiClient.delete(`/rooms/${roomId}`);
      return deleteRoom_res.data;
    },
  });
};

// 모든 room 조회
export const fetchAllRooms = async () => {
  const all_rooms_response = await apiClient.get('/rooms');
  return all_rooms_response.data.data.rooms;
};

export const useAllRooms = () => {
  return useQuery({
    queryKey: ['allRooms'],
    queryFn: fetchAllRooms,
  });
};

// [관리자] roomID로 partition들 조회
const fetchPartitionsByRoomId = async roomId => {
  const partitionsByRoomId_res = await apiClient.get(`/rooms/rooms/${roomId}`);
  return partitionsByRoomId_res.data;
};

export const usePartitionsByRoomId = roomId => {
  return useQuery({
    queryKey: ['roomId', roomId],
    queryFn: () => fetchPartitionsByRoomId(roomId),
    enabled: !!roomId,
  });
};

// [관리자] room 정보 수정
export const useEditRoom = () => {
  return useMutation({
    mutationFn: async ({ roomId, roomName, departmentId }) => {
      const response = await apiClient.patch(`/rooms/${roomId}`, {
        roomName,
        departmentId,
      });
      return response.data;
    },
  });
};
