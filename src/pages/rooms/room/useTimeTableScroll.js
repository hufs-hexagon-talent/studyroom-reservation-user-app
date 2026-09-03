import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// 표를 열거나 날짜를 바꿀 때 원하는 열로 맞추고, 가장자리에 더 있는지 알린다.
const useTimeTableScroll = ({ scrollToIndex, resetKey }) => {
  const containerRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    // 값이 그대로면 이전 객체를 돌려줘 스크롤 이벤트마다 표 전체가 리렌더되지 않게 한다
    setEdges(prev =>
      prev.left === left && prev.right === right ? prev : { left, right },
    );
  }, []);

  // 칸 폭이 화면 크기마다 달라서 인덱스 x 폭으로 계산하지 않고 실제 위치를 잰다
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const target = el.querySelector(`thead [data-time-index="${scrollToIndex}"]`);
    const sticky = el.querySelector('[data-sticky-col]');
    if (target) {
      el.scrollLeft = Math.max(0, target.offsetLeft - (sticky?.offsetWidth ?? 0));
    }
    updateEdges();
  }, [scrollToIndex, resetKey, updateEdges]);

  useEffect(() => {
    const onResize = () => updateEdges();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateEdges]);

  return { containerRef, edges, handleScroll: updateEdges };
};

export default useTimeTableScroll;
