import React, { useState } from 'react';
import { useAllPartitions } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

const SelectRoom = () => {
  const { data: partitions, error, isLoading } = useAllPartitions();
  const [selectedPartitions, setSelectedPartitions] = useState([]);
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading rooms.</div>;
  }

  const handleCheckboxChange = partition => {
    setSelectedPartitions(prevSelectedRooms => {
      if (
        prevSelectedRooms.find(r => r.partitionId === partition.partitionId)
      ) {
        return prevSelectedRooms.filter(
          r => r.partitionId !== partition.partitionId,
        );
      } else {
        return [...prevSelectedRooms, partition];
      }
    });
  };

  const handleNextClick = () => {
    const selectedPartitionIds = selectedPartitions.map(
      partition => partition.partitionId,
    );
    console.log('Selected rooms:', selectedPartitionIds);
    navigate(`/visit?partitionIds[]=${selectedPartitionIds.join(',')}`);
  };

  return (
    <div className="m-10">
      <div className="font-bold mt-10 text-2xl text-center">
        방을 선택하세요
      </div>
      <div className="flex justify-center mt-12">
        <div className="flex flex-col">
          {partitions.map((partition, index) => (
            <div className="flex items-center mb-4" key={index}>
              <input
                id={`box-${partition.partitionId}`}
                type="checkbox"
                value={partition.partitionId}
                className="w-4 h-4 bg-gray-100 border-gray-300"
                onChange={() => handleCheckboxChange(partition)}
              />
              <label
                htmlFor={`box-${partition.partitionId}`}
                className="ml-2 text-xl font-medium">
                {`${partition.roomName}-${partition.partitionNumber}`}
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
