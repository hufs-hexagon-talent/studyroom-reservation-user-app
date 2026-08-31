import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import './EmailVerify.css';
import { useEmailSend, useEmailVerify } from '../../api/auth.api';
import { Button } from 'flowbite-react';
import {
  RESEND_COOLDOWN_SECONDS,
  sendCodeErrorMessage,
  verifyCodeErrorMessage,
} from './emailVerifyMessages';

const EmailVerify = () => {
  const [username, setUsername] = useState('');
  const { mutateAsync: doEmailSend } = useEmailSend();
  const { mutateAsync: doEmailVerify } = useEmailVerify();
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(null);
  const [timerDisplay, setTimerDisplay] = useState(''); // 타이머 표시 상태
  const [token, setToken] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // 상태는 다음 렌더에서야 바뀐다. 같은 tick 의 두 번째 탭까지 막으려면 동기 값이어야 한다.
  const verifyingRef = useRef(false);

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
      const response = await doEmailSend(username);
      setVerificationId(response.verificationId);

      openSuccessSnackbar('인증 코드 발송에 성공하였습니다.');
      setTimeout(() => {
        closeSuccessSnackbar();
      }, 2500);
      setTimer(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      // 원인별로 다른 안내. 서버 원문은 띄우지 않는다.
      openErrorSnackbar(sendCodeErrorMessage(error));
      setTimeout(() => {
        closeErrorSnackbar();
      }, 2500);
      setDisabled(false);
    }
  };

  // 서버에 코드가 남아 있지 않으면(시도 초과·만료) 재발송 잠금을 푼다
  const releaseResendLock = () => {
    setTimer(null);
    setTimerDisplay('');
    setDisabled(false);
  };

  // 인증 코드 입력 감지
  const handleVerificationCode = e => {
    setVerificationCode(e.target.value);
  };

  //인증 코드 확인
  const handleButton = async () => {
    // 한 번 더 탭하면 서버의 인증 코드 시도 횟수(5회)만 줄어든다
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
    try {
      const response = await doEmailVerify({
        verificationId: verificationId,
        verifyCode: verificationCode,
      });
      const passwordResetToken = response.data.passwordResetToken;
      setToken(passwordResetToken);
      sessionStorage.setItem('pwResetToken', passwordResetToken);
      openSuccessSnackbar('인증 코드 확인에 성공하였습니다.');
      setTimeout(() => {
        closeSuccessSnackbar();
      }, 2500);
      navigate('/email/pwreset');
    } catch (error) {
      const { message, resetResend } = verifyCodeErrorMessage(error);
      if (resetResend) releaseResendLock();
      openErrorSnackbar(message);
      setTimeout(() => {
        closeErrorSnackbar();
      }, 2500);
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  };
  return (
    <div className="flex flex-col items-center w-screen p-5">
      <h1
        style={{ fontWeight: 450 }}
        className="text-2xl text-center mt-10 mb-5">
        비밀번호 재설정을 위한 본인 인증
      </h1>
      <div className="mt-5 mb-10 text-center" style={{ color: '#9D9FA2' }}>
        <p className="break-keep">
          비밀번호 재설정을 위해선 이메일을 통한 본인 인증이 필요합니다
        </p>
        <p className="mt-2 break-keep">
          본인의 아이디를 입력하면 해당하는 이메일로 인증 코드가 전송됩니다
        </p>
      </div>
      <div className="flex items-center justify-center border rounded-lg p-2 mb-5 w-full max-w-md">
        <div className="relative flex-grow">
          <input
            onChange={e => setUsername(e.target.value)}
            type="text"
            className="focus:outline-none w-full p-2 text-sm border-none"
            placeholder="아이디 입력"
            value={username}
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
          className={`text-white p-2 rounded-lg ml-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ backgroundColor: '#1e2332' }}
          disabled={disabled}>
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
        disabled={verifying}
        className="cursor-pointer text-white w-full max-w-xs">
        {verifying ? '확인 중...' : '확인'}
      </Button>
    </div>
  );
};

export default EmailVerify;
