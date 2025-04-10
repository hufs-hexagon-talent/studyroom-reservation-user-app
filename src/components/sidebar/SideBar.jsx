import React from 'react';
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from 'flowbite-react';
import {
  HiHand,
  HiChartPie,
  HiClipboardCheck,
  HiUser,
  HiCalendar,
  HiFilm,
} from 'react-icons/hi';

const SideBar = () => {
  return (
    <Sidebar className="border-r">
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem
            href="/divide/dashboard"
            icon={HiChartPie}
            labelColor="dark">
            대시 보드
          </SidebarItem>
          <SidebarItem href="/divide/schedule" icon={HiCalendar}>
            스케줄 설정
          </SidebarItem>
          <SidebarItem
            href="/divide/manage-reservation"
            icon={HiClipboardCheck}>
            예약 조회 및 상태 관리
          </SidebarItem>
          <SidebarItem href="/divide/serialCheck" icon={HiUser}>
            학번/이름으로 정보 조회
          </SidebarItem>
          <SidebarItem href="/divide/blocked" icon={HiHand}>
            블락 사용자 조회
          </SidebarItem>
          <SidebarItem href="/divide/banner" icon={HiFilm}>
            배너 관리
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};
export default SideBar;
