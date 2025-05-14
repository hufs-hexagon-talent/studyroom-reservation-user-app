import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Checkbox, Table } from 'flowbite-react';
import { usePartitionsByRoomId, useRooms } from '../../../../../api/room.api';
import { useDeletePartition } from '../../../../../api/roomPartition.api';

const EditRoom = () => {
  const { roomId } = useParams();
  const { data: room } = useRooms(roomId);
  const { data: roomPartitions } = usePartitionsByRoomId(roomId);
  const { mutate: deletePartition } = useDeletePartition();

  const departmentId = room?.departmentId;
  const departmentName = room?.departmentName;
  const roomName = room?.roomName; // 호실명

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex justify-between items-center py-4">
        <div>
          <div className="font-bold text-3xl text-black">{roomName}호</div>
          <div className="px-4 text-sm text-gray-500">{departmentName}</div>
        </div>
        <Button color="dark">삭제</Button>
      </div>
      <Table>
        <Table.Head className="text-lg break-keep">
          <Table.HeadCell className="bg-gray-200"></Table.HeadCell>
          <Table.HeadCell className="bg-gray-200">파티션ID</Table.HeadCell>
          <Table.HeadCell className="bg-gray-200">파티션명</Table.HeadCell>
        </Table.Head>
        <Table.Body className="bg-white">
          {roomPartitions?.data?.partitions?.map(roomPartition => (
            <Table.Row
              className=" text-lg hover:bg-gray-50"
              key={roomPartition.roomId}>
              <Table.Cell>
                <Checkbox className="rounded-none" />
              </Table.Cell>
              <Table.Cell>{roomPartition?.roomPartitionId}</Table.Cell>
              <Table.Cell>
                {roomPartition?.roomName}-{roomPartition?.partitionNumber}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default EditRoom;
