import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';

import RouterComponent from './router';
import { authState } from './hooks/authState';

// 라우터가 보는 것은 useMe 결과와 로그인 상태뿐이다. router.passwordGuard.test.jsx /
// router.qrcheckRoute.test.jsx 의 목킹 규약을 그대로 따른다.
// 문의 화면 목 문자열은 제품에 없는 값을 써서 다른 화면과 헷갈리지 않게 한다.
jest.mock('react-simple-snackbar', () => ({
  useSnackbar: () => [jest.fn(), jest.fn()],
}));
jest.mock('./api/user.api', () => ({
  useMe: () => global.__me,
  isAuthError: () => true,
  useServiceRole: () => ({ data: global.__me?.data?.serviceRole }),
}));
jest.mock('./pages/inquiry/MyInquiries', () => () => (
  <div>MYINQUIRIES_MOUNTED</div>
));
jest.mock('./pages/inquiry/InquiryForm', () => () => (
  <div>INQUIRYFORM_MOUNTED</div>
));
jest.mock('./pages/rooms/room/RoomPage', () => () => <div>예약 현황 화면</div>);
jest.mock('./components/navbar/NavigationBar', () => () => null);
jest.mock('./components/footer/Footer', () => () => null);
jest.mock('./components/SessionExpiryWatcher', () => () => null);
jest.mock('./components/ConnectionError', () => () => <div>연결 오류</div>);

const renderAt = (path, { isAuthenticated = true } = {}) => {
  window.history.pushState({}, '', path);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <RecoilRoot
      initializeState={snap =>
        snap.set(authState, { isAuthenticated })
      }>
      <QueryClientProvider client={queryClient}>
        <RouterComponent />
      </QueryClientProvider>
    </RecoilRoot>,
  );
};

const me = serviceRole => ({
  data: { serviceRole, isPasswordChangeRequired: false },
  status: 'success',
  error: null,
  refetch: jest.fn(),
});

const loggedOutMe = () => ({
  data: undefined,
  status: 'error',
  error: { response: { status: 401 } },
  refetch: jest.fn(),
});

describe('/inquiry 라우트', () => {
  test('일반 학생은 문의 화면에 도달한다', async () => {
    global.__me = me('USER');
    renderAt('/inquiry');
    await waitFor(() =>
      expect(screen.getByText('MYINQUIRIES_MOUNTED')).toBeInTheDocument(),
    );
  });

  test('제한된(BLOCKED) 학생도 문의 화면에 도달한다', async () => {
    global.__me = me('BLOCKED');
    renderAt('/inquiry');
    await waitFor(() =>
      expect(screen.getByText('MYINQUIRIES_MOUNTED')).toBeInTheDocument(),
    );
  });

  test('관리자도 문의 화면에 도달한다', async () => {
    global.__me = me('ADMIN');
    renderAt('/inquiry');
    await waitFor(() =>
      expect(screen.getByText('MYINQUIRIES_MOUNTED')).toBeInTheDocument(),
    );
  });

  test('관리실(RESIDENT) 계정은 문의 화면에 도달하지 못하고 홈으로 되돌아간다', async () => {
    global.__me = me('RESIDENT');
    renderAt('/inquiry');
    await waitFor(() =>
      expect(screen.getByText('예약 현황 화면')).toBeInTheDocument(),
    );
    expect(screen.queryByText('MYINQUIRIES_MOUNTED')).toBeNull();
  });

  test('로그인하지 않으면 문의 화면에 도달하지 못하고 홈으로 되돌아간다', async () => {
    global.__me = loggedOutMe();
    renderAt('/inquiry', { isAuthenticated: false });
    await waitFor(() =>
      expect(screen.getByText('예약 현황 화면')).toBeInTheDocument(),
    );
    expect(screen.queryByText('MYINQUIRIES_MOUNTED')).toBeNull();
  });
});
