import React from 'react';

import {
  floorToSlot,
  isSlotAligned,
  MINUTE_OPTIONS,
  parseTimeValue,
} from './timeValue';

const pad = n => String(n).padStart(2, '0');

const TimePicker = ({ value, onChange }) => {
  // 부모가 아직 문자열을 넣지 못한 순간(정책 조회 전 초기값)에도 렌더가 죽지 않게 한다.
  const parsed = parseTimeValue(value);
  const hour = parsed?.hour ?? '00';
  const minute = parsed?.minute ?? '00';

  // 격자 밖 값(운영에 남은 23:59:59)은 자동으로 내리지 않는다. 관리자가 저장만 눌러도
  // 운영 종료가 29분 앞당겨지는 무음 변경이 되기 때문이다. 대신 아래 경고와 정정 버튼으로 드러낸다.
  const offGrid = parsed != null && !isSlotAligned(value);
  const corrected = offGrid ? floorToSlot(value) : null;

  // 매칭되는 option 이 없으면 select 는 빈칸으로 보인다. 저장된 분을 임시 option 으로 넣어
  // 관리자가 실제 값을 그대로 보게 한다.
  const minuteOptions = MINUTE_OPTIONS.includes(minute)
    ? MINUTE_OPTIONS
    : [...MINUTE_OPTIONS, minute];

  const update = (h, m) => {
    const time = `${pad(h)}:${pad(m)}:00`; // 초는 항상 '00'으로 고정
    onChange(time);
  };

  return (
    <div className="flex flex-col gap-1">
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
          {minuteOptions.map(min => (
            <option key={min} value={min}>
              {MINUTE_OPTIONS.includes(min) ? min : `${min} (30분 단위 아님)`}
            </option>
          ))}
        </select>
      </div>
      {offGrid && (
        <div className="flex flex-col items-start gap-1">
          <p className="text-xs text-red-600">
            저장된 값 {value} 는 30분 단위가 아니라 이대로는 저장되지 않습니다.
          </p>
          {corrected && (
            <button
              type="button"
              onClick={() => onChange(corrected)}
              className="text-xs text-blue-600 underline">
              {corrected.slice(0, 5)} 로 맞추기
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
