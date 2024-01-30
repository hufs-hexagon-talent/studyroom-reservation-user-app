import React, { useState } from "react";
import "./Navbar.css";
import cse_logo from "../../assets/hufs_cse_logo.jpg";

const Navbar = () => {
  return (
    <div>
      <div className="navbar">
        <img src={cse_logo} alt="" className="logo" />
        <div className="titleName">컴퓨터공학부 스터디룸 예약 시스템</div>
        <ul>
          <li>예약 현황</li>
          <li>예약하러 가기</li>
          <li>Login</li>
          <li>Register</li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
