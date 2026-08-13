import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';

import {
  clearSessionExpiredHandler,
  setSessionExpiredHandler,
} from '../api/session';
import useAuth from '../hooks/useAuth';

/**
 * 토큰 갱신 실패를 감지해 로그인 화면으로 되돌린다.
 *
 * axios 인터셉터는 React 트리 밖에 있어 라우터·상태에 직접 접근할 수 없으므로,
 * 이 컴포넌트가 마운트되는 동안 처리 함수를 등록해 둔다.
 */
const SessionExpiryWatcher = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  // 등록은 한 번만 하되 항상 최신 navigate/logout 을 쓰도록 ref 로 감싼다
  const onSessionExpired = useRef(() => {});
  onSessionExpired.current = () => {
    logout();
    openSnackbar('로그인이 만료되었습니다. 다시 로그인해 주세요.', 4000);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setSessionExpiredHandler(() => onSessionExpired.current());
    return () => clearSessionExpiredHandler();
  }, []);

  return null;
};

export default SessionExpiryWatcher;
