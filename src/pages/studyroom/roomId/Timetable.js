import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import Button from '../../../components/Button';

/* 
2시간 제한 막는 로직이 필요함 
클릭 하면 배열에 넣음 -> hour 최대최소 구하기 -> if(최대-최소 > 2):alert
*/

const Timetable = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const navigate = useNavigate();
  const [selectedCells, setSelectedCells] = useState({});
  const [clickedArray, setClickedArray] = useState([]);

  const minMaxHour = (clickedArray) => {
    const hoursArray = clickedArray.map(cell => cell.hour); // hour만 뽑아서 배열로 생성
    const maxHour = Math.max(...hoursArray); // 최대 시간
    const minHour = Math.min(...hoursArray); // 최소 시간
    // 나는 최대-최소가 2가 되면 막게 하려고 함
    return maxHour-minHour;
  }
  
  // 셀을 클릭할 때 해당 셀의 선택 여부를 업데이트하는 함수 추가
  const handleCellClick = (room, hour) => {
    // 클릭한 셀의 정보 출력
    //console.log(`Clicked cell: Room ${room}, Hour ${hour}`);
    //console.log(clickedArray);
    console.log(minMaxHour(clickedArray));
  
    if (minMaxHour(clickedArray) > 1) {
      alert('두시간 이상 예약하실 수 없습니다');
    } else {
      // 최대 2시간 이하일 때만 셀을 선택하도록 처리
      if (selectedCells[`${room}-${hour}`]) {
        setSelectedCells((prevSelectedCells) => {
          const updatedCells = { ...prevSelectedCells }; // prevSelectedCells 객체 복사
          delete updatedCells[`${room}-${hour}`]; // 선택 취소
          return updatedCells;
        });
      } else {
        setSelectedCells((prevSelectedCells) => {
          const newClickedArray = [...clickedArray, { room, hour }];
          setClickedArray(newClickedArray);
          return {
            ...prevSelectedCells,
            [`${room}-${hour}`]: true,
          };
        });
      }
    }
  };  

  return (
    <>
      <TableContainer
        sx={{
          width: '90%',
          minWidth: '650px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '50px',
        }}
      >
        <Typography variant="h5" fontWeight={10} component="div" align="center">
          예약하기
        </Typography>
        <div>
          {year}년 {month}월 {day}일
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={100} />
              {/* 30분 간격으로 시간을 표시 */}
              {[8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22].map(
                hour => (
                  <TableCell key={hour} align="center" width={200}>
                    {`${Math.floor(hour)}:${(hour % 1) * 60 === 0 ? '00' : '30'}`}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {['room1', 'room2', 'room3', 'room4'].map(room => (
              <TableRow key={room}>
                <TableCell>{room}</TableCell>
                {/* 30분 간격으로 셀을 생성 */}
                {[8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22].map(
                  hour => (
                    <TableCell
                      key={`${room}-${hour}`} // 방이랑 시간 조합해서 키 값 생성
                      sx={{
                        borderLeft: '1px solid #ccc',
                        backgroundColor: selectedCells[`${room}-${hour}`]
                          ? '#4B89DC'
                          : 'transparent', // 선택된 셀에 따라 색상 변경
                        cursor: 'pointer', // 클릭 가능한 커서 스타일 추가
                      }}
                      onClick={() => handleCellClick(room, hour)} // 클릭 이벤트 추가
                    />
                  ),
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <br />
      <br />
      <Button
        text="예약하기"
        onClick={() => {
          navigate('/reservation');
        }}
      />
      
    </>
  );
};

export default Timetable;