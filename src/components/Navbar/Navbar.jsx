import React from 'react';
import { Link } from 'react-router-dom';

import './Navbar.css';

import logo from '../../assets/logo.png';

const Navbar = () => {
  return (
    <div>
      <div className="navbar">
        <img src={logo} alt="" className="logo" />
        <div className="titleName">컴퓨터공학부 스터디룸 예약 시스템</div>
        <ul className="navLinks">
          <li>
            <Link to="./">예약 현황</Link>
          </li>
          <li>
            <Link to="./rooms">예약하러 가기</Link>
          </li>
          <li>
            <Link to="./login">로그인</Link>
          </li>
          <li>
            <Link to="./check">확인/취소</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
