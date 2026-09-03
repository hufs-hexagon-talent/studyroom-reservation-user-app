import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import SelectionBar from './SelectionBar';

const props = (over = {}) => ({
  roomLabel: '306-1',
  from: new Date('2026-09-04T17:30:00'),
  to: new Date('2026-09-04T18:30:00'),
  disabled: false,
  onReserve: jest.fn(),
  ...over,
});

describe('SelectionBar', () => {
  it('선택이 없으면 아무것도 렌더하지 않는다', () => {
    const { container } = render(<SelectionBar {...props({ from: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('호실과 시간을 보여준다', () => {
    const { getByText } = render(<SelectionBar {...props()} />);
    expect(getByText('306-1 · 17:30~18:30')).toBeInTheDocument();
  });

  it('예약하기를 누르면 onReserve 가 불린다', () => {
    const onReserve = jest.fn();
    const { getByRole } = render(<SelectionBar {...props({ onReserve })} />);
    fireEvent.click(getByRole('button', { name: '예약하기' }));
    expect(onReserve).toHaveBeenCalledTimes(1);
  });

  it('disabled 면 버튼이 잠긴다', () => {
    const { getByRole } = render(<SelectionBar {...props({ disabled: true })} />);
    expect(getByRole('button', { name: '예약하기' })).toBeDisabled();
  });
});
