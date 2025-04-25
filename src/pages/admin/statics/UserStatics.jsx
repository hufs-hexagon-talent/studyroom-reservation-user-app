import React from 'react';
import { useUserStatics } from '../../../api/user.api';

const UserStatics = () => {
  const { data: userStatics } = useUserStatics();

  return (
    <div>
      <div className="font-bold text-3xl text-black p-8">User Statics</div>
      <div>
        {/* 이용자 수 통계 */}
        <div className="flex flex-col gap-y-6 lg:w-1/2 bg-white shadow-md rounded-2xl p-8 mb-6">
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
          <div>
            <div className="text-gray-500 text-sm">관리자 계정 수</div>
            <div className="text-2xl font-bold">
              {userStatics?.adminUserCount}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">시스템 계정 수</div>
            <div className="text-2xl font-bold">
              {userStatics?.systemUserCount}
            </div>
          </div>
        </div>
        {/* 예약 수 통계 */}
      </div>
    </div>
  );
};

export default UserStatics;
