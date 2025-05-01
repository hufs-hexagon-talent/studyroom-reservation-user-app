import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiChartPie,
  HiUser,
  HiClipboardCheck,
  HiCalendar,
  HiFilm,
} from 'react-icons/hi';

const SidebarSection = ({ icon: Icon, label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="w-full flex items-center px-4 py-2 hover:bg-gray-200"
        onClick={() => setOpen(!open)}>
        <Icon className="mr-2" />
        <span>{label}</span>
      </button>
      {open && <div className="ml-6">{children}</div>}
    </div>
  );
};

const SidebarSubSection = ({ label, children }) => (
  <div className="ml-4">
    <div className="px-4 py-2 text-sm text-gray-800">{label}</div>
    <div className="ml-2">{children}</div>
  </div>
);

const SidebarItem = ({ to, children }) => (
  <Link
    to={to}
    className="block px-4 py-2 text-sm hover:bg-gray-100 text-gray-800">
    {children}
  </Link>
);

const CustomSidebar = () => {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className="w-64 h-full bg-white py-4">
      <SidebarSection icon={HiChartPie} label="통계 및 현황">
        <SidebarItem to="/divide/user-statics">사용자 통계</SidebarItem>
        <SidebarItem to="/divide/reservation-statics">예약 통계</SidebarItem>
      </SidebarSection>

      <SidebarSection icon={HiUser} label="사용자 관리">
        <SidebarItem to="/divide/serialCheck">사용자 목록</SidebarItem>
        <SidebarItem to="/divide/user-state">사용자 상태 관리</SidebarItem>
      </SidebarSection>

      <SidebarSection icon={HiClipboardCheck} label="예약 관리">
        <SidebarItem to="/divide/reservation-list">예약 목록</SidebarItem>
        <SidebarItem to="/divide/reservation-state">예약 상태 관리</SidebarItem>
      </SidebarSection>

      <SidebarSection icon={HiCalendar} label="운영 관리">
        <SidebarItem to="/divide/policy">정책 관리</SidebarItem>
        <SidebarSubSection label="운영 시간 관리">
          <SidebarItem to="/divide/schedule/create">스케줄 생성</SidebarItem>
          <SidebarItem to="/divide/schedule/delete">스케줄 삭제</SidebarItem>
          <SidebarItem to="/divide/schedule/fetch">스케줄 조회</SidebarItem>
        </SidebarSubSection>
        <SidebarSubSection label="시설 관리">
          <SidebarItem to="/divide/facility/room">Room</SidebarItem>
          <SidebarItem to="/divide/facility/partition">Partition</SidebarItem>
        </SidebarSubSection>
      </SidebarSection>

      <SidebarSection icon={HiFilm} label="배너 관리">
        <SidebarItem to="/divide/banner/create">배너 생성</SidebarItem>
        <SidebarItem to="/divide/banner/fetch">배너 조회</SidebarItem>
        <SidebarItem to="/divide/banner/edit">배너 수정</SidebarItem>
        <SidebarItem to="/divide/banner/delete">배너 삭제</SidebarItem>
      </SidebarSection>
    </motion.div>
  );
};

export default CustomSidebar;
