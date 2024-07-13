import React, { useState } from 'react';
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
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
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

  const handleSignUp = async () => {
    try {
      await doSignUp({ username, password, serial, name, email });
      // 성공시의 추가 작업
    } catch (error) {
      // 에러 처리
      openSnackbar(
        error.response?.data?.errorMessage ||
          '회원 가입 중 오류가 발생했습니다.',
      );
      setTimeout(() => {
        closeSnackbar();
      }, 5000);
    }
  };

  return (
    <div>
      <h1 className="flex justify-center w-screen text-xl font-bold text-center mt-10 mb-5">
        회원가입
      </h1>
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
