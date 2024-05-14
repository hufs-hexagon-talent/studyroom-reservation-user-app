import React from 'react';
import axios from 'axios';
import { Navbar } from 'flowbite-react';

import Logo from '../../assets/logo.png';

const NavigationBar = ({ isLogin, setIsLogin }) => {
  const handleDelete = async () => {
    axios
      .delete('https://api.user.connect.alpaon.dev/user/auth/login')
      .then(response => {
        console.log(response);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .catch(error => {
        console.error(error);
      });
  };

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
        <Navbar.Link href="/roompage">세미나실 예약</Navbar.Link>
        <Navbar.Link href="/check">내 신청 현황</Navbar.Link>
        <Navbar.Link href="/">이용 규칙</Navbar.Link>
        <Navbar.Link onClick={handleDelete} href="/login">
          로그아웃
        </Navbar.Link>
        {isLogin === true ? (
          <Navbar.Link href="/" onClick={() => setIsLogin(false)}>
            로그아웃
          </Navbar.Link>
        ) : (
          <Navbar.Link href="/login">로그인</Navbar.Link>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
