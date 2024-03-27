'use client';
import React from 'react';
import { Navbar } from 'flowbite-react';

import Logo from '../../assets/logo.png';

const NavigationBar = () => {
  return (
    <Navbar fluid rounded className="border-b-2">
      <Navbar.Brand href="/">
        <img src={Logo} className="mr-3 h-6 sm:h-9" alt="cse logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          컴퓨터공학부 세미나실 예약 시스템
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/rooms/306/roompage">세미나실 예약</Navbar.Link>
        <Navbar.Link href="/check">내 신청 현황</Navbar.Link>
        <Navbar.Link href="/">이용 규칙</Navbar.Link>
        <Navbar.Link href="/login">로그인</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
