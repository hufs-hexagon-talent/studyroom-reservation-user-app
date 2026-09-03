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
  <>
    <TableContainer
      sx={{
        overflowX: 'auto',
        marginTop: '20px',
        // 모바일에서는 좌우 여백을 최소로 두고 폭을 전부 쓴다
        width: { xs: 'calc(100% - 24px)', md: 'calc(100% - 60px)' },
        marginLeft: { xs: '12px', md: '60px' },
      }}>
      <Table>
        <TableHead sx={{ borderBottom: 'none' }}>
          <TableRow>
            <TableCell
              data-sticky-col
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 3,
                backgroundColor: '#fff',
                border: 'none',
                padding: 0,
                width: { xs: 52, md: 100 },
                minWidth: { xs: 52, md: 100 },
              }}
            />
            {times.slice(0, -1).map((time, timeIndex) => (
              <TableCell
                key={timeIndex}
                data-time-index={timeIndex}
                align="center"
                sx={{
                  border: 'none',
                  padding: { xs: '6px 0', md: '10px 0' },
                  width: { xs: 44, md: 52 },
                  minWidth: { xs: 44, md: 52 },
                  fontSize: { xs: '10.5px', md: '12px' },
                  color: '#555',
                  whiteSpace: 'nowrap',
                }}>
                {time}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.map((room, i) => (
            <TableRow key={i}>
              <TableCell
                sx={{
                  px: { xs: 0.75, md: 2 },
                  py: { xs: 1, md: 2 },
                  border: '1px solid #ccc',
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  backgroundColor: '#fff',
                  fontSize: { xs: '11.5px', md: '14px' },
                  width: { xs: 52, md: 100 },
                  minWidth: { xs: 52, md: 100 },
                }}>
                {`${room.roomName}-${room.partitionNumber}`}
              </TableCell>
              {times.slice(0, -1).map((time, timeIndex) => {
                const slotStart = parse(
                  `${selectedDate} ${time}`,
                  'yyyy-MM-dd HH:mm',
                  new Date(),
                );
                const state = getSlotState({ slotStart, now, room, selection });
                const palette = SLOT_PALETTE[state.status];

                return (
                  <TableCell
                    key={timeIndex}
                    data-time-index={timeIndex}
                    onClick={() => onCellClick(room, timeIndex, state)}
                    className={state.status === 'selected' ? 'selected' : ''}
                    sx={{
                      padding: 0,
                      width: { xs: 44, md: 52 },
                      minWidth: { xs: 44, md: 52 },
                      height: { xs: 48, md: 53 },
                      opacity: state.outOfExtendRange ? 0.4 : 1,
                      backgroundColor: palette.background,
                      backgroundImage: palette.pattern ?? 'none',
                      border: '1px solid #ccc',
                      cursor: state.selectable ? 'pointer' : 'not-allowed',
                      textAlign: 'center',
                      color: '#fff',
                      fontSize: '11px',
                    }}>
                    {palette.mark}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <div className="mt-1 pr-3 text-right text-xs text-gray-500 md:pr-16">
      {`${times[times.length - 1]} 운영 종료`}
    </div>
  </>
);

export default ReservationTimeTable;
