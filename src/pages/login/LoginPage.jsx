import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import './LoginPage.css';

import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const { login, loggedIn } = useAuth();
  const navigate = useNavigate();

  const [openSuccessSnackbar, closeSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
      color: '#FFFFFF',
    },
  });

  const [openErrorSnackbar, closeErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });

  useEffect(() => {
    if (loggedIn) navigate('/');
  }, [loggedIn, navigate]);

  const handleLogin = async () => {
    if (!studentId || !password) {
      openErrorSnackbar('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await login({ id: studentId, password });

      location.reload(); // 페이지 새로고침
      openSuccessSnackbar(`로그인 되었습니다`, 2500); //todo
    } catch (error) {
      location.reload();
    }
  };

  const handlePasword = () => {
    navigate('/email');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div>
      <div>
        <h1 className="flex justify-center w-screen text-2xl text-center mt-10 mb-5">
          로그인
        </h1>
      </div>
      <div>
        <form id="form" className="pt-3 pb-5">
          <div className="flex flex-col items-center">
            <TextInput
              className="textInput"
              id="number"
              placeholder="학번을 입력해주세요"
              onChange={e => setStudentId(e.target.value)}
            />
            <TextInput
              className="textInput"
              id="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              onKeyDown={handleKeyDown}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              id="btn"
              className="cursor-pointer text-white w-full max-w-xs"
              color="dark"
              onClick={handleLogin}>
              로그인하기
            </Button>
          </div>
        </form>
        <div className="flex flex-col items-center justify-center w-screen pt-4 pb-10 text-sm text-gray-600 cursor-pointer">
          {/* <span onClick={handleSignUp}>회원가입</span>
          <span className="px-2">|</span> */}
          <span onClick={handlePasword}>비밀번호 재설정하러 가기 &gt;</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
