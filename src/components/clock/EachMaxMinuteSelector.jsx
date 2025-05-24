import React from 'react';

const EachMaxMinuteSelector = ({ value, onChange }) => {
  const options = Array.from({ length: 10 }, (_, i) => (i + 1) * 30); // 30 ~ 300

  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="border rounded px-3 py-2 min-w-[80px] text-base leading-tight">
      {options.map(minute => (
        <option key={minute} value={minute}>
          {minute}분
        </option>
      ))}
    </select>
  );
};

export default EachMaxMinuteSelector;
