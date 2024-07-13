import React, { useState } from 'react';
import { useSnackbar } from 'react-simple-snackbar';
import './PasswordReset.css';
import { useEmailSend } from '../../api/user.api';

const PasswordReset = () => {
  const [username, setUsername] = useState('');
  const { mutateAsync: doEmailSend } = useEmailSend();
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  const handleSendCode = () => {
    doEmailSend(username);
  };

  return (
    <div className="flex flex-col items-center w-screen p-5">
      <h1 className="text-xl font-bold text-center mt-10 mb-5">
        비밀번호 재설정을 위한 본인 인증
      </h1>
      <div
        className="mt-5 mb-10 text-sm text-center"
        style={{ color: '#9D9FA2' }}>
        비밀번호 재설정을 위해선 이메일을 통한 본인 인증이 필요합니다
        <br />
        <p className="mt-2">
          본인의 아이디를 입력하면 해당하는 이메일로 인증 코드가 전송됩니다
        </p>
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
          style={{ backgroundColor: '#002D56' }}>
          인증 코드 발송
        </button>
      </div>
    </div>
  );
};

export default PasswordReset;
