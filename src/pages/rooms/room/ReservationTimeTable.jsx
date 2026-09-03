import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { parse } from 'date-fns';

import { SLOT_PALETTE } from './slotPalette';
import { getSlotState } from './slotState';

const ReservationTimeTable = ({
  rooms,
  times,
  selectedDate,
  now,
  selection,
  onCellClick,
}) => (
  <TableContainer
    sx={{
      overflowX: 'auto',
      marginTop: '20px',
      // sticky 기준점이 어긋나지 않게 padding 대신 margin 으로 띄운다
      width: 'calc(100% - 60px)',
      marginLeft: '60px',
    }}>
    <Table>
      <TableHead sx={{ borderBottom: 'none' }}>
        <TableRow>
          <TableCell
            align="center"
            width={100}
            sx={{ position: 'sticky', left: 0, zIndex: 3, backgroundColor: '#fff' }}
          />
          {times.map((time, timeIndex) => (
            <TableCell
              key={timeIndex}
              align="center"
              width={200}
              className="relative"
              sx={{ borderRight: 'none', borderTop: 'none', borderBottom: 'none' }}>
              <div style={{ width: 20, height: 30 }}>
                <span className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                  {time}
                </span>
              </div>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rooms.map((room, i) => (
          <TableRow key={i}>
            <TableCell
              sx={{
                px: 2,
                py: 2,
                borderLeft: '1px solid #ccc',
                whiteSpace: 'nowrap',
                position: 'sticky',
                left: 0,
                zIndex: 2,
                backgroundColor: '#fff',
              }}>
              {`${room.roomName}-${room.partitionNumber}`}
            </TableCell>
            {times.map((time, timeIndex) => {
              if (timeIndex === times.length - 1) return null;

              const slotStart = parse(
                `${selectedDate} ${time}`,
                'yyyy-MM-dd HH:mm',
                new Date(),
              );
              const state = getSlotState({ slotStart, now, room, selection });

              return (
                <TableCell
                  key={timeIndex}
                  onClick={() => onCellClick(room, timeIndex, state)}
                  className={state.status === 'selected' ? 'selected' : ''}
                  style={{
                    opacity: state.outOfExtendRange ? 0.4 : 1,
                    backgroundColor: SLOT_PALETTE[state.status].background,
                    borderRight: '1px solid #ccc',
                    borderLeft: '1px solid #ccc',
                    borderTop: '1px solid #ccc',
                    borderBottom: '1px solid #ccc',
                    cursor: state.selectable ? 'pointer' : 'not-allowed',
                  }}
                />
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ReservationTimeTable;
