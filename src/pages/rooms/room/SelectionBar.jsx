import React from 'react';
import { Button } from 'flowbite-react';
import { format } from 'date-fns';

// 고른 칸이 가로 스크롤로 화면 밖에 나가도 무엇을 골랐는지 남긴다.
const SelectionBar = ({ roomLabel, from, to, disabled, onReserve }) => {
  if (!roomLabel || !from || !to) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gray-200 bg-white px-3 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:hidden"
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}>
      <div className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
        {`${roomLabel} · ${format(from, 'HH:mm')}~${format(to, 'HH:mm')}`}
      </div>
      <Button color="dark" size="sm" disabled={disabled} onClick={onReserve}>
        예약하기
      </Button>
    </div>
  );
};

export default SelectionBar;
