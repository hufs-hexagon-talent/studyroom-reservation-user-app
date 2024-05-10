import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Label, TextInput } from 'flowbite-react';

import './LoginPage.css';

const LoginPage = () => {
  const [studentId, setStudentId] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const apiUrl = 'http://api.studyroom.jisub.kim/admin/users/';

  const getUser = async userId => {
    try {
      const response = await axios.get(apiUrl + userId);
      console.log(response.data);
      console.log('id : ', response.data.loginId);
      console.log('이름 : ', response.data.userName);
    } catch (errror) {
      console.log(errror);
    }
  };

  const handleRegisterClick = () => {
    getUser(studentId);
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
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
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
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
          </div>
        </form>
        <div className="flex pb-20 justify-center">
          <Button
            id="btn"
            className="w-64 h-auto cursor-pointer text-white"
            color="dark"
            onClick={handleRegisterClick}>
            로그인하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
