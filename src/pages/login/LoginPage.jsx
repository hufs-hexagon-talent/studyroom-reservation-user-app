'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Button, Label, TextInput } from 'flowbite-react';

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
    <>
      <div className="justify-center w-screen">
        <h1 className='text-3xl font-bold text-center mt-10'>예약자 정보 기입</h1>
      </div>
      <div className='border'>
        <form>
          <div>
            <div className="mb-2 ml-3 mt-3 block">
              <Label htmlFor="studentId" value="학번" />
            </div>
            <TextInput 
              className='ml-3 mr-3 mb-5'
              id="studentId" 
              placeholder="ex) 2022xxxxx"
              value={studentId}
              onChange={e=>setStudentId(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-2 ml-3 block">
              <Label htmlFor="name" value="이름" />
            </div>
            <TextInput 
              className='ml-3 mr-3'
              id="name" 
              type="name" 
              placeholder='ex) 홍길동' 
              value={userName}
              onChange={e=>setUserName(e.target.value)}
              required />
          </div>
        </form>
        <div className="flex mt-5 gap-4 justify-center">
          <Button 
            className="w-24 h-10 mr-2 ml-3 cursor-pointer text-black text-lg hover:opacity-90 flex items-center justify-center" 
            color='gray'
          >
            취소
          </Button>
          <Button 
            className="w-24 h-10 ml-2 mr-3 cursor-pointer text-white text-lg hover:opacity-90 flex items-center justify-center"
            color='dark'
            onClick={handleSignIn}
          >
            확인
          </Button>
        </div>
      </div>
      
    </>
  );
};

export default LoginPage;
