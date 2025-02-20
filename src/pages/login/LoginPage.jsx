// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import './LoginPage.css';

import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const { login, loggedIn } = useAuth();
  const navigate = useNavigate();

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
      color: '#FFFFFF',
    },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });

  if (loggedIn) navigate('/');

  const handleLogin = async () => {
    if (!studentId || !password) {
      openErrorSnackbar('아이디와 비밀번호를 모두 입력해주세요.', 2500);
      return;
    }
    try {
      await login({ id: studentId, password });
      openSuccessSnackbar('로그인 되었습니다', 1500); // 성공 시 스낵바 실행
    } catch (error) {
      openErrorSnackbar(error.message, 2500); // 실패 시 에러 메시지 표시
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
        <h1 className="flex justify-center w-screen text-2xl text-center mt-20 mb-5">
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
          <span onClick={handlePasword}>비밀번호 재설정하러 가기 &gt;</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
