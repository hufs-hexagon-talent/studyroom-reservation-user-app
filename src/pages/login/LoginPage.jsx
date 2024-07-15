import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';

import './LoginPage.css';

import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const { login, loggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) navigate('/');
  }, [loggedIn, navigate]);

  const handleLogin = async () => {
    try {
      await login({ id: studentId, password });
      location.reload(); // 페이지 새로고침
    } catch (error) {
      setError('로그인 오류 : ', error.message);
      location.reload();
    }
  };

  const handlePasword = () => {
    navigate('/pwreset');
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
        {/* todo: 두 개 정렬 다시하기 */}
        <div className="flex justify-center w-screen pt-4 pb-10 text-sm text-gray-600 cursor-pointer">
          <span onClick={handleSignUp}>회원가입</span>
          <span className="px-2">|</span>
          <span onClick={handlePasword}>비밀번호 재설정</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
