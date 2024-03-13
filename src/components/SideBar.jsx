import React from 'react';
import { BiCalendarEdit,BiDetail,BiLogIn } from "react-icons/bi";
import { IoPersonSharp } from "react-icons/io5";
import { Sidebar } from 'flowbite-react';

const SideBar = () => {
  return (
    <Sidebar aria-label="Default sidebar example" className="h-screen">
      <Sidebar.Logo href="/" img="/img/logo.png" imgAlt="Logo" style={{height: '50px'}}>
        세미나실 예약 시스템
      </Sidebar.Logo>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item href="./rooms" icon={BiCalendarEdit}>
            세미나실 예약하기
          </Sidebar.Item>
          <Sidebar.Item href="./check" icon={IoPersonSharp}>
            내 신청 현황
          </Sidebar.Item>
          <Sidebar.Item href="./notice" icon={BiDetail}>
            이용 규칙
          </Sidebar.Item>
          <Sidebar.Item href="./login" icon={BiLogIn}>
            로그인
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default SideBar;
