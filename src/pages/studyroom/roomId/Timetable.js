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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";
import Button from "../../../components/Button";

const Room = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const navigate = useNavigate();
  const [selectedCells, setSelectedCells] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  // 예약 확인 대화상자 열기
  const handleOpenDialog = (room, hour) => {
    setSelectedRoom(room);
    setSelectedHour(hour);
    setOpenDialog(true);
  };

  // 예약 확인 대화상자 닫기
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 셀을 클릭할 때 해당 셀의 선택 여부를 업데이트하는 함수 추가
  const handleCellClick = (room, hour) => {
    handleOpenDialog(room, hour);
  };

  // 예약을 확정할 때 호출되는 함수
  const handleConfirmReservation = () => {
    setSelectedCells((prevSelectedCells) => ({
      ...prevSelectedCells,
      [`${selectedRoom}-${selectedHour}`]: true,
    }));
    handleCloseDialog();
  };

  return (
    <>
      <div>예약하기</div>
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
                          ? "blue"
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

      {/* 예약 확인 대화상자 */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>예약 확인</DialogTitle>
        <DialogContent>
          {selectedRoom && selectedHour && (
            <Typography>
              {selectedRoom} 스터디룸을 {selectedHour}:00에 예약하시겠습니까?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleCloseDialog} color="primary">
            취소
          </MuiButton>
          <MuiButton onClick={handleConfirmReservation} color="primary">
            확인
          </MuiButton>
        </DialogActions>
      </Dialog>

      <br />
      <Button
        text="다음"
        onClick={() => {
          navigate("/reservation");
        }}
      />
    </>
  );
};

export default Room;