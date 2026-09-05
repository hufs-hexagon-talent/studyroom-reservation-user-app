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

    // 문의 안내는 기본으로 접혀 있는 "계정" 항목 안에 있다. 지금 Accordion 은 닫힌 패널을
    // grid-rows-[0fr] 로만 감춰 접근성 트리에 남기지만, 거기에 기대면 사용자가 밟지 않는
    // 경로를 검증하게 된다. 실제 순서대로 트리거부터 연다.
    fireEvent.click(screen.getByRole('button', { name: /계정/ }));

    const button = screen.getByRole('button', { name: '1:1 문의' });
    expect(button.parentElement).toHaveTextContent(
      '마이페이지 > 1:1 문의(로그인 후), 또는 이메일 ces@hufs.ac.kr',
    );

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
    expect(screen.queryByText(/마이페이지 > 문의하기/)).toBeNull();
  });
});
