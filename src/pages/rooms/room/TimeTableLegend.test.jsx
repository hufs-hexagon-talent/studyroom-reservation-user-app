import React from 'react';
import { render } from '@testing-library/react';

import TimeTableLegend from './TimeTableLegend';
import { SLOT_LABEL, SLOT_PALETTE } from './slotPalette';

describe('TimeTableLegend', () => {
  it('팔레트에 있는 상태마다 정확히 하나의 범례 항목이 있다', () => {
    // TimeTableLegend 내부의 ORDER 가 SLOT_PALETTE 의 키를 빠뜨리면 항목 수가
    // SLOT_PALETTE 의 키 수보다 줄어들고, 그 상태의 라벨도 화면에서 사라진다.
    // ORDER 에 같은 키가 중복돼도 해당 라벨이 두 번 나와 getAllByText 검증에서 잡힌다.
    const paletteKeys = Object.keys(SLOT_PALETTE);
    const { container, getAllByText } = render(<TimeTableLegend />);

    const items = container.firstChild.children;
    expect(items.length).toBe(paletteKeys.length);

    paletteKeys.forEach(status => {
      expect(getAllByText(SLOT_LABEL[status])).toHaveLength(1);
    });
  });
});
