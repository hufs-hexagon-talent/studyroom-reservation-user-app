import React from 'react';
import { useAllRooms } from '../../api/user.api';

const SelectRoom = () => {
  const { data: roomNames, error, isLoading } = useAllRooms();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading rooms.</div>;
  }

  return (
    <div>
      <div className="font-bold mt-10 text-2xl text-center">
        방을 선택하세요
      </div>
      <div className="flex items-center justify-center mt-10">
        <div className="flex flex-wrap items-start">
          {roomNames.map((roomName, index) => (
            <div className="flex items-center mb-4 mr-8" key={index}>
              <input
                id={`box-${roomName}`}
                type="checkbox"
                value={roomName}
                className="w-4 h-4"
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
    </div>
  );
};

export default SelectRoom;
