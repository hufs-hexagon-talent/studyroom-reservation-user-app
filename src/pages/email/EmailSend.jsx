import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import { useNewEmailSend, useNewEmailVerify } from '../../api/user.api';
import { Button } from 'flowbite-react';

const EmailSend = () => {
  const { mutateAsync: doEmailSend } = useNewEmailSend();
  const { mutateAsync: doEmailVerify } = useNewEmailVerify();

  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(null);
  const [timerDisplay, setTimerDisplay] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [isEmailSendSuccess, setIsEmailSendSuccess] = useState(false);
  const [isPassword, setIsPassword] = useState(false);

  const navigate = useNavigate();

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
      color: '#FFFFFF',
    },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });

  // timer
  useEffect(() => {
    if (timer === null) return;

    const countdown = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          setTimerDisplay(''); // 타이머 종료 시 표시 제거
          setDisabled(false);
          return null;
        }
        const minutes = Math.floor(prevTimer / 60);
        const seconds = prevTimer % 60;
        setTimerDisplay(`${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`);
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  // 인증 코드 발송
  const handleSendCode = async () => {
    try {
      setDisabled(true);
      const response = await doEmailSend({ password, newEmail });
      setIsEmailSendSuccess(true);
      openSuccessSnackbar(response.message, 2500);
      setTimer(300);
    } catch (error) {
      openErrorSnackbar(
        error.response?.data?.message || '인증 코드 발송에 실패하였습니다.',
        2500,
      );
      setIsEmailSendSuccess(false);
      setDisabled(false);
    }
  };

  // 인증 코드 입력 감지
  const handleVerificationCode = e => {
    setVerificationCode(e.target.value);
  };

  //인증 코드 확인
  const handleButton = async () => {
    try {
      const response = await doEmailVerify({
        email: newEmail,
        verifyCode: verificationCode,
      });
      openSuccessSnackbar(response.message, 2500);
      navigate('/mypage');
    } catch (error) {
      openErrorSnackbar(
        error.response?.data?.message || '이메일 재설정에 실패하였습니다.',
        2500,
      );
    }
  };
  return (
    <div className="flex flex-col items-center w-screen p-5">
      <h1
        style={{ fontWeight: 450 }}
        className="text-2xl text-center mt-10 mb-5">
        이메일 재설정을 위한 본인 인증
      </h1>
      <div className="mt-5 mb-10 text-center" style={{ color: '#9D9FA2' }}>
        <p className="break-keep">
          이메일 재설정을 위해선 비밀번호와 이메일을 통한 본인 인증이 필요합니다
        </p>
        <p className="mt-2 break-keep">
          본인의 비밀번호와 새 이메일 주소를 입력하면 해당하는 이메일로 인증
          코드가 전송됩니다
        </p>
      </div>
      {/* 비밀번호 입력 */}
      <div className="flex items-center justify-center border rounded-lg p-2 mb-5 w-full max-w-md">
        <div className="relative flex-grow">
          <input
            onChange={e => {
              setPassword(e.target.value);
              setIsPassword(e.target.value.trim().length > 0);
            }}
            type="password"
            className="focus:outline-none w-full p-2 text-sm border-none"
            placeholder="비밀번호 입력"
            value={password}
          />
        </div>
      </div>
      {/* 새 이메일 입력 */}
      <div className="flex items-center justify-center border rounded-lg p-2 mb-5 w-full max-w-md">
        <div className="relative flex-grow">
          <input
            onChange={e => setNewEmail(e.target.value)}
            type="email"
            className="focus:outline-none w-full p-2 text-sm border-none"
            placeholder="새 이메일 입력"
            value={newEmail}
          />
          {timerDisplay && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-sm">
              {timerDisplay}
            </span>
          )}
        </div>
        <button
          id="button"
          onClick={handleSendCode}
          className={`text-white p-2 rounded-lg ml-2 ${disabled || !isPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ backgroundColor: '#1e2332' }}
          disabled={disabled || !isPassword}>
          인증 코드 발송
        </button>
      </div>
      {/* 인증 코드 입력 */}
      {isEmailSendSuccess && (
        <div className="flex items-center justify-center border rounded-lg p-2 mb-5 w-full max-w-md">
          <input
            onChange={handleVerificationCode}
            className="focus:outline-none flex-grow p-2 text-sm border-none"
            placeholder="인증 코드 입력"></input>
        </div>
      )}
      {/* 확인 버튼 */}
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

export default EmailSend;
