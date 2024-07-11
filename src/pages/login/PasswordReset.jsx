import React, { useState } from 'react';
import { useSnackbar } from 'react-simple-snackbar';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;

  const emailCheck = email => {
    return emailRegEx.test(email);
  };

  const handleSendCode = () => {
    if (!emailCheck(email)) {
      openSnackbar('유효하지 않는 이메일 형식입니다');
      setTimeout(() => {
        closeSnackbar();
      }, 5000);
    } else {
      // todo:이메일 전송 로직 추가
      console.log('인증 코드 발송');
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
        비밀번호 재설정을 위해선 이메일을 통한 본인 인증이 필요합니다.
      </div>
      <div className="flex items-center justify-center border rounded-lg p-2 mb-5 w-full max-w-md">
        <input
          onChange={e => setEmail(e.target.value)}
          type="email"
          className="focus:outline-none flex-grow p-2 text-sm border-none"
          placeholder="이메일 입력"
        />
        <button
          onClick={handleSendCode}
          className="text-white text-xs p-2 rounded-lg ml-2"
          style={{ backgroundColor: '#002D56' }}>
          인증 코드 발송
        </button>
      </div>
    </div>
  );
};

export default PasswordReset;
