import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryClient } from '../index';
import axios from 'axios';

// 자신의 예약 생성
export const useReserve = () => {
  return useMutation({
    mutationFn: async ({ roomPartitionId, startDateTime, endDateTime }) => {
      const res = await apiClient.post('/reservations', {
        roomPartitionId,
        startDateTime,
        endDateTime,
      });

      return res.data; // 명시적으로 반환
    },
  });
};

// 특정 날짜, 특정 partition들 모든 예약 상태 확인 (1차원, checkVisit에 사용)
export const fetchReservationsByPartitions = async ({ date, partitionIds }) => {
  const params = new URLSearchParams();
  params.append('date', date);
  partitionIds.forEach(id => params.append('partitionIds', id));

  const response = await apiClient.get(
    `/reservations/partitions/by-date?${params.toString()}`,
  );
  return response.data.data.reservationInfoResponses;
};

export const useReservationsByPartitions = ({ date, partitionIds }) =>
  useQuery({
    queryKey: ['reservationsByPartitions', date, partitionIds],
    queryFn: () => fetchReservationsByPartitions({ date, partitionIds }),
  });

// 특정 날짜, 특정 부서가 관리하는 모든 파티션의 예약 상태 조회
export const fetchReservations = async ({ date, departmentId }) => {
  const url = `/reservations/by-date/${departmentId}?date=${date}`;
  const response = await apiClient.get(url);
  const data = response.data.data.partitionReservationInfos;

  return data;
};

export const useReservations = ({ date, departmentId }) =>
  useQuery({
    queryKey: ['reservationsByRooms', date, departmentId],
    queryFn: () => fetchReservations({ date, departmentId }),
    enabled: !!departmentId,
  });

// 예약 삭제하기
export const useDeleteReservation = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const res = await apiClient.delete(`/reservations/me/${reservationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('userReservation');
    },
  });
};

// 관리자 예약 삭제
export const useAdminDeleteReservation = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const adminDelete_res = await apiClient.delete(
        `/reservations/admin/${reservationId}`,
      );
      return adminDelete_res.data;
    },
  });
};

export const fetchUserReservation = async () => {
  const user_reservation_response = await apiClient.get('/reservations/me');
  return user_reservation_response.data.data.reservationInfoResponses.reverse();
};

export const useUserReservation = () =>
  useQuery({
    queryKey: ['userReservation'],
    queryFn: fetchUserReservation,
  });

// 노쇼 횟수
const fetchNoShow = async () => {
  const noshow_res = await apiClient.get('/reservations/me/no-show');
  return noshow_res.data.data;
};

export const useNoShow = () => {
  return useQuery({
    queryKey: ['noShow'],
    queryFn: fetchNoShow,
  });
};
// visited로 변경
export const useVisitedState = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const changeState_res = await apiClient.patch(
        `/reservations/admin/${reservationId}`,
        {
          state: 'VISITED',
        },
      );
      return changeState_res.data;
    },
  });
};

// not_visited로 변경
export const useNotVisitedState = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const changeState_res = await apiClient.patch(
        `/reservations/admin/${reservationId}`,
        {
          state: 'NOT_VISITED',
        },
      );
      return changeState_res.data;
    },
  });
};

// processed 변경
export const useProcessedState = () => {
  return useMutation({
    mutationFn: async reservationId => {
      const changeState_res = await apiClient.patch(
        `/reservations/admin/${reservationId}`,
        {
          state: 'PROCESSED',
        },
      );
      return changeState_res.data;
    },
  });
};

// [관리자] userId로 사용자의 예약들 조회
const fetchReservationsById = async userId => {
  const reservationById_res = await apiClient.get(
    `/reservations/admin/users/${userId}`,
  );
  return reservationById_res.data.data.reservationInfoResponses;
};

export const useReservationsById = userId => {
  return useQuery({
    queryKey: ['reservationsById'],
    queryFn: () => fetchReservationsById(userId),
  });
};

// 자신이 현재 체크인 해야하는 예약 조회
const fetchLatestReservation = async () => {
  // 로컬스토리지에서 authState 가져오기
  const latest_res = await apiClient.get('/reservations/me/latest');
  return latest_res.data.data.reservationInfoResponses;
};

export const useLatestReservation = () => {
  return useQuery({
    queryKey: ['latest'],
    queryFn: () => fetchLatestReservation(),
  });
};

// [관리자] 금일 예약들 통계 조회
const fetchReservationStatics = async date => {
  const authState = JSON.parse(localStorage.getItem('authState'));
  const accessToken = authState?.accessToken;

  const statics_res = await axios.get(
    `https://api.studyroom-qa.alpaon.net/reservations/admin/statics/by-date?date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return statics_res.data.data;
};

export const useReservationStatics = date => {
  return useQuery({
    queryKey: ['statics', date],
    queryFn: () => fetchReservationStatics(date),
  });
};

// [관리자] 예약 정보 Excel 내보내기
export const useExportReservationExcel = async ({
  states,
  startDateTime,
  endDateTime,
}) => {
  const params = new URLSearchParams();
  states.forEach(state => params.append('states', state));
  if (startDateTime) params.append('startDateTime', startDateTime);
  if (endDateTime) params.append('endDateTime', endDateTime);

  const reservationExcel = await apiClient.get(
    `/reservations/export/excel?${params.toString()}`,
    { responseType: 'blob' },
  );

  const formatDateForFilename = iso => {
    if (!iso) return 'unknown';
    const date = new Date(iso);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  const start = formatDateForFilename(startDateTime);
  const end = formatDateForFilename(endDateTime);
  const statePart = states.length > 0 ? states.join('&') : 'ALL';

  const fileName = `${start}-${end}_${statePart}-Reservations.xlsx`;

  // 파일 다운로드 처리
  const url = window.URL.createObjectURL(new Blob([reservationExcel.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
