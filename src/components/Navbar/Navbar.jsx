import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-gray-700">
      {' '}
      {/* div -> nav 태그 변경 */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4">
        {' '}
        {/* 반응형 디자인 적용 */}
        <div className="flex items-center mb-4 md:mb-0">
          <Link to="./status">
            <img src={logo} alt="" className="w-16 h-16 cursor-pointer" />{' '}
            {/* 로고 크기 수정 */}
          </Link>
          <h1 className="text-white text-xl font-bold ml-4">
            {' '}
            {/* h1 태그 적용 */}
            컴퓨터공학부 스터디룸 예약 시스템
          </h1>
        </div>
        <ul className="flex flex-col md:flex-row list-none text-center md:text-left">
          {' '}
          {/* 반응형 디자인 적용 */}
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./status" className="text-white hover:text-gray-300">
              예약 현황
            </Link>
          </li>
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./rooms" className="text-white hover:text-gray-300">
              예약하러 가기
            </Link>
          </li>
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./login" className="text-white hover:text-gray-300">
              로그인
            </Link>
          </li>
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./check" className="text-white hover:text-gray-300">
              확인/취소
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
