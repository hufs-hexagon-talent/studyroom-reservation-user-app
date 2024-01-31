import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import './Timetable.css';

import Button from '../../../components/Button';

const Timetable = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const navigate = useNavigate();
  const [selectedCells, setSelectedCells] = useState({});
  const [countClick, setCountClick] = useState(1);

  const handleCellClick = (room, hour) => {
    console.log(`Clicked cell: Room ${room}, Hour ${hour}`);

    if (selectedCells[`${room}-${hour}`]) {
      setSelectedCells((prevSelectedCells) => {
        setCountClick(countClick - 1);
        const updatedCells = { ...prevSelectedCells };
        delete updatedCells[`${room}-${hour}`];
        return updatedCells;
      });
    } else {
      setSelectedCells((prevSelectedCells) => {
        setCountClick(countClick + 1);
        return {
          ...prevSelectedCells,
          [`${room}-${hour}`]: true,
        };
      });
    }
  };

  return (
    <div>
      <div className='reserve'>
        <h1>예약하기</h1>
      </div>
      <div>
        {year}년 {month}월 {day}일
      </div>
      <TableContainer
        sx={{
          width: '90%',
          minWidth: '650px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '50px',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={100} />
              {[
                8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17,
                17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22
              ].map(
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
                {[8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5,
                  18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22].map(
                  hour => (
                    <TableCell
                      key={`${room}-${hour}`}
                      onClick={() => handleCellClick(room, hour)}
                    />
                  ),
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <br />
      <Button
        text="예약하기"
        onClick={() => {
          navigate('/reservation');
        }}
      />
    </div>
  );
};

export default Timetable;
