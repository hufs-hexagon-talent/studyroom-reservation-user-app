import React, { useState } from 'react';
import { useAllPartitions } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

const SelectRoom = () => {
  const { data: partitions, error, isLoading } = useAllPartitions();
  const [selectedPartitions, setSelectedPartitions] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const navigate = useNavigate();

  const cesPartitions = partitions?.filter(
    partition => partition.roomId === 1 || partition.roomId === 2,
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading rooms.</div>;
  }

  const handleAllCheckboxChange = partition => {
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

  const handleSelectAllChange = () => {
    if (isAllSelected) {
      setSelectedPartitions([]);
      setIsAllSelected(false);
    } else {
      setSelectedPartitions(cesPartitions);
      setIsAllSelected(true);
    }
  };

  const handleNextClick = () => {
    const selectedPartitionIds = selectedPartitions.map(
      partition => partition.partitionId,
    );
    navigate(`/visit?partitionIds[]=${selectedPartitionIds.join(',')}`);
  };

  // roomName별로 그룹화
  const groupedPartitions = cesPartitions.reduce((acc, partition) => {
    const roomName = partition.roomName;
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(partition);
    return acc;
  }, {});

  return (
    <div className="p-10">
      <div className="mt-10 text-2xl text-center">
        예약 조회를 원하는 방을 선택하세요
      </div>

      <div className="flex justify-center mt-12">
        <div className="flex flex-col">
          {Object.entries(groupedPartitions)
            .filter(([roomName, roomPartitions]) =>
              roomPartitions.some(
                partition => partition.roomId === 1 || partition.roomId === 2,
              ),
            )
            .map(([roomName, roomPartitions]) => (
              <div key={roomName} className="mb-6">
                <div className="text-xl font-bold mb-2">{roomName}호</div>
                {roomPartitions.map(partition => (
                  <div
                    className="flex items-center mb-2"
                    key={partition.partitionId}>
                    <input
                      id={`box-${partition.partitionId}`}
                      type="checkbox"
                      value={partition.partitionId}
                      className="w-4 h-4 bg-gray-100 border-gray-300"
                      checked={selectedPartitions.some(
                        p => p.partitionId === partition.partitionId,
                      )}
                      onChange={() => handleAllCheckboxChange(partition)}
                    />
                    <label
                      htmlFor={`box-${partition.partitionId}`}
                      className="ml-2 text-lg">
                      {`${partition.roomName}-${partition.partitionNumber}`}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          <div className="flex items-center mb-4">
            <input
              id="select-all"
              type="checkbox"
              className="w-4 h-4 bg-gray-100 border-gray-300"
              checked={isAllSelected}
              onChange={handleSelectAllChange}
            />
            <label htmlFor="select-all" className="ml-2 text-xl">
              전체 선택
            </label>
          </div>
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
