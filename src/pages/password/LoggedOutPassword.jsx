import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoggedOutPassword } from '../../api/user.api';
import { Button, Label, TextInput } from 'flowbite-react';
import { useCustomSnackbars } from '../../components/snackbar/SnackBar';
import { resetPasswordErrorMessage } from './emailVerifyMessages';

const LoggedOutPassword = () => {
  const { mutateAsync: doPasswordChange } = useLoggedOutPassword();
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [changing, setChanging] = useState(false);
  // 상태는 다음 렌더에서야 바뀐다. 같은 tick 의 두 번째 탭까지 막으려면 동기 값이어야 한다.
  const changingRef = useRef(false);
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();
  const token = sessionStorage.getItem('pwResetToken');
  const navigate = useNavigate();

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
    if (newPw === '' || confirmNewPw === '') {
      openErrorSnackbar('비밀번호를 입력한 후 변경하기를 눌러주세요', 2500);
      return;
    }
    // 더블탭하면 같은 토큰으로 두 번 보내고, 두 번째 응답이 성공 안내를 실패 안내로 덮는다
    if (changingRef.current) return;
    changingRef.current = true;
    setChanging(true);
    try {
      await doPasswordChange({ token: token, newPassword: newPw });
      // 한 번 쓴 재설정 토큰은 지운다. 남겨 두면 재설정 화면이 계속 열린다.
      sessionStorage.removeItem('pwResetToken');
      navigate('/login');
      openSuccessSnackbar('비밀번호가 성공적으로 변경되었습니다.', 2500);
    } catch (error) {
      // 서버 원문은 띄우지 않는다. 재설정 토큰이 만료됐으면 토큰을 지우고
      // 이메일 인증부터 다시 하게 보낸다. 남겨 두면 재설정 화면이 계속 열린다.
      const { message, reauth } = resetPasswordErrorMessage(error);
      openErrorSnackbar(message, 2500);
      if (reauth) {
        sessionStorage.removeItem('pwResetToken');
        navigate('/email');
      }
    } finally {
      changingRef.current = false;
      setChanging(false);
    }
  };
  //todo : 비밀번호 보이게 하는거
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
            disabled={changing}
            type="submit">
            {changing ? '변경 중...' : '변경하기'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoggedOutPassword;
