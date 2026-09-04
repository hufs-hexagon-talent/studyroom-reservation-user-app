import {
  GUTTER_PX,
  LEGEND_GUTTER_CLASS,
  TABLE_GUTTER_SX,
  TAILWIND_PX,
} from './tableGutter';

describe('표와 범례의 좌우 여백', () => {
  it('표의 sx 값과 GUTTER_PX 가 같은 여백을 가리킨다', () => {
    expect(TABLE_GUTTER_SX.xs).toBe(`${GUTTER_PX.xs}px`);
    expect(TABLE_GUTTER_SX.md).toBe(`${GUTTER_PX.md}px`);
  });

  it('범례의 Tailwind 클래스가 표와 같은 여백을 가리킨다', () => {
    // 범례가 표와 44px 어긋나 있던 회귀를 막는다.
    const [base, mdClass] = LEGEND_GUTTER_CLASS.split(' ');
    expect(TAILWIND_PX[base]).toBe(GUTTER_PX.xs);
    expect(TAILWIND_PX[mdClass.replace('md:', '')]).toBe(GUTTER_PX.md);
  });
});
