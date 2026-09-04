// 표와 범례는 좌우 여백이 같아야 한다. 표는 MUI sx, 범례는 Tailwind class 라
// 표현이 달라 값이 따로 놀기 쉽다(실제로 범례 16px / 표 60px 로 44px 어긋나 있었다).
// 두 표현을 여기 모으고 tableGutter.test.js 가 서로 어긋나면 실패하게 한다.

// 좌우 여백의 실제 픽셀 값.
export const GUTTER_PX = { xs: 12, md: 24 };

// 표 wrapper 가 쓰는 MUI sx 값.
export const TABLE_GUTTER_SX = {
  xs: `${GUTTER_PX.xs}px`,
  md: `${GUTTER_PX.md}px`,
};

// 범례가 쓰는 Tailwind 클래스. 눈금: px-3 = 12px, px-6 = 24px.
// Tailwind 는 정적 스캔으로 클래스를 찾으므로 이 리터럴이 있어야 CSS 가 생성된다.
// TimeTableLegend.jsx 는 이 상수를 참조만 하고 px-3/md:px-6 텍스트가 없다 — 상수를 다른
// 파일로 옮기거나 tailwind.config.js content 글롭에서 .js 를 빼면 에러 없이 조용히 깨진다.
export const LEGEND_GUTTER_CLASS = 'px-3 md:px-6';

// 위 클래스가 실제로 몇 px 인지. 테스트가 GUTTER_PX 와 대조한다.
export const TAILWIND_PX = { 'px-3': 12, 'px-6': 24 };
