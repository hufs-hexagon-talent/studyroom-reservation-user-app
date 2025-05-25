import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Label, TextInput } from 'flowbite-react';
import { useSignUp } from '../../../api/user.api';
import { useCustomSnackbars } from '../../../components/snackbar/SnackBar';
import Create from '../../../assets/icons/create.png';

const SignUp = () => {
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  const { mutateAsync: doSignUp } = useSignUp();
  const navigate = useNavigate();

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
      openErrorSnackbar('유효한 이메일을 입력해주세요.', 5000);
      return;
    }

    try {
      await doSignUp({ username, password, serial, name, email });
      openSuccessSnackbar('회원 가입이 완료 되었습니다.', 3000);
      navigate('/');
    } catch (error) {
      // 에러 처리
      openErrorSnackbar(
        error.response?.data?.message || '회원 가입 중 오류가 발생했습니다.',
        3000,
      );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center">
        <div className="font-bold text-3xl text-black p-8">Sign Up</div>
        <img
          src={Create}
          onClick={handleSignUp}
          className="w-7 h-7 cursor-pointer hover:scale-125"
        />
      </div>
      <div className="px-6 lg:w-1/2 xl:w-1/3 space-y-4">
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
      </div>
    </div>
  );
};

export default SignUp;
