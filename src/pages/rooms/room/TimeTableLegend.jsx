import React from 'react';

import { SLOT_LABEL, SLOT_PALETTE } from './slotPalette';

const ORDER = ['free', 'selected', 'reserved', 'past', 'closed'];

const TimeTableLegend = () => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 pt-6 md:px-4">
    {ORDER.map(status => {
      const palette = SLOT_PALETTE[status];
      return (
        <div key={status} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="flex h-4 w-4 flex-none items-center justify-center rounded-sm border border-gray-300 text-[9px] text-white"
            style={{
              backgroundColor: palette.background,
              backgroundImage: palette.pattern ?? 'none',
            }}>
            {palette.mark}
          </span>
          <span className="whitespace-nowrap text-xs text-gray-800">
            {SLOT_LABEL[status]}
          </span>
        </div>
      );
    })}
  </div>
);

export default TimeTableLegend;
