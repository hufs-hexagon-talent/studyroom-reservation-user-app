import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableBody,
} from "@mui/material";
import Button from "../../../components/Button";

const Room = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const navigate = useNavigate();
  const [selectedCells, setSelectedCells] = useState({});

  // 셀을 클릭할 때 해당 셀의 선택 여부를 업데이트하는 함수 추가
  const handleCellClick = (room, hour) => {
    // 이미 선택된 셀이라면 색을 초기값으로 변경하여 선택 해제
    if (selectedCells[`${room}-${hour}`]) {
      setSelectedCells((prevSelectedCells) => {
        const updatedCells = { ...prevSelectedCells };
        delete updatedCells[`${room}-${hour}`]; // 선택 취소
        return updatedCells;
      });
    } else {
      // 아직 선택되지 않은 셀이라면 색을 변경하여 선택
      setSelectedCells((prevSelectedCells) => ({
        ...prevSelectedCells,
        [`${room}-${hour}`]: true,
      }));
    }
  };

  return (
    <>
      <TableContainer
        sx={{
          width: "90%",
          minWidth: "650px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "50px",
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
              {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(
                (hour) => (
                  <TableCell key={hour} align="center" width={200}>
                    {`${hour}:00`}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {["room1", "room2", "room3", "room4"].map((room) => (
              <TableRow key={room}>
                <TableCell>{room}</TableCell>
                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(
                  (hour) => (
                    <TableCell
                      key={`${room}-${hour}`}
                      align="center"
                      width={200}
                      sx={{
                        borderLeft: "1px solid #ccc",
                        backgroundColor: selectedCells[`${room}-${hour}`]
                          ? "#4B89DC"
                          : "transparent", // 선택된 셀에 따라 색상 변경
                        cursor: "pointer", // 클릭 가능한 커서 스타일 추가
                      }}
                      onClick={() => handleCellClick(room, hour)} // 클릭 이벤트 추가
                    />
                  )
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
          navigate("/reservation");
        }}
      />
    </>
  );
};

export default Room;