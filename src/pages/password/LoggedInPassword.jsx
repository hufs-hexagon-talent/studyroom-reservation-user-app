import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Label, TextInput } from 'flowbite-react';
import { usePassword, useMyInfo } from '../../api/user.api';
import { useSnackbar } from 'react-simple-snackbar';
import './LoggedInPassword.css';

const LoggedInPassword = () => {
  const [id, setId] = useState('');
  const [prePassword, setPrePassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { data: me } = useMyInfo();
  const { mutateAsync: changePw } = usePassword();
  const navigate = useNavigate();
  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });
  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
      color: '#FFFFFF',
    },
  });

  // 아이디
  const handleIdChange = e => {
    setId(e.target.value);
    setIdError('');
  };

  // 기존 비밀번호
  const handlePwChange = e => {
    setPrePassword(e.target.value);
  };

  // 신규 비밀번호
  const handleNewPasswordChange = e => {
    setNewPassword(e.target.value);
  };

  // 신규 비밀번호 확인
  const handleConfirmPasswordChange = e => {
    setConfirmPassword(e.target.value);
    setPasswordError('');
  };

  // 비밀번호 수정
  const handleSubmit = async e => {
    e.preventDefault();

    // 모든 필드가 채워져 있는지 확인
    if (!id || !prePassword || !newPassword || !confirmPassword) {
      const errorMessage = '모든 값을 입력해주세요';
      openErrorSnackbar(errorMessage); // 모든 값을 입력하라는 오류 메시지 표시
      return;
    }

    if (me.username !== id) {
      const errorMessage = '본인의 아이디가 아닙니다.';
      setIdError(errorMessage);
      openErrorSnackbar(errorMessage); // 직접 문자열을 전달
      return;
    }

    if (newPassword !== confirmPassword) {
      const errorMessage = '신규 비밀번호가 일치하지 않습니다.';
      setPasswordError(errorMessage);
      openErrorSnackbar(errorMessage); // 직접 문자열을 전달
      return;
    }

    // if (!users || !users.find(user => user.username === id)) {
    //   setIdError('존재하지 않는 아이디입니다.');
    //   return;
    // }

    setIdError('');
    setPasswordError('');
    try {
      const response = await changePw({ prePassword, newPassword });
      openSuccessSnackbar(response.message);
      navigate('/');
    } catch (error) {
      console.error('Failed to change password:', error);
      openErrorSnackbar(error.message, 2500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-10 text-2xl mb-4">비밀번호 변경</div>
      <form
        id="form"
        className="flex flex-col max-w-md w-full gap-4"
        onSubmit={handleSubmit}>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email1" value="아이디" />
          </div>
          <TextInput
            onChange={handleIdChange}
            id="email1"
            type="text"
            placeholder="아이디를 입력해주세요"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password1" value="기존 비밀번호" />
          </div>
          <TextInput
            onChange={handlePwChange}
            id="password1"
            type="password"
            placeholder="기존 비밀번호를 입력해주세요"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="newPassword" value="새 비밀번호" />
          </div>
          <TextInput
            onChange={handleNewPasswordChange}
            id="newPassword"
            type="password"
            placeholder="새 비밀번호를 입력해주세요"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="confirmPassword" value="새 비밀번호 확인" />
          </div>
          <TextInput
            onChange={handleConfirmPasswordChange}
            id="confirmPassword"
            type="password"
            placeholder="새 비밀번호를 한번 더 입력해주세요"
            required
          />
        </div>
        <Button
          onClick={handleSubmit}
          className="mt-10 mb-10"
          color="dark"
          type="submit">
          변경하기
        </Button>
      </form>
    </div>
  );
};

export default LoggedInPassword;
