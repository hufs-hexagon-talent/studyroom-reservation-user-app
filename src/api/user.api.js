import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

import { queryClient } from '../index';
import axios from 'axios';
import { arSA } from 'date-fns/locale';

// id, pw 확인할 때 쓰려고
const fetchAllUsers = async () => {
  const allUser_res = await apiClient.get('/users');
  return allUser_res.data.data.items;
}

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: fetchAllUsers
  });
};

// 자신의 정보 조회
const fetchMyInfo =async()=>{
  const myInfo_res = await apiClient.get('/users/me');
  return myInfo_res.data.data;
}

export const useMyInfo =()=>{
  return useQuery({
    queryKey:['myInfo'],
    queryFn:fetchMyInfo
  });
};

// 관리자인지 아닌지
export const fetchIsAdmin = async()=>{
  const isAdmin_res = await apiClient.get('/users/me');
  return isAdmin_res.data.data.isAdmin;
}

// Query
export const useIsAdminData=()=>{
  return useQuery({
    queryKey:['isAdmin'],
    queryFn:fetchIsAdmin,
    enabled:false,
  });
}

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

// 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
export const fetchDate = async () => {
  const date_response = await apiClient.get('/schedules/available-dates');
  const dates = date_response.data.data.items.map(date => new Date(date));
  return dates;
};

//해당 날짜의 예약 정보 가져오기 (1차원, checkVisit에 사용)
export const fetchReservationsByRooms = async ({ date, roomIds }) => {
  const params = new URLSearchParams();
  params.append('date', date);
  roomIds.forEach(id => params.append('roomIds', id));

  const response = await apiClient.get(`https://api.studyroom.jisub.kim/reservations/rooms/by-date?${params.toString()}`);
  return response.data.data.reservations;
};

export const useReservationsByRooms = ({ date, roomIds }) =>
  useQuery({
    queryKey: ['reservationsByRooms', date, roomIds],
    queryFn: () => fetchReservationsByRooms({ date, roomIds }),
  });

// 해당 날짜의 예약 정보 가져오기 (2차원, roomPage에 사용)
export const fetchReservations = async ({ date }) => {
  const response = await apiClient.get(`/reservations/by-date?date=${date}`);

  const data = response.data.data.items;

  return data;
};

export const useReservations = ({ date }) =>
  useQuery({
    queryKey: ['reservationsByRooms', date],
    queryFn: () => fetchReservations({ date }),
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
export const useAdminDeleteReservation=()=>{
  return useMutation({
    mutationFn: async(reservationId)=>{
      const adminDelete_res = await apiClient.delete(`/reservations/admin/${reservationId}`);
      return adminDelete_res.data;
    }
  })
}

export const fetchUserReservation = async () => {
  const user_reservation_response = await apiClient.get('/reservations/me');
  return user_reservation_response.data.data.items.reverse();
};

export const useUserReservation = () =>
  useQuery({
    queryKey: ['userReservation'],
    queryFn: fetchUserReservation,
  });

export const fetchOtp = async () => {
  const otp_response = await apiClient.post('/otp');

  return otp_response.data.data.verificationCode;
};

export const useOtp = () =>
  useQuery({
    queryKey: ['otp'],
    queryFn: () => fetchOtp(),
  });


// room 조회
export const fetchRoom = async roomId => {
  const room_response = await apiClient.get(`/rooms/${roomId}`);

  return room_response.data;
};

export const useRooms = roomIds =>
  useQuery({
    queryKey: ['rooms', roomIds],
    queryFn: async () => {
      if (!roomIds) return [];
      const rooms = await Promise.all(roomIds.map(roomId => fetchRoom(roomId)));
      return rooms;
    },
  });

// 체크인 하기
export const useCheckIn =()=>{
  return useMutation({
    mutationFn : async({verificationCode, roomIds})=>{
      const check_in_res = await apiClient.post('/check-in',{
        verificationCode,
        roomIds
      });
      return check_in_res.data;
    },
  });
};

// 모든 room 조회
export const fetchAllRooms = async()=>{
  const all_rooms_response = await apiClient.get(
    '/rooms'
  )
  return all_rooms_response.data.data.items;
}

export const useAllRooms =()=>{
  useQuery({
    queryKey:['allRooms'],
    queryFn:async()=>{
      const allRooms = await fetchAllRooms();
      return allRooms.map(room=>({roomId:room.roomId, roomName : room.roomName}))
    }
  })
}

// 모든 partition 조회
export const fetchAllPartitions=async()=>{
  const all_partitions_response = await apiClient.get(
    '/partitions'
  )
  return all_partitions_response.data.data.items;
}

export const useAllPartitions = () =>
  useQuery({
    queryKey: ['allPartitions'],
    queryFn: async () => {
      const allPartitions = await fetchAllPartitions();
      return allPartitions.map(partition => ({ partitionId: partition.roomPartitionId, partitionNumber: partition.partitionNumber ,roomName: partition.roomName }));
    },
  });

export const fetchReservedRooms =async({date,roomIds})=>{
  const reserved_rooms_res = await apiClient.get(
    `/reservations/rooms/by-date?date=${date}&roomIds=${roomIds}`
  )
  return reserved_rooms_res.data.data;
}

export const useReservedRooms =({date, roomIds})=>{
  useQuery({
    queryKey:[date,roomIds],
    queryFn:()=>fetchReservedRooms(date,roomIds)
  })
}

// 노쇼 횟수
const fetchNoShow = async()=>{
  const noshow_res = await apiClient.get(
    '/reservations/me/no-show'
  );
  return noshow_res.data.data.noShowCount;
}

export const useNoShow =()=>{
  return(
    useQuery({
      queryKey:['noShow'],
      queryFn:fetchNoShow
    })
  )
}

// 로그인 된 상태에서 비밀번호 수정
export const usePassword = () => {
  return useMutation({
    mutationFn: async ({ prePassword, newPassword }) => {
      try {
        const password_res = await apiClient.put('/users/me/password', {
          prePassword,
          newPassword,
        });
        return password_res.data;
      } catch (error) {
        // 에러 발생 시 에러 응답을 반환
        if (error.response && error.response.data) {
          throw new Error(error.response.data.errorMessage);
        }
        throw error;
      }
    },
  });
};


// 로그아웃 상태에서 비밀번호 수정
export const useLoggedOutPassword=()=>{
  return useMutation({
    mutationFn:async({token, newPassword})=>{
      const loggedOutPW_res = await apiClient.post('/users/reset-password',{
        token,
        newPassword
      });
      return loggedOutPW_res.data;
    }
  })
}

// 회원 가입
export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({ username, password, serial, name, email }) => {
      const signUp_res = await apiClient.post('/users/sign-up', {
        username,
        password,
        serial,
        name,
        email,
      });
      return signUp_res.data;
    },
  });
};

// 이메일 전송
export const useEmailSend =()=>{
  return useMutation({
    mutationFn:async(username)=>{
      const email_res = await apiClient.post(`/auth/mail/send?username=${username}`);
      return email_res.data.data;
    }
  })
}

// 이메일 검증
export const useEmailVerify=()=>{
  return useMutation({
    mutationFn:async({email, verifyCode})=>{
      const verify_res = await apiClient.post('/auth/mail/verify',{
        email,
        verifyCode
      });
      return verify_res.data;
    }
  })
}

// 모든 roomPolicy 조회
export const fetchAllPolicies=async()=>{
  const all_policies_res = await apiClient.get('/policies')
  return all_policies_res.data;
}

export const useAllPolicies =()=>{
  return(
    useQuery({
      queryKey:['allPolicies'],
      queryFn:fetchAllPolicies
    })
  )
}

// 스케줄 주입
export const useSchedules=()=>{
  return useMutation({
    mutationFn:async({roomId, roomOperationPolicyId, policyApplicationDate})=>{
      const schedules_policy = await apiClient.post('/schedules',{
        roomId, roomOperationPolicyId, policyApplicationDate
      })
      return schedules_policy.data;
    }
  })
}