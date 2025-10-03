import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Label, TextInput } from 'flowbite-react';
import { usePassword } from '../../api/user.api';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';
import './LoggedInPassword.css';
import useAuth from '../../hooks/useAuth';
import { flushSync } from 'react-dom';
import { Eye, EyeOff } from 'lucide-react';

const LoggedInPassword = () => {
  const [prePassword, setPrePassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 보기/가리기 토글 상태
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutateAsync: changePw } = usePassword();
  const navigate = useNavigate();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  const { logout } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();

    // 모든 필드 체크
    if (!prePassword || !newPassword || !confirmPassword) {
      openErrorSnackbar('모든 값을 입력해주세요');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = '신규 비밀번호가 일치하지 않습니다.';
      setPasswordError(msg);
      openErrorSnackbar(msg);
      return;
    }

    setPasswordError('');
    try {
      await changePw({ prePassword, newPassword });
      openSuccessSnackbar(
        '비밀번호가 성공적으로 변경되었습니다. 재로그인 부탁드립니다.',
      );

      // 로그아웃 상태를 동기적으로 반영 후 이동
      flushSync(() => {
        logout();
      });

      // 자동 리다이렉트 회피
      navigate('/login', { replace: true, state: { fromLogout: true } });
    } catch (error) {
      console.error('Failed to change password:', error);
      openErrorSnackbar(
        error?.message ?? '비밀번호 변경에 실패했습니다.',
        2500,
      );
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
            <Label htmlFor="password1" value="기존 비밀번호" />
          </div>
          <div className="relative with-eye">
            <TextInput
              id="password1"
              type={showOld ? 'text' : 'password'}
              placeholder="기존 비밀번호를 입력해주세요"
              required
              autoComplete="current-password"
              onChange={e => setPrePassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showOld ? '비밀번호 숨기기' : '비밀번호 보기'}
              onClick={() => setShowOld(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center">
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* 새 비밀번호 */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="newPassword" value="새 비밀번호" />
          </div>
          <div className="relative with-eye">
            <TextInput
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              placeholder="새 비밀번호를 입력해주세요"
              required
              autoComplete="new-password"
              onChange={e => setNewPassword(e.target.value)}
              color={passwordError ? 'failure' : undefined}
            />
            <button
              type="button"
              aria-label={showNew ? '비밀번호 숨기기' : '비밀번호 보기'}
              onClick={() => setShowNew(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* 새 비밀번호 확인 */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="confirmPassword" value="새 비밀번호 확인" />
          </div>
          <div className="relative with-eye">
            <TextInput
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="새 비밀번호를 한번 더 입력해주세요"
              required
              autoComplete="new-password"
              onChange={e => {
                setConfirmPassword(e.target.value);
                setPasswordError('');
              }}
              color={passwordError ? 'failure' : undefined}
              helperText={passwordError || undefined}
            />
            <button
              type="button"
              aria-label={showConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
              onClick={() => setShowConfirm(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button className="mt-10 mb-10" color="dark" type="submit">
          변경하기
        </Button>
      </form>
    </div>
  );
};

export default LoggedInPassword;
