import React, { useState } from 'react';
import axios from 'axios';
import { Button, Label, TextInput } from 'flowbite-react';

import './LoginPage.css';

const LoginPage = () => {
  //const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'https://api.user.connect.alpaon.dev/user/auth/login',
        {
          username: userName,
          password: password,
        },
      );
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      console.log(accessToken, refreshToken);
      setIsLogin(true);
    } catch (error) {
      console.error('로그인 오류 : ', error.response.data);
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
              id="studentId"
              placeholder="ex) 2022xxxxx"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <div className="ml-3 block">
              <Label htmlFor="name" value="이름" />
            </div>
            <TextInput
              className="ml-3 mr-3"
              id="name"
              type="name"
              placeholder="ex) 홍길동"
              onChange={e => setUserName(e.target.value)}
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
