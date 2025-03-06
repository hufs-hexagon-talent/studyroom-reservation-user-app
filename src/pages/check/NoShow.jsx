import React, { useState } from 'react';
import { Button as MuiButton, Popover, Typography } from '@mui/material';
import { fetchBlockedPeriod } from '../../api/user.api';
import { useNoShow } from '../../api/reservation.api';

import { Table } from 'flowbite-react';
import { format } from 'date-fns';

const NoShow = () => {
  const { data: noShow } = useNoShow();
  const [blockedPeriod, setBlockePeriod] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMuiBtnClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClick = async e => {
    if (anchorEl) {
      // Popover이 열려있을 때
      const blockedData = await fetchBlockedPeriod();
      setBlockePeriod(blockedData);
      setAnchorEl(null); // Popover 닫기
    } else {
      // Popover이 닫혀있을 때
      setAnchorEl(e.currentTarget); // Popover 열기
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  <>
    <MuiButton
      style={{
        backgroundColor: '#002D56',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 40,
      }}
      aria-describedby={id}
      variant="contained"
      onClick={handleMuiBtnClick}>
      내 노쇼 현황
    </MuiButton>
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      onClick={handlePopoverClick}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}>
      <Typography sx={{ px: 2, py: 1 }}>
        {`* 현재 예약 취소 없이 세미나실을 방문하지 않은 횟수는 ${noShow?.noShowCount}번 입니다.`}
      </Typography>
      <Typography sx={{ px: 3 }} className="text-red-700">
        (3회 초과 시 세미나실 예약이 1개월 동안 제한 됩니다)
      </Typography>
      {blockedPeriod?.data && (
        <>
          <Typography sx={{ px: 3, py: 1 }}>
            {blockedPeriod?.data?.startBlockedDate &&
            blockedPeriod?.data?.endBlockedDate
              ? `현재 블락 기간 : ${blockedPeriod.data.startBlockedDate} ~ ${blockedPeriod.data.endBlockedDate}`
              : '블락 정보가 없습니다.'}
          </Typography>
        </>
      )}

      <div className="overflow-x-auto">
        <Table>
          <Table.Head className="text-black text-center">
            <Table.HeadCell>출석 상태</Table.HeadCell>
            <Table.HeadCell>날짜</Table.HeadCell>
            <Table.HeadCell>호실</Table.HeadCell>
            <Table.HeadCell>시작 시간</Table.HeadCell>
            <Table.HeadCell>종료 시간</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {noShow?.reservationList.reservationInfoResponses.map(
              (reservation, index) => (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {reservation.reservationState === 'NOT_VISITED'
                      ? '미출석'
                      : ''}
                  </Table.Cell>
                  <Table.Cell>
                    {format(
                      new Date(reservation.reservationStartTime),
                      'yyyy-MM-dd',
                    )}
                  </Table.Cell>
                  <Table.Cell>{`${reservation.roomName}-${reservation.partitionNumber}`}</Table.Cell>
                  <Table.Cell>
                    {format(reservation.reservationStartTime, 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    {format(reservation.reservationEndTime, 'HH:mm')}
                  </Table.Cell>
                </Table.Row>
              ),
            )}
          </Table.Body>
        </Table>
      </div>
    </Popover>
  </>;
};

export default NoShow;
