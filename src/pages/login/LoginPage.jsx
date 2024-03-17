'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Button, Label, TextInput } from 'flowbite-react';

import './LoginPage.css';
import '../../firebase.js';

const LoginPage = () => {
  const [studentId, setStudentId] = useState('');
  const [userName, setUserName] = useState('');
  const [setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = () => {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, studentId, userName)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('login');
        navigate('/rooms');
        return user;
      })
      .catch(error => {
        const errorMessage = error.message;
        setError(errorMessage);
      });
  };

  // 취소를 누르면 데이터 삭제되는 함수 구현해야함
  // 확인 누르면 Reservation.jsx로 가야함 데이터랑 같이 !!!

  return (
    <div>
      <div>
        <h1 className="flex justify-center w-screen text-3xl font-bold text-center mt-10 mb-5">
          로그인
        </h1>
      </div>
      <div>
        <form id="form" className="border pt-3 pb-10">
          <div>
            <div className="mb-2 ml-3 block">
              <Label htmlFor="studentId" value="학번" />
            </div>
            <TextInput
              className="ml-3 mr-3 mb-5"
              id="studentId"
              placeholder="ex) 2022xxxxx"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 ml-3 block">
              <Label htmlFor="name" value="이름" />
            </div>
            <TextInput
              className="ml-3 mr-3"
              id="name"
              type="name"
              placeholder="ex) 홍길동"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              required
            />
          </div>
        </form>
        <div className="flex mt-10 justify-center">
          <Button
            id="btn"
            className="w-auto h-auto cursor-pointer text-white"
            color="dark"
            onClick={handleSignIn}>
            로그인하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
