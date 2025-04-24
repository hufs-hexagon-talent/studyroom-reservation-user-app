import React from 'react';
import { useAllUsers, useUserStatics } from '../../../api/user.api';
import { useReservationStatics } from '../../../api/reservation.api';
import { parseStatics } from '../../../utils/statics.utils';

const COLORS = ['#3b82f6', '#82ca9d', '#ffc658'];

const UserStatics = () => {
  const today = '2024-10-20';
  //const today = format(new Date(), 'yyyy-MM-dd');
  const { data: reservationStatics } = useReservationStatics(today);
  const { data: userStatics } = useUserStatics();
  const { data: allUsers = [] } = useAllUsers();

  const {
    totalReservations,
    todayReservations,
    weeklyReservations,
    monthlyReservations,
  } = parseStatics(reservationStatics, allUsers);

  return (
    <div>
      <div className="font-bold text-3xl text-black p-8">User Statics</div>
      <div>
        {/* 이용자 수 통계 */}
        <div className="flex flex-row text-center items-center justify-center gap-x-6 bg-white shadow-md rounded-2xl px-6 py-4 mb-6">
          <div>
            <div className="text-gray-500 text-sm">전체 이용자 수</div>
            <div className="text-2xl font-bold">
              {userStatics?.totalUserCount}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">활성화 된 이용자 수</div>
            <div className="text-2xl font-bold">
              {userStatics?.activeUserCount}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Blocked 이용자 수</div>
            <div className="text-2xl font-bold">
              {userStatics?.bannedUserCount}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">만료된 이용자 수</div>
            <div className="text-2xl font-bold">
              {userStatics?.expiredUserCount}
            </div>
          </div>
        </div>
        {/* 예약 수 통계 */}
        <div className="flex flex-row text-center items-center justify-center bg-white shadow-md rounded-2xl px-6 py-4 gap-x-10">
          <div>
            <div className="text-gray-500 text-sm">총 예약 수</div>
            <div className="text-2xl font-bold">{totalReservations}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">오늘 예약 수</div>
            <div className="text-2xl font-bold">{todayReservations}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">주간 예약 수</div>
            <div className="text-2xl font-bold">{weeklyReservations}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">월간 예약 수</div>
            <div className="text-2xl font-bold">{monthlyReservations}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatics;
