import React, { useState } from 'react';
import { useAllPartitions } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

const SelectRoom = () => {
  const { data: partitions, error, isLoading } = useAllPartitions();
  const [selectedPartitions, setSelectedPartitions] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedCesPartitions, setSelectedCesPartitions] = useState([]);
  const [isCesSelected, setIsCesSelected] = useState(false);
  const [selectedIcePartitions, setSelectedIcePartitions] = useState([]);
  const [isIceSelected, setIsIceSelected] = useState(false);
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

  const handleSelectAllChange = () => {
    if (isAllSelected) {
      setSelectedPartitions([]);
      setIsAllSelected(false);
      setIsCesSelected(false);
      setIsIceSelected(false);
    } else {
      setSelectedPartitions(partitions);
      setIsAllSelected(true);
      setIsCesSelected(true);
      setIsIceSelected(true);
    }
  };

  console.log(selectedPartitions);
  // console.log(selectedCesPartitions);
  // console.log(selectedIcePartitions);

  // 컴퓨터공학부 선택
  const handleCesSelectChange = () => {
    setSelectedPartitions(prevSelected => {
      if (isCesSelected) {
        // 이미 선택된 상태라면 해제
        return prevSelected.filter(
          partition => !(partition.roomId === 1 || partition.roomId === 2),
        );
      } else {
        // 선택되지 않은 상태라면 기존 선택을 유지하면서 추가
        const csPartitions = partitions.filter(
          partition => partition.roomId === 1 || partition.roomId === 2,
        );
        return [...prevSelected, ...csPartitions];
      }
    });

    // 상태 변경을 한 번에 적용
    setIsCesSelected(prevState => !prevState);
  };

  // 정보통신공학과 선택
  const handleIceSelectChange = () => {
    if (isIceSelected) {
      setSelectedPartitions(prevSelected =>
        prevSelected.filter(
          partition => !(partition.roomId === 3 || partition.roomId === 4),
        ),
      );
      setIsIceSelected(false);
    } else {
      const ecePartitions = partitions.filter(
        partition => partition.roomId === 3 || partition.roomId === 4,
      );
      setSelectedPartitions(prevSelected => [
        ...prevSelected,
        ...ecePartitions,
      ]);
      setIsIceSelected(true);
    }
  };

  const handleNextClick = () => {
    const selectedPartitionIds = selectedPartitions.map(
      partition => partition.partitionId,
    );
    navigate(`/visit?partitionIds[]=${selectedPartitionIds.join(',')}`);
  };

  return (
    <div className="p-10">
      <div className="mt-10 text-2xl text-center">
        예약 조회를 원하는 방을 선택하세요
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
                checked={selectedPartitions.some(
                  p => p.partitionId === partition.partitionId,
                )}
                onChange={() => handleCheckboxChange(partition)}
              />
              <label
                htmlFor={`box-${partition.partitionId}`}
                className="ml-2 text-xl">
                {`${partition.roomName}-${partition.partitionNumber}`}
              </label>
            </div>
          ))}
          <div className="flex items-center mb-4">
            <input
              id="select-cs"
              type="checkbox"
              className="w-4 h-4 bg-gray-100 border-gray-300"
              checked={isCesSelected}
              onChange={handleCesSelectChange}
            />
            <label htmlFor="select-cs" className="ml-2 text-xl">
              컴퓨터공학부 선택
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="select-ece"
              type="checkbox"
              className="w-4 h-4 bg-gray-100 border-gray-300"
              checked={isIceSelected}
              onChange={handleIceSelectChange}
            />
            <label htmlFor="select-ece" className="ml-2 text-xl">
              정보통신공학과 선택
            </label>
          </div>
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
