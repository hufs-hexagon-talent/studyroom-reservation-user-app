import React, { useState } from 'react';
import { useAllRooms } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';

const SelectRoom = () => {
  const { data: rooms, error, isLoading } = useAllRooms();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const navigate = useNavigate();
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading rooms.</div>;
  }

  const handleCheckboxChange = room => {
    setSelectedRoom(prevSelectedRoom => {
      if (prevSelectedRoom && prevSelectedRoom.roomId === room.roomId) {
        return null;
      } else {
        return room;
      }
    });
  };

  const handleNextClick = () => {
    if (!selectedRoom) {
      openSnackbar('적어도 하나의 호실을 선택해주세요');
      setTimeout(() => {
        closeSnackbar();
      }, 2500);
      return;
    }

    navigate(`/qrcheck?roomId=${selectedRoom.roomId}`);
  };

  return (
    <div className="p-10">
      <div className="mt-10 text-2xl text-center">호실을 선택하세요</div>
      <div className="flex justify-center mt-12">
        <div className="flex flex-col">
          {rooms.map((room, index) => (
            <div className="flex items-center mb-4" key={index}>
              <input
                id={`box-${room.roomName}`}
                type="checkbox"
                checked={selectedRoom?.roomId === room.roomId}
                value={room.roomName}
                className="w-4 h-4 bg-gray-100 border-gray-300"
                onChange={() => handleCheckboxChange(room)}
              />
              <label
                htmlFor={`box-${room.roomName}`}
                className="ml-2 text-xl font-medium">
                {room.roomName}호
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end w-full mt-6">
        <Button
          color="dark"
          onClick={handleNextClick}
          className="text-xl font-medium px-2">
          다음
        </Button>
      </div>
    </div>
  );
};

export default SelectRoom;
