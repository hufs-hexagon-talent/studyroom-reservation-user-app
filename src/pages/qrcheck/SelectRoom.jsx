import React, { useState, useEffect } from 'react';
import { useAllRooms, usePartitionsByRoomIds } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

const SelectRoom = () => {
  const { data: rooms, error, isLoading } = useAllRooms();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const navigate = useNavigate();

  const selectedRoomIds = selectedRooms.map(room => room.roomId);
  const { data: partitions, refetch } = usePartitionsByRoomIds(selectedRoomIds);

  useEffect(() => {
    if (selectedRoomIds.length > 0) {
      refetch();
    }
  }, [selectedRoomIds, refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading rooms.</div>;
  }

  const handleCheckboxChange = room => {
    setSelectedRooms(prevSelectedRooms => {
      if (prevSelectedRooms.find(r => r.roomId === room.roomId)) {
        return prevSelectedRooms.filter(r => r.roomId !== room.roomId);
      } else {
        return [...prevSelectedRooms, room];
      }
    });
  };

  const handleNextClick = () => {
    const selectedPartitionIds = partitions.map(
      partition => partition.roomPartitionId,
    );
    console.log('Selected partitions:', selectedPartitionIds);
    navigate(`/visit?partitionIds[]=${selectedPartitionIds.join(',')}`);
  };

  return (
    <div className="m-10">
      <div className="font-bold mt-10 text-2xl text-center">
        방을 선택하세요
      </div>
      <div className="flex justify-center mt-12">
        <div className="flex flex-col">
          {rooms?.map((room, index) => (
            <div className="flex items-center mb-4" key={index}>
              <input
                id={`box-${room.roomName}`}
                type="checkbox"
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
          className="text-xl font-medium py-2 px-4">
          다음
        </Button>
      </div>
    </div>
  );
};

export default SelectRoom;
