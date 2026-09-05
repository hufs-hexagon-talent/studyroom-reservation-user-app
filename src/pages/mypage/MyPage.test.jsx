import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useMyInfo } from '../../api/user.api';
import { useLatestReservation } from '../../api/reservation.api';

import MyPage from './MyPage';

jest.mock('../../api/user.api', () => ({
  useMyInfo: jest.fn(),
}));
jest.mock('../../api/reservation.api', () => ({
  useLatestReservation: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  useMyInfo.mockReturnValue({
    data: { name: '홍길동', serial: '202512345', email: 'a@hufs.ac.kr' },
  });
  useLatestReservation.mockReturnValue({ data: [] });
});

// Notion 폼을 새 창으로 열던 자리를 인앱 화면 이동으로 바꿨다.
// window.open 이 다시 호출되면 회귀다.
describe('MyPage 문의 및 건의', () => {
  it('1:1 문의를 누르면 목록 화면으로 이동하고 창을 새로 열지 않는다', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
    render(<MyPage />);

    fireEvent.click(screen.getByText('1:1 문의'));

    expect(mockNavigate).toHaveBeenCalledWith('/inquiry');
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  // 목록(/inquiry)이 허브다. 접수는 목록의 "문의하기" 버튼으로 한다.
  it('문의하기·내 문의 항목은 더 이상 없다', () => {
    render(<MyPage />);

    expect(screen.queryByText('문의하기')).toBeNull();
    expect(screen.queryByText('내 문의')).toBeNull();
    expect(screen.getByText('문의 및 건의')).toBeInTheDocument();
  });

  it('정정 요청·의견 보내기 같은 Notion 항목은 더 이상 없다', () => {
    render(<MyPage />);

    expect(screen.queryByText('정정 요청')).toBeNull();
    expect(screen.queryByText('의견 보내기')).toBeNull();
  });
});
