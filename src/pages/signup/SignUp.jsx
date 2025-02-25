import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Label, TextInput } from 'flowbite-react';
import { useSignUp } from '../../api/user.api';
import { useSnackbar } from 'react-simple-snackbar';

const SignUp = () => {
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { mutateAsync: doSignUp } = useSignUp();
  const navigate = useNavigate();
  const [openErrorSnackbar, closeErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });
  const [openSuccessSnackbar, closeSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
    },
  });
  const handleName = e => {
    setName(e.target.value);
  };

  const handleSerial = e => {
    setSerial(e.target.value);
  };

  const handleUserName = e => {
    setUsername(e.target.value);
  };

  const handlePassword = e => {
    setPassword(e.target.value);
  };

  const handleEmail = e => {
    setEmail(e.target.value);
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!validateEmail(email)) {
      openErrorSnackbar('유효한 이메일을 입력해주세요.');
      setTimeout(() => {
        closeErrorSnackbar();
      }, 5000);
      return;
    }

    try {
      await doSignUp({ username, password, serial, name, email });
      openSuccessSnackbar('회원 가입이 완료 되었습니다.');
      setTimeout(() => {
        closeSuccessSnackbar();
      }, 3000);
      navigate('/');
    } catch (error) {
      // 에러 처리
      openErrorSnackbar(
        error.response?.data?.message || '회원 가입 중 오류가 발생했습니다.',
      );
      setTimeout(() => {
        closeErrorSnackbar();
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center w-screen ">
      <h1 className="text-2xl text-center mt-10 mb-5">회원가입</h1>
      <form id="form" className="flex flex-col max-w-md w-full gap-4">
        <div>
          <div className="mb-2 block">
            <Label value="이름" />
          </div>
          <TextInput
            onChange={handleName}
            type="text"
            placeholder="이름을 입력해주세요"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label value="학번" />
          </div>
          <TextInput
            onChange={handleSerial}
            type="text"
            placeholder="학번을 입력해주세요"
            maxLength={9}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label value="아이디" />
          </div>
          <TextInput
            onChange={handleUserName}
            type="id"
            placeholder="아이디를 입력해주세요"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label value="비밀번호" />
          </div>
          <TextInput
            onChange={handlePassword}
            type="password"
            placeholder="비밀번호를 입력해주세요"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label value="이메일" />
          </div>
          <TextInput
            onChange={handleEmail}
            type="email"
            placeholder="이메일을 입력해주세요"
            required
          />
        </div>
        <Button
          onClick={handleSignUp}
          className="mt-10 mb-10"
          color="dark"
          type="button">
          회원 가입
        </Button>
      </form>
    </div>
  );
};

export default SignUp;
