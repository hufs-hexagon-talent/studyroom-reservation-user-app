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

  return (
    <div>
      <div>
        <h1 className="flex justify-center w-screen text-3xl font-bold text-center mt-10 mb-5">
          로그인
        </h1>
      </div>
      <div>
        <form id="form" className="pt-3 pb-10 pl-10 pr-10">
          <div>
            <div className="mb-2 ml-3 block">
              <Label htmlFor="studentId" value="학번" />
            </div>
            <TextInput
              className="ml-3 mr-3 mb-5"
              id="number"
              placeholder="ex) 2022xxxxx"
              onChange={e => setStudentId(e.target.value)}
            />
          </div>
          <div>
            <div className="ml-3 block">
              <Label htmlFor="name" value="비밀번호" />
            </div>
            <TextInput
              className="ml-3 mr-3"
              id="name"
              type="password"
              placeholder="ex) 홍길동"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </form>
        <div className="flex pb-20 justify-center">
          <Button
            id="btn"
            className="w-auto h-auto cursor-pointer text-white"
            color="dark"
            onClick={handleLogin}>
            로그인하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
