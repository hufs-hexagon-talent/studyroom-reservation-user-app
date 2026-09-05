import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Notice from './notice';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Notice 문의 안내', () => {
  it('1:1 문의를 누르면 문의 목록으로 이동하고, 로그인 안내는 버튼 밖에 남는다', () => {
    render(<Notice />);

    const button = screen.getByRole('button', { name: '1:1 문의' });
    expect(button.parentElement).toHaveTextContent(
      '마이페이지 > 1:1 문의(로그인 후), 또는 이메일 ces@hufs.ac.kr',
    );

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
    expect(screen.queryByText(/마이페이지 > 문의하기/)).toBeNull();
  });
});
