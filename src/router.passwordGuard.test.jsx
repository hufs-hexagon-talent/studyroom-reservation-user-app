import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';

import RouterComponent from './router';
import { authState } from './hooks/authState';

// 라우터가 보는 것은 useMe 결과와 로그인 상태뿐이다. 화면 구성은 무겁고 이 테스트의 대상이 아니라
// 판정에 쓰이는 훅만 대체하고, 도달 여부는 각 화면의 고유 문구로 확인한다.
jest.mock('react-simple-snackbar', () => ({
  useSnackbar: () => [jest.fn(), jest.fn()],
}));
jest.mock('./api/user.api', () => ({
  useMe: () => global.__me,
  isAuthError: () => false,
  useServiceRole: () => ({ data: 'USER' }),
}));
jest.mock('./pages/password/LoggedInPassword', () => () => (
  <div>비밀번호 변경 화면</div>
));
jest.mock('./pages/rooms/room/RoomPage', () => () => <div>예약 현황 화면</div>);
jest.mock('./pages/notice/notice', () => () => <div>이용 규칙 화면</div>);
jest.mock('./pages/login/LoginPage', () => () => <div>로그인 화면</div>);
jest.mock('./components/navbar/NavigationBar', () => () => null);
jest.mock('./components/footer/Footer', () => () => null);
jest.mock('./components/SessionExpiryWatcher', () => () => null);
jest.mock('./components/ConnectionError', () => () => <div>연결 오류</div>);

const renderAt = path => {
  window.history.pushState({}, '', path);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <RecoilRoot
      initializeState={snap => snap.set(authState, { isAuthenticated: true })}>
      <QueryClientProvider client={queryClient}>
        <RouterComponent />
      </QueryClientProvider>
    </RecoilRoot>,
  );
};

const me = extra => ({
  data: { serviceRole: 'USER', ...extra },
  status: 'success',
  error: null,
  refetch: jest.fn(),
});

describe('기본 비밀번호 강제 변경', () => {
  test('비밀번호 변경이 필요하면 다른 주소로 들어와도 변경 화면으로 보낸다', async () => {
    global.__me = me({ isPasswordChangeRequired: true });
    renderAt('/check');
    await waitFor(() =>
      expect(screen.getByText('비밀번호 변경 화면')).toBeInTheDocument(),
    );
  });

  test('변경이 필요 없으면 원래 화면이 그대로 열린다', async () => {
    global.__me = me({ isPasswordChangeRequired: false });
    renderAt('/');
    await waitFor(() =>
      expect(screen.getByText('예약 현황 화면')).toBeInTheDocument(),
    );
  });

  test('잠긴 상태에서도 이용 규칙은 볼 수 있다', async () => {
    global.__me = me({ isPasswordChangeRequired: true });
    renderAt('/notice');
    await waitFor(() =>
      expect(screen.getByText('이용 규칙 화면')).toBeInTheDocument(),
    );
  });

  test('잠긴 이유를 화면이 설명한다', async () => {
    global.__me = me({ isPasswordChangeRequired: true });
    renderAt('/check');
    await waitFor(() =>
      expect(
        screen.getByText(/비밀번호가 학번 그대로입니다/),
      ).toBeInTheDocument(),
    );
  });

  // 세션이 끊긴 직후에는 화면 상태가 아직 로그인으로 남아 있다.
  // 그 렌더에서도 /login 이 매칭돼야 만료 안내를 본 학생이 홈으로 튕기지 않는다.
  test('로그인 상태 렌더에서도 로그인 화면 경로가 살아 있다', async () => {
    global.__me = me({ isPasswordChangeRequired: false });
    renderAt('/login');
    await waitFor(() =>
      expect(screen.getByText('로그인 화면')).toBeInTheDocument(),
    );
  });

  test('서버가 판정을 안 내려주면 평소대로 동작한다', async () => {
    global.__me = me({});
    renderAt('/');
    await waitFor(() =>
      expect(screen.getByText('예약 현황 화면')).toBeInTheDocument(),
    );
  });
});
