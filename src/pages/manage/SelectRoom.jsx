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

  // 방 번호에 따라 두 개의 열로 나누기
  const firstColumnRooms = roomNames.filter(room => room.startsWith('306'));
  const secondColumnRooms = roomNames.filter(room => room.startsWith('428'));

  return (
    <div className="m-10">
      <div className="font-bold mt-10 text-2xl text-center">
        방을 선택하세요
      </div>
      <div className="flex justify-center mt-4 space-x-8">
        <div className="flex flex-col">
          {firstColumnRooms.map((roomName, index) => (
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
        <div className="flex flex-col">
          {secondColumnRooms.map((roomName, index) => (
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
    </div>
  );
};

export default SelectRoom;
