import React from 'react';
import { render } from '@testing-library/react';

import TimeTableLegend from './TimeTableLegend';
import { LEGEND, LEGEND_OMITTED, SLOT_PALETTE } from './slotPalette';

describe('TimeTableLegend', () => {
  it('LEGEND 의 covers 와 LEGEND_OMITTED 를 합치면 SLOT_PALETTE 의 키와 정확히 같다', () => {
    // 상태를 새로 추가하고 범례에서 어떻게 설명할지 정하지 않으면 이 테스트가 잡는다.
    const paletteKeys = Object.keys(SLOT_PALETTE);
    const coveredKeys = LEGEND.flatMap(entry => entry.covers);
    const explainedKeys = [...coveredKeys, ...LEGEND_OMITTED];

    expect(new Set(explainedKeys)).toEqual(new Set(paletteKeys));
    expect(explainedKeys).toHaveLength(paletteKeys.length);
  });

  it('범례 항목마다 라벨 텍스트가 한 번씩 나온다', () => {
    const { getAllByText } = render(<TimeTableLegend />);

    LEGEND.forEach(({ label }) => {
      expect(getAllByText(label)).toHaveLength(1);
    });
  });
});
