import React, { useState, useRef } from 'react';

export default function ClockRangePicker() {
  const [startAngle, setStartAngle] = useState(null);
  const [endAngle, setEndAngle] = useState(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [startMeridiem, setStartMeridiem] = useState('AM'); // 오전/오후
  const [endMeridiem, setEndMeridiem] = useState('AM'); // 오전/오후

  const svgRef = useRef(null);

  const handleClick = e => {
    const angle = calculateAngle(e);
    if (isSelectingStart) {
      setStartAngle(angle);
      setEndAngle(null);
    } else {
      setEndAngle(angle);
    }
    setIsSelectingStart(!isSelectingStart);
  };

  const calculateAngle = e => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    const radians = Math.atan2(y, x);
    const degrees = (radians * (180 / Math.PI) + 450) % 360; // 여기 수정!!
    return degrees;
  };

  const describeArc = (start, end) => {
    const radius = 100;
    const startRadians = (start - 90) * (Math.PI / 180);
    const endRadians = (end - 90) * (Math.PI / 180);

    const startX = 150 + radius * Math.cos(startRadians);
    const startY = 150 + radius * Math.sin(startRadians);
    const endX = 150 + radius * Math.cos(endRadians);
    const endY = 150 + radius * Math.sin(endRadians);

    const largeArcFlag = (end - start + 360) % 360 <= 180 ? '0' : '1';

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  const angleToTime = (angle, meridiem) => {
    let totalMinutes = (angle / 360) * 720;
    totalMinutes = Math.round(totalMinutes / 30) * 30;

    let hours = Math.floor(totalMinutes / 60) % 12 || 12;
    const minutes = totalMinutes % 60;

    // 오전/오후에 따라 시 수정
    if (meridiem === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours}시 ${minutes === 0 ? '00' : minutes}분`;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-2xl font-bold">시간 구간 선택</h2>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setStartMeridiem('AM')}
          className={startMeridiem === 'AM' ? 'font-bold' : ''}>
          오전
        </button>
        <button
          onClick={() => setStartMeridiem('PM')}
          className={startMeridiem === 'PM' ? 'font-bold' : ''}>
          오후
        </button>
      </div>

      <svg
        ref={svgRef}
        width="300"
        height="300"
        onClick={handleClick}
        className="bg-white cursor-pointer rounded-full shadow-lg border border-gray-300">
        <circle
          cx="150"
          cy="150"
          r="100"
          stroke="black"
          strokeWidth="2"
          fill="none"
        />
        {/* 숫자 표시 */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const x = 150 + 85 * Math.cos(angle - Math.PI / 2);
          const y = 150 + 85 * Math.sin(angle - Math.PI / 2);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold">
              {i === 0 ? 12 : i}
            </text>
          );
        })}

        {/* 선택된 Arc */}
        {startAngle !== null && endAngle !== null && (
          <path
            d={describeArc(startAngle, endAngle)}
            stroke="skyblue"
            strokeWidth="10"
            fill="none"
          />
        )}
      </svg>

      {/* 선택한 시간 출력 */}
      {startAngle !== null && (
        <div className="text-lg font-medium space-y-1">
          <div>시작 시간: {angleToTime(startAngle)}</div>
          {endAngle !== null && <div>종료 시간: {angleToTime(endAngle)}</div>}
        </div>
      )}
    </div>
  );
}
