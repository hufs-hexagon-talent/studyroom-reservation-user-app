import React, { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';

import bars from '../../assets/bars icon.png';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
    };

    // 초기 로딩 시와 리사이즈 이벤트 발생 시 handleResize 함수 호출
    handleResize();
    window.addEventListener('resize', handleResize);

    // 컴포넌트가 unmount 될 때 resize 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav className="bg-white border border-2">
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

          <div className="md:hidden mr-3">
            <img src={bars} alt="Menu" className="w-6 h-6 cursor-pointer" />
          </div>
        </div>

        <ul className={`flex flex-col mt-5 md:flex-row list-none text-center md:text-left mt- ${isMobile ? 'hidden' : 'block'}`}>
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
