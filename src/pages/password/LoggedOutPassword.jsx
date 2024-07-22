import React, { useState } from 'react';
import { useLoggedOutPassword } from '../../api/user.api';
import { Button, Label, TextInput } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';

const LoggedOutPassword = () => {
  const { mutateAsync: doPasswordChange } = useLoggedOutPassword();
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const token = sessionStorage.getItem('pwResetToken');

  const [openSuccessSnackbar, closeSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
      color: '#FFFFFF',
    },
  });

  const [openErrorSnackbar, closeErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  // 신규 비밀번호
  const handleNewPw = e => {
    setNewPw(e.target.value);
  };

  // 신규 비밀번호 확인
  const handleConfirmNewPw = e => {
    setConfirmNewPw(e.target.value);
  };

  // 비밀번호 변경
  const handleChange = async e => {
    e.preventDefault();
    if (newPw !== confirmNewPw) {
      openErrorSnackbar('비밀번호가 일치하지 않습니다.', 2500);
      return;
    }
    try {
      await doPasswordChange({ token: token, newPassword: newPw });
      openSuccessSnackbar('비밀번호가 성공적으로 변경되었습니다.', 2500);
    } catch (error) {
      openErrorSnackbar(
        '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.',
        2500,
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <div className="mt-10 text-2xl mb-4">비밀번호 변경</div>
        <form id="form" className="flex flex-col max-w-md w-full gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="newPassword" value="새 비밀번호" />
            </div>
            <TextInput
              onChange={handleNewPw}
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
              onChange={handleConfirmNewPw}
              id="confirmPassword"
              type="password"
              placeholder="새 비밀번호를 한번 더 입력해주세요"
              required
            />
          </div>
          <Button
            onClick={handleChange}
            className="mt-10 mb-10"
            color="dark"
            type="submit">
            변경하기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoggedOutPassword;
