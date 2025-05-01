import React, { useState } from 'react';
import {
  useCreateRoom,
  useAllRooms,
  useDeleteRoom,
  usePartitionsByRoomId,
} from '../../../../../api/room.api';
import { useCreatePartition } from '../../../../../api/roomPartition.api';
import { useSnackbar } from 'react-simple-snackbar';
import Delete from '../../../../../assets/icons/delete.png';
import { Modal } from 'flowbite-react';
import { Table, TableBody } from 'flowbite-react';
import Create from '../../../../../assets/icons/create.png';
import UnderArrow from '../../../../../assets/icons/under_arrow_black.png';

const CreatePartition = () => {
  const [roomName, setRoomName] = useState('');
  const [departmentId, setDepartmentId] = useState(null);
  const [isGetRooms, setIsGetRooms] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [partitionNumber, setPartitionNumber] = useState(null);
  const [openPartitionsModal, setOpenPartitionsModal] = useState(null);
  const { mutateAsync: doCreateRoom } = useCreateRoom();
  const { mutateAsync: doDeleteRoom } = useDeleteRoom();
  const { data: rooms, refetch } = useAllRooms();
  const { data: RoomPartitions } = usePartitionsByRoomId(openPartitionsModal);
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

  // 호실 생성
  const createRoom = async () => {
    try {
      const response = await doCreateRoom({
        roomName,
        departmentId,
      });
      openSuccessSnackbar(response.message, 3000);
      await refetch();
    } catch (error) {
      openErrorSnackbar(error?.response.data.message, 3000);
    }
  };

  // 호실 삭제
  const deleteRoom = async roomId => {
    try {
      const response = await doDeleteRoom(roomId);
      openSuccessSnackbar(response?.message);
      await refetch();
    } catch (error) {
      openErrorSnackbar(error?.response.data.message, 3000);
    }
  };

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
      <div className="bg-white p-4 mb-8 inline-block rounded-xl hover:shadow-lg w-full">
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
          <input
            onChange={e => setRoomId(e.target.value)}
            value={roomId}
            type="number"
            className="rounded mx-2"></input>
        </div>
        {/* PartitionNumber */}
        <div className="flex flex-row items-center p-3">
          <div>파티션 번호 : </div>
          <input
            onChange={e => setPartitionNumber(e.target.value)}
            value={partitionNumber}
            type="number"
            className="rounded mx-2"></input>
        </div>
      </div>
    </div>
  );
};

export default CreatePartition;
