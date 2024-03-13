import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import bars from '../../assets/bars icon.png';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSidebarClick = event => {
    event.stopPropagation();
  };

  return (
    <nav
      className="bg-white border-2"
      style={{ borderBottomColor: '#002D56', borderTop: 'none' }}>
      <div
        ref={sidebarRef}
        onClick={handleSidebarClick}
        className={`text-white fixed right-0 w-64 h-full transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: '#002D56' }}>
        <ul className="relative top-5 w-full px-5 box-border">
          <li className="mb-3">
            <Link to="./rooms" onClick={handleSidebar}>
              세미나실 예약하기
            </Link>
          </li>
          <li className="mb-3">
            <Link to="./check" onClick={handleSidebar}>
              내 신청 현황
            </Link>
          </li>
          <li className="mb-3">
            <Link to="./notice" onClick={handleSidebar}>
              이용 규칙
            </Link>
          </li>
          <li>
            <Link to="./login" onClick={handleSidebar}>
              로그인
            </Link>
          </li>
        </ul>
      </div>

      <div className="flex flex-col md:flex-row justify-between p-4">
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <div className="flex items-center">
            <Link to="./rooms">
              <img src={logo} alt="" className="w-16 h-16 cursor-pointer" />
            </Link>
            <h1 className="text-xl font-bold ml-4" style={{ color: '#002D56' }}>
              컴퓨터공학부 세미나실 예약 시스템
            </h1>
          </div>

          <div className="md:hidden mr-3" onClick={handleSidebar}>
            <img src={bars} alt="Menu" className="w-6 h-6 cursor-pointer" />
          </div>
        </div>

        <ul
          className={`flex flex-col mt-5 md:flex-row list-none text-center md:text-left mt- ${isMobile ? 'hidden' : 'block'}`}>
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./rooms" className="hover:text-gray-300">
              세미나실 예약하기
            </Link>
          </li>
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./check" className="hover:text-gray-300">
              내 신청 현황
            </Link>
          </li>
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./notice" className="hover:text-gray-300">
              이용 규칙
            </Link>
          </li>
          <li className="mb-3 md:mb-0 md:mr-6">
            <Link to="./login" className="hover:text-gray-300">
              로그인
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
