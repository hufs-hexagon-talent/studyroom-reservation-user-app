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
  HiExternalLink,
  HiTable,
  HiUser,
  HiCalendar,
  HiFilm,
} from 'react-icons/hi';

const SideBar = () => {
  return (
    <Sidebar>
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem href="#shortcut" icon={HiExternalLink}>
            바로가기
          </SidebarItem>
          <SidebarItem href="#statics" icon={HiChartPie} labelColor="dark">
            통계
          </SidebarItem>
          <SidebarItem href="#schedule" icon={HiCalendar}>
            스케줄 설정
          </SidebarItem>
          <SidebarItem href="#manage-reservation" icon={HiClipboardCheck}>
            예약 조회 및 상태 관리
          </SidebarItem>
          <SidebarItem href="#search-user" icon={HiUser}>
            학번/이름으로 정보 조회
          </SidebarItem>
          <SidebarItem href="#blocked" icon={HiHand}>
            블락 사용자 조회
          </SidebarItem>
          <SidebarItem href="#banner" icon={HiFilm}>
            배너 관리
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};
export default SideBar;
