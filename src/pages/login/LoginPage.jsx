import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';
import './LoginPage.css';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useCheckPwd } from '../../api/user.api';

const LoginPage = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const { login } = useAuth();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  const { refetch: refetchCheckPwd } = useCheckPwd({ enabled: false });

  const handleLogin = async () => {
    if (!studentId || !password) {
      openErrorSnackbar('아이디와 비밀번호를 모두 입력해주세요.', 2500);
      return;
    }
    try {
      await login({ id: studentId, password });
      const { data: checkPwd } = await refetchCheckPwd();

      if (checkPwd?.isPasswordChangeRequired) {
        openErrorSnackbar(`${checkPwd?.message}`, 3000);
        navigate('/password');
      } else {
        openSuccessSnackbar('로그인 되었습니다', 1500);
        navigate('/');
      }
    } catch (error) {
      openErrorSnackbar(error.message, 2500);
    }
  };

  const handlePasword = () => navigate('/email');

  const handleKeyDown = event => {
    if (event.key === 'Enter') handleLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-2xl text-center mt-20 mb-5">로그인</div>
      <div className="flex flex-col max-w-md w-full gap-4">
        {/* 학번 */}
        <div>
          <TextInput
            id="number"
            placeholder="학번을 입력해주세요"
            onChange={e => setStudentId(e.target.value)}
            className="w-full"
            autoComplete="username"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <div className="relative w-full mt-3">
            <TextInput
              id="password"
              type={showPwd ? 'text' : 'password'}
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              onKeyDown={handleKeyDown}
              onChange={e => setPassword(e.target.value)}
              className="w-full" // 입력창 폭 고정
            />
            <button
              type="button"
              aria-label={showPwd ? '비밀번호 숨기기' : '비밀번호 보기'}
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          {/* 버튼 */}
          <Button
            id="btn"
            className="w-full mt-4 cursor-pointer text-white"
            color="dark"
            onClick={handleLogin}>
            로그인하기
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-screen pt-8 pb-10 text-sm text-gray-600 cursor-pointer">
        <span onClick={handlePasword}>비밀번호 재설정하러 가기 &gt;</span>
      </div>
    </div>
  );
};

export default LoginPage;
