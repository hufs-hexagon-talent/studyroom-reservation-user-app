import React, { useEffect } from 'react';
import { Navbar } from 'flowbite-react';
import Logo from '../../assets/logoCes.png';
import useAuth from '../../hooks/useAuth';
import { useServiceRole } from '../../api/user.api';

const NavigationBarCes = () => {
  const { loggedIn, logout } = useAuth();
  const { data: serviceRole, refetch } = useServiceRole();

  useEffect(() => {
    if (loggedIn) {
      refetch();
    }
  }, [loggedIn, refetch]);

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
        {/* 출석 체크용 아이디라면 */}
        {loggedIn && serviceRole === 'RESIDENT' ? (
          <>
            <Navbar.Link href="/qrcheck">출석 체크</Navbar.Link>
            <Navbar.Link href="/notice">이용 규칙</Navbar.Link>
            {loggedIn ? (
              <Navbar.Link href="/" onClick={logout}>
                로그아웃
              </Navbar.Link>
            ) : (
              <Navbar.Link href="/login">로그인</Navbar.Link>
            )}
          </>
        ) : (
          <>
            {loggedIn && serviceRole === 'ADMIN' && (
              <Navbar.Link href="/qrcheck">출석 체크</Navbar.Link>
            )}
            <Navbar.Link href="/">세미나실 예약</Navbar.Link>
            <Navbar.Link
              href={loggedIn ? '/check' : '#'}
              className={!loggedIn ? 'pointer-events-none text-gray-400' : ''}>
              내 신청 현황
            </Navbar.Link>
            <Navbar.Link
              href={loggedIn ? '/otp' : '#'}
              className={!loggedIn ? 'pointer-events-none text-gray-400' : ''}>
              내 QR코드
            </Navbar.Link>
            <Navbar.Link href="/notice">이용 규칙</Navbar.Link>
            {loggedIn && (
              <Navbar.Link href="/password">비밀번호 변경</Navbar.Link>
            )}
            {loggedIn ? (
              <Navbar.Link href="/" onClick={logout}>
                로그아웃
              </Navbar.Link>
            ) : (
              <Navbar.Link href="/login">로그인</Navbar.Link>
            )}
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBarCes;
