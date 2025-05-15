import React from 'react';

const pad = n => n.toString().padStart(2, '0');

const TimePicker = ({ value, onChange }) => {
  const [hour, minute] = value?.split(':') ?? ['00', '00'];

  const update = (h, m) => {
    const time = `${pad(h)}:${pad(m)}:00`; // 초는 항상 '00'으로 고정
    onChange(time);
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        value={hour}
        onChange={e => update(e.target.value, minute)}
        className="border rounded px-2 py-1">
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={pad(i)}>
            {pad(i)}
          </option>
        ))}
      </select>
      :
      <select
        value={minute}
        onChange={e => update(hour, e.target.value)}
        className="border rounded px-2 py-1">
        {['00', '30'].map(min => (
          <option key={min} value={min}>
            {min}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;
