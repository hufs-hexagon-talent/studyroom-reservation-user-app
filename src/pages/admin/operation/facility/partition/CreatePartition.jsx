import React, { useState } from 'react';
import {
  useCreatePartition,
  useAllPartitions,
} from '../../../../../api/roomPartition.api';
import { Input } from '@mui/material';
import { useSnackbar } from 'react-simple-snackbar';
import Create from '../../../../../assets/icons/create.png';
import { Table } from 'flowbite-react';

const CreatePartition = () => {
  const [roomId, setRoomId] = useState(null);
  const [partitionNumber, setPartitionNumber] = useState(null);
  const { data: partitions } = useAllPartitions();
  const { mutateAsync: doCreatePartition } = useCreatePartition();

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
    },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });

  const groupedPartitions = partitions.reduce((acc, cur) => {
    const key = cur.roomName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(`${cur.roomName}-${cur.partitionNumber}`);
    return acc;
  }, {});

  // 파티션 생성
  const createPartition = async () => {
    try {
      const response = await doCreatePartition({ roomId, partitionNumber });
      openSuccessSnackbar(response?.message, 3000);
    } catch (error) {
      openErrorSnackbar(error.response.data.message, 3000);
    }
  };

  return (
    <div>
      {/* Partition */}
      <div className="font-bold text-3xl text-gray-600 mt-10 mb-6">
        Partition
      </div>
      {/* 파티션 생성 */}
      <div className="bg-white p-4 mb-8 inline-block rounded-xl w-full">
        <div className="flex flex-row items-center gap-x-6">
          <div className="font-bold text-xl p-3">Partition 생성</div>
          {/* Partition 생성 버튼 */}
          <img
            src={Create}
            onClick={createPartition}
            className="cursor-pointer hover:scale-125 w-6 h-6"
          />
        </div>
        {/* RoomId */}
        <div className="flex flex-row items-center p-3">
          <div>호실 ID : </div>
          <Input
            onChange={e => setRoomId(e.target.value)}
            value={roomId}
            type="number"
            className="rounded mx-2"
          />
        </div>
        {/* PartitionNumber */}
        <div className="flex flex-row items-center p-3">
          <div>파티션 번호 : </div>
          <Input
            onChange={e => setPartitionNumber(e.target.value)}
            value={partitionNumber}
            type="number"
            className="rounded mx-2"
          />
        </div>
      </div>
      {/* 파티션 조회 */}
      <div className="bg-white p-4 mb-8 inline-block rounded-xl w-full">
        <div className="font-bold text-xl p-3">Partition 조회</div>
        <div>
          <Table className="text-lg">
            <Table.Head className="text-lg">
              <Table.HeadCell>호실명</Table.HeadCell>
              <Table.HeadCell>파티션명</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {Object.entries(groupedPartitions).map(
                ([roomName, partitionList]) => (
                  <Table.Row key={roomName}>
                    <Table.Cell>{roomName}</Table.Cell>
                    <Table.Cell>{partitionList.join(', ')}</Table.Cell>
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CreatePartition;
