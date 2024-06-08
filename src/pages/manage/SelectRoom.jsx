import React from 'react';
import { useAllRooms } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

const SelectRoom = () => {
  const { data: roomNames, error, isLoading } = useAllRooms();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading rooms.</div>;
  }

  return (
    <div className="m-10">
      <div className="font-bold mt-10 text-2xl text-center">
        방을 선택하세요
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex flex-col">
          {roomNames.map((roomName, index) => (
            <div className="flex items-center mb-4" key={index}>
              <input
                id={`box-${roomName}`}
                type="checkbox"
                value={roomName}
                className="w-4 h-4 bg-gray-100 border-gray-300 rounded"
              />
              <label
                htmlFor={`box-${roomName}`}
                className="ml-2 text-xl font-medium">
                {roomName}
              </label>
            </div>
          ))}
        </div>
      </div>
      <Button
        color="dark"
        //onClick={navigate(`/visit?roomIds[]=${selectedRooms.join(',')}`)}
      >
        다음
      </Button>
    </div>
  );
};

export default SelectRoom;
