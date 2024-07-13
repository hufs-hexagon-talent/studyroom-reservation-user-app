import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import './PasswordReset.css';
import { useEmailSend } from '../../api/user.api';
import { Button } from 'flowbite-react';

const PasswordReset = () => {
  const [username, setUsername] = useState('');
  const { mutateAsync: doEmailSend } = useEmailSend();
  const [verificationCodeFromServer, setVerificationCodeFromServer] =
    useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

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

  const handleSendCode = async () => {
    try {
      const data = await doEmailSend(username);
      setVerificationCodeFromServer(data.verificationCode);

      openSuccessSnackbar('인증 코드 전송에 성공하였습니다.');
      setTimeout(() => {
        closeSuccessSnackbar();
      }, 5000);
    } catch (error) {
      openErrorSnackbar('인증 코드 전송에 실패하였습니다.');
      setTimeout(() => {
        closeErrorSnackbar();
      }, 5000);
    }
  };

  const handleVerificationCode = e => {
    setVerificationCode(e.target.value);
  };

  const handleButton = () => {
    if (verificationCode === verificationCodeFromServer.toString()) {
      openSuccessSnackbar('인증 코드가 일치합니다.');
      setTimeout(() => {
        closeSuccessSnackbar();
      }, 5000);
      navigate('/password');
    } else {
      openErrorSnackbar('인증 코드가 일치하지 않습니다.');
      setTimeout(() => {
        closeErrorSnackbar();
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center w-screen p-5">
      <h1 className="text-xl font-bold text-center mt-10 mb-5">
        비밀번호 재설정을 위한 본인 인증
      </h1>
      <div
        className="mt-5 mb-10 text-sm text-center"
        style={{ color: '#9D9FA2' }}>
        {/* todo: 띄어쓰기 별로 줄바꿈*/}
        <p>비밀번호 재설정을 위해선 이메일을 통한 본인 인증이 필요합니다</p>
        <br />
        <p>본인의 아이디를 입력하면 해당하는 이메일로 인증 코드가 전송됩니다</p>
      </div>
      <div className="flex items-center justify-center border rounded-lg p-2 mb-5 w-full max-w-md">
        <input
          onChange={e => setUsername(e.target.value)}
          type="text"
          className="focus:outline-none flex-grow p-2 text-sm border-none"
          placeholder="아이디 입력"
        />
        <button
          id="button"
          onClick={handleSendCode}
          className="text-white p-2 rounded-lg ml-2"
          style={{ backgroundColor: '#1e2332' }}>
          인증 코드 발송
        </button>
      </div>
      <div className="flex items-center justify-center border rounded-lg p-2 mb-5 w-full max-w-md">
        <input
          onChange={handleVerificationCode}
          className="focus:outline-none flex-grow p-2 text-sm border-none"
          placeholder="인증 코드 입력"></input>
      </div>
      {/* todo: input이랑 버튼 열 맞추기 */}
      <Button
        onClick={handleButton}
        style={{ backgroundColor: '#1e2332' }}
        id="btn"
        className="cursor-pointer text-white w-full max-w-xs">
        확인
      </Button>
    </div>
  );
};

export default PasswordReset;
