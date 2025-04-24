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
      return createRoom_res.data.data;
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
