import React, { useState } from 'react';

import DashBoardSchedule from '../schedule/DashBoardSchedule';
import DashBoardReservation from '../reservation management/DashBoardReservation';
import DashBoardStatics from '../statics/DashBoardStatics';
import DashBoardBanner from '../../banner/DashBoardBanner';
import SerialCheck from '../../../pages/manage/SerialCheck';
import FetchBlockedUser from '../../../pages/manage/FetchBlockedUser';

import underArrow from '../../../assets/icons/under_arrow.png';

const DashBoard = () => {
  const [showSchedule, setShowSchedule] = useState(true);
  const [showReservation, setShowReservation] = useState(true);
  const [showStatics, setShowStatics] = useState(true);
  const [showSearchUser, setShowSearchUser] = useState(true);
  const [showBlocked, setShowBlocked] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  const toggleSchedule = () => setShowSchedule(prev => !prev);
  const toggleReservation = () => setShowReservation(prev => !prev);
  const toggleStatics = () => setShowStatics(prev => !prev);
  const toggleSearchUser = () => setShowSearchUser(prev => !prev);
  const toggleBlocked = () => setShowBlocked(prev => !prev);
  const toggleBanner = () => setShowBanner(prev => !prev);

  return (
    <div>
      {/* 상단 제목 */}
      <div className="font-bold text-3xl text-black p-8">DashBoard</div>

      {/* Statics 영역 */}
      <div
        onClick={toggleStatics}
        className="inline-flex flex-row pl-8 pb-2 items-center gap-x-2">
        <div className="font-bold text-2xl text-gray-700 cursor-pointer">
          Statics
        </div>
        <img
          className={`w-6 h-4 mt-1 cursor-pointer transition-transform duration-200 ${
            showStatics ? 'rotate-0' : 'rotate-180'
          }`}
          src={underArrow}
        />
      </div>
      {/* 구분선 */}
      <div className="px-6">
        <div className="w-full border-t border-gray-300 my-2" />
      </div>
      {/* Statics 컴포넌트들 */}
      {showStatics && (
        <div className="px-4 py-4">
          <DashBoardStatics />
        </div>
      )}

      {/* Schedule 영역 */}
      <div
        onClick={toggleSchedule}
        className="inline-flex flex-row pl-8 pb-2 items-center gap-x-2">
        <div className="font-bold text-2xl text-gray-700 cursor-pointer">
          Schedule
        </div>
        <img
          className={`w-6 h-4 mt-1 cursor-pointer transition-transform duration-200 ${
            showSchedule ? 'rotate-0' : 'rotate-180'
          }`}
          src={underArrow}
        />
      </div>
      {/* 구분선 */}
      <div className="px-6">
        <div className="w-full border-t border-gray-300 my-2" />
      </div>
      {/* Schedule 컴포넌트들 */}
      {showSchedule && (
        <div className="px-4 py-4">
          <DashBoardSchedule />
        </div>
      )}

      {/* Reservation 영역 */}
      <div
        onClick={toggleReservation}
        className="inline-flex flex-row pl-8 pb-2 items-center gap-x-2">
        <div className="cursor-pointer font-bold text-2xl text-gray-700">
          Reservation Management
        </div>
        <img
          className={`w-6 h-4 mt-1 cursor-pointer transition-transform duration-200 ${
            showReservation ? 'rotate-0' : 'rotate-180'
          }`}
          src={underArrow}
        />
      </div>
      {/* 구분선 */}
      <div className="px-6">
        <div className="w-full border-t border-gray-300 my-2" />
      </div>
      {/* Reservation 컴포넌트들 */}
      {showReservation && (
        <div className="px-4 py-4">
          <DashBoardReservation />
        </div>
      )}

      {/* Search User 영역 */}
      <div
        onClick={toggleSearchUser}
        className="inline-flex flex-row pl-8 pb-2 items-center gap-x-2">
        <div className="cursor-pointer font-bold text-2xl text-gray-700">
          Search User
        </div>
        <img
          className={`w-6 h-4 mt-1 cursor-pointer transition-transform duration-200 ${
            showSearchUser ? 'rotate-0' : 'rotate-180'
          }`}
          src={underArrow}
        />
      </div>
      {/* 구분선 */}
      <div className="px-6">
        <div className="w-full border-t border-gray-300 my-2" />
      </div>
      {/* Search User 컴포넌트들 */}
      {showSearchUser && (
        <div className="p-6">
          <div className="bg-white rounded-xl hover:shadow-2xl">
            <SerialCheck />
          </div>
        </div>
      )}

      {/* Blocked 영역 */}
      <div
        onClick={toggleBlocked}
        className="inline-flex flex-row pl-8 pb-2 items-center gap-x-2">
        <div className="cursor-pointer font-bold text-2xl text-gray-700">
          Blocked
        </div>
        <img
          className={`w-6 h-4 mt-1 cursor-pointer transition-transform duration-200 ${
            showBlocked ? 'rotate-0' : 'rotate-180'
          }`}
          src={underArrow}
        />
      </div>
      {/* 구분선 */}
      <div className="px-6">
        <div className="w-full border-t border-gray-300 my-2" />
      </div>
      {/* Blocked 컴포넌트들 */}
      {showBlocked && (
        <div className="p-6">
          <div className="bg-white rounded-xl hover:shadow-2xl">
            <FetchBlockedUser />
          </div>
        </div>
      )}

      {/* 배너 관리 영역 */}
      <div
        onClick={toggleBanner}
        className="inline-flex flex-row pl-8 pb-2 items-center gap-x-2">
        <div className="cursor-pointer font-bold text-2xl text-gray-700">
          Banner
        </div>
        <img
          className={`w-6 h-4 mt-1 cursor-pointer transition-transform duration-200 ${
            showBanner ? 'rotate-0' : 'rotate-180'
          }`}
          src={underArrow}
        />
      </div>
      {/* 구분선 */}
      <div className="px-6">
        <div className="w-full border-t border-gray-300 my-2" />
      </div>
      {/* Banner 컴포넌트들 */}
      {showBanner && (
        <div className="p-6">
          <DashBoardBanner />
        </div>
      )}
    </div>
  );
};

export default DashBoard;
