import React from 'react';
import SnackbarProvider, { useSnackbar } from 'react-simple-snackbar';
import { render, screen } from '@testing-library/react';

// index.css 의 [class*='snackbar-wrapper'] 규칙이 계속 먹으려면 라이브러리가 그 클래스명
// 조각을 유지해야 한다. 버전을 올릴 때 이 테스트가 잡는다.
//
// useSnackbar 가 돌려주는 open 은 매 렌더 새 함수다(RoomPage 가 ref 로 안정화해 둔 이유와
// 같음). open 을 호출하면 SnackbarProvider 상태가 바뀌어 다시 렌더되고, 그때마다 새 open 이
// 나온다 — 이 open 을 effect 의 의존성에 넣으면 열기를 반복하는 무한 루프가 된다. 여기서는
// 마운트 시 한 번만 열면 되므로 의존성 배열을 비워 최초 렌더에서만 실행한다.
const Trigger = () => {
  const [open] = useSnackbar({ position: 'top-right' });
  React.useEffect(() => {
    open('테스트 안내');
  }, []);
  return null;
};

describe('스낵바 레이어', () => {
  it('토스트 래퍼 클래스에 snackbar-wrapper 조각이 들어 있다', () => {
    const { container } = render(
      <SnackbarProvider>
        <Trigger />
      </SnackbarProvider>,
    );

    expect(screen.getByText('테스트 안내')).toBeInTheDocument();

    const wrapper = container.querySelector("[class*='snackbar-wrapper']");
    expect(wrapper).not.toBeNull();
  });
});
