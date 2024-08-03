import React, { useState, useEffect } from 'react';
import { Button, Label, TextInput } from 'flowbite-react';
import { useAllUsers, usePassword, useMyInfo } from '../../api/user.api';
import { useSnackbar } from 'react-simple-snackbar';
import './LoggedInPassword.css';

const LoggedInPassword = () => {
  const [id, setId] = useState('');
  const [prePassword, setPrePassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { data: users } = useAllUsers();
  const { data: me } = useMyInfo();
  const { mutateAsync: changePw } = usePassword();
  const [openErrorSnackbar, closeErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
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

    if (me.username !== id) {
      setIdError('본인의 아이디가 아닙니다.');
      openErrorSnackbar(idError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('신규 비밀번호가 일치하지 않습니다.');
      openErrorSnackbar(passwordError);
      return;
    }

    if (!users || !users.find(user => user.username === id)) {
      setIdError('존재하지 않는 아이디입니다.');
      return;
    }

    setIdError('');
    setPasswordError('');
    try {
      await changePw({ prePassword, newPassword });
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
