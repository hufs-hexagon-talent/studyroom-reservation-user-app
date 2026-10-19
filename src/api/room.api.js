import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// 모든 room 조회
export const fetchAllRooms = async () => {
  const all_rooms_response = await apiClient.get('/rooms');
  return all_rooms_response.data.data.rooms;
};

// 학생 앱은 부서를 하나로 고정한다(RoomPage.jsx 의 departmentId = 1 과 같은 값).
export const STUDENT_DEPARTMENT_ID = 1;

// 문의 폼(시설 문의)의 방 목록. 방은 거의 바뀌지 않아 10분간 재조회하지 않고, 시설 유형을 고를 때만 부른다.
export const useInquiryRooms = ({ enabled }) =>
  useQuery({
    queryKey: ['inquiryRooms'],
    queryFn: async () =>
      (await fetchAllRooms()).filter(
        room => room.departmentId === STUDENT_DEPARTMENT_ID,
      ),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
