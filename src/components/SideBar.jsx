import React, { useEffect, useRef, useState } from 'react';
('use client');

import { BiCalendarEdit, BiDetail, BiLogIn } from 'react-icons/bi';
import { IoPersonSharp } from 'react-icons/io5';
import { Sidebar } from 'flowbite-react';

import bars from '../assets/bars icon.png';

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
    <>
      <div>
        {!isMobile && (
          <Sidebar
            aria-label="Default sidebar example"
            className="h-screen"
            ref={sidebarRef}>
            <Sidebar.Logo
              href="/"
              img="/img/logo.png"
              imgAlt="Logo"
              style={{ height: '50px', color: 'black' }}>
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
        )}
      </div>

      <div
        ref={sidebarRef}
        onClick={handleSidebarClick}
        className={`text-white fixed left-0 w-64 h-full transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#f9fafb' }}>
        <Sidebar
          aria-label="Default sidebar example"
          className="h-screen"
          ref={sidebarRef}>
          <Sidebar.Logo
            href="/"
            img="/img/logo.png"
            imgAlt="Logo"
            style={{ height: '50px', color: 'black' }}>
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
      </div>

      <div className="flex flex-col md:flex-row justify-between p-4">
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <div className="md:hidden mr-3" onClick={handleSidebar}>
            <img src={bars} alt="Menu" className="w-6 h-6 cursor-pointer" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
