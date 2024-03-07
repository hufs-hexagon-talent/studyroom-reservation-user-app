import React from 'react';
import { HiChartPie, HiInbox, HiUser, HiViewBoards } from 'react-icons/hi';
import { Sidebar } from 'flowbite-react';

const SideBar = () => {
  return (
    <Sidebar aria-label="Default sidebar example" className="flex">
      <Sidebar.Logo href="/" img="/img/logo.png" imgAlt="Logo">
        컴퓨터공학부 세미나실 예약 시스템
      </Sidebar.Logo>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item href="./rooms" icon={HiChartPie}>
            세미나실 예약하기
          </Sidebar.Item>
          <Sidebar.Item href="./check" icon={HiViewBoards}>
            내 신청 현황
          </Sidebar.Item>
          <Sidebar.Item href="./notice" icon={HiInbox}>
            이용 규칙
          </Sidebar.Item>
          <Sidebar.Item href="./login" icon={HiUser}>
            로그인
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default SideBar;
