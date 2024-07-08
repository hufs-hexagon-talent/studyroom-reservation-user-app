import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Label, TextInput } from 'flowbite-react';

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
    }
  };

  const handlePasword = () => {
    navigate('/pwreset');
  };

  return (
    <div>
      <div>
        <h1 className="flex justify-center w-screen text-2xl font-bold text-center mt-10 mb-5">
          로그인
        </h1>
      </div>
      <div>
        <form id="form" className="pt-3 pb-5">
          <div className="inputContainer">
            <TextInput
              className="textInput"
              id="number"
              placeholder="학번을 입력해주세요"
              onChange={e => setStudentId(e.target.value)}
            />
          </div>
          <div className="inputContainer">
            <TextInput
              className="textInput"
              id="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </form>
        <div className="buttonContainer pb-16">
          <Button
            id="btn"
            className="cursor-pointer text-white"
            color="dark"
            onClick={handleLogin}>
            로그인하기
          </Button>
          <div
            onClick={handlePasword}
            className="pt-4 text-sm text-gray-600 cursor-pointer">
            비밀번호 변경 &gt;
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
