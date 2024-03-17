import React from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';

const Responsive = () => {
  const isDeskTop = useMediaQuery({ query: '(min-width : 1224px)' });
  const isBigScreen = useMediaQuery({ query: '(min-width : 1824)' });
  const isTablet = useMediaQuery({ query: '(max-width : 1224px)' });

  // 가운데 정렬을 위한 스타일 객체
  const centerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // 화면 전체 높이를 차지하도록 설정
  };

  return (
    <div style={centerStyle}>
      <div>
        <h1>Device Test!</h1>
        {isDeskTop && <p>you are a desktop</p>}
        {isBigScreen && <p>you have a huge screen</p>}
        {isTablet && <p>you are a tablet</p>}
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>항목 1</TableCell>
              <TableCell align="right">값 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>항목 2</TableCell>
              <TableCell align="right">값 2</TableCell>
            </TableRow>
            {/* 필요한 만큼 TableRow와 TableCell을 추가하세요 */}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Responsive;
