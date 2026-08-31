import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import { useRecoilState } from 'recoil';

import {
  clearSessionExpiredHandler,
  setSessionExpiredHandler,
} from '../api/session';
import { authState } from '../hooks/authState';
import { queryClient } from '../queryClient';

/**
 * 토큰 갱신 실패를 감지해 로그인 화면으로 되돌린다.
 *
 * axios 인터셉터는 React 트리 밖에 있어 라우터·상태에 직접 접근할 수 없으므로,
 * 이 컴포넌트가 마운트되는 동안 처리 함수를 등록해 둔다.
 * 로그인 여부는 화면이 들고 있는 상태로 판단한다. 인증 상태를 저장소에
 * 보관하든 안 하든 같게 동작해야 하기 때문이다.
 */
const SessionExpiryWatcher = () => {
  const [auth, setAuth] = useRecoilState(authState);
  const navigate = useNavigate();
  const [openSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  // 동시에 여러 요청이 401 이어도 한 번만 처리한다. 다시 로그인하면 풀린다.
  const handled = useRef(false);
  useEffect(() => {
    if (auth.isAuthenticated) handled.current = false;
  }, [auth.isAuthenticated]);

  // 상태를 내리는 것과 화면을 옮기는 것을 나눈다. 여기서 바로 이동하면
  // 라우터가 아직 로그인 상태로 렌더돼 있어 /login 라우트가 없고,
  // * 폴백이 주소를 / 로 덮어써 학생이 만료 안내만 보고 홈으로 튕긴다.
  const redirectPending = useRef(false);

  // 등록은 한 번만 하되 항상 최신 상태를 보도록 ref 로 감싼다
  const onSessionExpired = useRef(() => {});
  onSessionExpired.current = () => {
    // 로그인한 적 없는 상태의 401 은 무시한다
    if (!auth.isAuthenticated) return;
    if (handled.current) return;
    handled.current = true;

    setAuth({ isAuthenticated: false });
    // 만료된 계정의 조회 결과(이름·예약·출석 QR)를 메모리에 남기지 않는다
    queryClient.clear();
    openSnackbar('로그인이 만료되었습니다. 다시 로그인해 주세요.', 4000);
    redirectPending.current = true;
  };

  // 로그인 상태가 실제로 내려간 렌더 이후에 옮긴다. 그때는 /login 라우트가 있다.
  useEffect(() => {
    if (!redirectPending.current || auth.isAuthenticated) return;
    redirectPending.current = false;
    navigate('/login', { replace: true });
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    setSessionExpiredHandler(() => onSessionExpired.current());
    return () => clearSessionExpiredHandler();
  }, []);

  return null;
};

export default SessionExpiryWatcher;
