import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import TimePicker from './TimePicker';

// 시 select 가 먼저, 분 select 가 뒤에 온다.
const hourSelect = () => screen.getAllByRole('combobox')[0];
const minuteSelect = () => screen.getAllByRole('combobox')[1];

describe('TimePicker', () => {
  it('격자 밖 값을 감추지 않고 그대로 보여주고 경고를 붙인다', () => {
    render(<TimePicker value="23:59:59" onChange={jest.fn()} />);

    // option 이 없으면 select 가 빈칸이 되어 관리자가 저장된 값을 못 본다
    expect(minuteSelect()).toHaveValue('59');
    expect(screen.getByText(/30분 단위가 아니/)).toBeInTheDocument();
  });

  it('시만 바꾸면 격자 밖 분을 조용히 고치지 않는다', () => {
    const onChange = jest.fn();
    render(<TimePicker value="23:59:59" onChange={onChange} />);

    fireEvent.change(hourSelect(), { target: { value: '22' } });

    expect(onChange).toHaveBeenCalledWith('22:59:00');
  });

  it('정정은 버튼을 눌렀을 때만 일어난다', () => {
    const onChange = jest.fn();
    render(<TimePicker value="23:59:59" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '23:30 로 맞추기' }));

    expect(onChange).toHaveBeenCalledWith('23:30:00');
  });

  it('격자에 맞는 값에는 경고도 정정 버튼도 없다', () => {
    render(<TimePicker value="09:30:00" onChange={jest.fn()} />);

    expect(screen.queryByText(/30분 단위가 아니/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('값이 문자열이 아니어도 렌더 중 죽지 않는다', () => {
    // 정책 조회가 끝나기 전 부모 상태가 Date 이던 시절 화면이 통째로 하얘졌다
    expect(() =>
      render(<TimePicker value={new Date()} onChange={jest.fn()} />),
    ).not.toThrow();

    expect(hourSelect()).toHaveValue('00');
    expect(minuteSelect()).toHaveValue('00');
  });

  it('빈 문자열에서 시를 바꿔도 죽지 않는다', () => {
    const onChange = jest.fn();
    render(<TimePicker value="" onChange={onChange} />);

    fireEvent.change(hourSelect(), { target: { value: '05' } });

    expect(onChange).toHaveBeenCalledWith('05:00:00');
  });
});
