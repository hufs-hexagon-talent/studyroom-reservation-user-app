import React, { useLayoutEffect, useRef } from 'react';
import { Button } from 'flowbite-react';
import { format } from 'date-fns';

// 고른 칸이 가로 스크롤로 화면 밖에 나가도 무엇을 골랐는지 남긴다.
const SelectionBar = ({ roomLabel, from, to, disabled, onReserve }) => {
  const barRef = useRef(null);

  // fixed 요소라 페이지 흐름에서 빠져 있다. 자기 높이만큼 문서 아래에 자리를 잡아
  // 푸터가 가려지지 않게 한다. 실제 높이를 재므로 safe-area 도 함께 계산된다.
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return undefined;
    document.body.style.paddingBottom = `${el.offsetHeight}px`;
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [roomLabel, from, to]);

  if (!roomLabel || !from || !to) return null;

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gray-200 bg-white px-3 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:hidden"
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}>
      <div className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
        {`${roomLabel} · ${format(from, 'HH:mm')}~${format(to, 'HH:mm')}`}
      </div>
      <Button
        color="dark"
        size="sm"
        className="min-h-[44px]"
        disabled={disabled}
        onClick={onReserve}>
        예약하기
      </Button>
    </div>
  );
};

export default SelectionBar;
