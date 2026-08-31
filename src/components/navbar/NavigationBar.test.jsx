import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import NavigationBar from './NavigationBar';
import { authState } from '../../hooks/authState';

// user.api 를 통째로 목킹하면 useServiceRole 이 내부에서 useMe() 를 부르지 않으므로
// QueryClientProvider 가 필요 없다. Link·useNavigate 때문에 라우터는 있어야 하고,
// useAuth 가 useRecoilState 를 쓰므로 RecoilRoot 가 바깥이어야 한다.
const mockRole = jest.fn();
jest.mock('../../api/user.api', () => ({
  useServiceRole: () => ({ data: mockRole() }),
}));

const renderAs = role => {
  mockRole.mockReturnValue(role);
  return render(
    <RecoilRoot
      initializeState={snap => snap.set(authState, { isAuthenticated: true })}>
      <MemoryRouter>
        <NavigationBar />
      </MemoryRouter>
    </RecoilRoot>,
  );
};

describe('NavigationBar 출석 체크 링크', () => {
  test('관리실 계정에게는 출석 체크 링크가 보인다', () => {
    renderAs('RESIDENT');
    expect(screen.getByRole('link', { name: '출석 체크' })).toHaveAttribute(
      'href',
      '/qrcheck',
    );
  });

  // 텍스트가 아니라 href 로 본다. 문구만 바꾼 링크가 되살아나도 잡아야 한다.
  test('관리자에게는 /qrcheck 로 가는 링크 자체가 없다', () => {
    const { container } = renderAs('ADMIN');
    expect(container.querySelector('a[href="/qrcheck"]')).toBeNull();
  });
});
