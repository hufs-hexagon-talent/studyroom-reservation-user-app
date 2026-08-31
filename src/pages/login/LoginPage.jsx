import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';
import './LoginPage.css';
import { Eye, EyeOff } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();

  const handleLogin = async () => {
    // 빈 값은 서버에 보내지 않는다. 아이디 창에서 Enter 를 눌러도 폼이 제출되므로
    // 여기서 막지 않으면 빈 비밀번호 요청이 로그인 횟수 제한(분당 10회)을 소모한다.
    if (!studentId.trim() || !password) {
      openErrorSnackbar('아이디와 비밀번호를 모두 입력해 주세요.', 2500);
      return;
    }
    // 연타·더블클릭이 로그인 횟수 제한을 소진하지 않게 막는다
    if (submitting) return;
    setSubmitting(true);
    try {
      const { isPasswordChangeRequired } = await login({
        // 자동완성·복사 붙여넣기로 앞뒤 공백이 붙으면 맞는 학번도 401 이 된다
        id: studentId.trim(),
        password,
      });
      if (isPasswordChangeRequired) {
        openErrorSnackbar(
          '비밀번호 변경이 필요합니다. 변경 페이지로 이동합니다.',
          3000,
        );
        navigate('/password', { replace: true });
        return;
      } else {
        openSuccessSnackbar('로그인 되었습니다', 1500);
        navigate('/');
      }
    } catch (error) {
      openErrorSnackbar(error.message, 2500);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasword = () => navigate('/email');

  const handleSubmit = event => {
    event.preventDefault();
    handleLogin();
  };

  // Enter 를 누르고 있으면 반복 keydown 마다 submit 이 일어난다. 반복분은 무시한다.
  const handleKeyDown = event => {
    if (event.key === 'Enter' && event.repeat) event.preventDefault();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-2xl text-center mt-20 mb-5">로그인</div>
      <form
        className="flex flex-col max-w-md w-full gap-4"
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}>
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
            type="submit"
            className="w-full mt-4 cursor-pointer text-white"
            color="dark"
            disabled={submitting}>
            {submitting ? '로그인 중...' : '로그인하기'}
          </Button>
        </div>
      </form>

      <div className="flex flex-col items-center justify-center w-screen pt-8 pb-10 text-sm text-gray-600 cursor-pointer">
        <span onClick={handlePasword}>비밀번호 재설정하러 가기 &gt;</span>
      </div>
    </div>
  );
};

export default LoginPage;
