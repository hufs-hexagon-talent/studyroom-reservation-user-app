import React, { useState } from 'react';
import {
  useCreateRoom,
  useAllRooms,
  useDeleteRoom,
  usePartitionsByRoomId,
} from '../../../../../api/room.api';
import { useSnackbar } from 'react-simple-snackbar';
import { Table, TableBody, Modal } from 'flowbite-react';
import { Input } from '@mui/material';

import Create from '../../../../../assets/icons/create.png';
import Delete from '../../../../../assets/icons/delete.png';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [departmentId, setDepartmentId] = useState(null);
  const [openPartitionsModal, setOpenPartitionsModal] = useState(null);
  const { mutateAsync: doCreateRoom } = useCreateRoom();
  const { mutateAsync: doDeleteRoom } = useDeleteRoom();
  const { data: roomPartitions } = usePartitionsByRoomId(openPartitionsModal);

  const { data: rooms, refetch } = useAllRooms();

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

  return (
    <div className="p-4">
      <div className="font-bold text-3xl text-gray-600 mb-6">Room</div>
      {/* Room 생성 */}
      <div className="bg-white p-4 inline-block rounded-xl mb-8 w-full">
        {/* Room 선택 */}
        <div className="flex flex-row items-center gap-x-6">
          <div className="font-bold text-xl p-3">Room 생성</div>
          <img
            src={Create}
            onClick={createRoom}
            className="w-6 h-6 cursor-pointer hover:scale-125"
          />
        </div>
        <div className="flex flex-row p-4">
          <div>호실 이름 : </div>
          <Input
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            type="string"
            className="mx-4 rounded-sm"
          />
        </div>
        {/* 부서 선택 */}
        <div className="flex flex-row p-4">
          <div>부서 ID : </div>
          <Input
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            type="string"
            className="mx-4 rounded-sm"
          />
        </div>
      </div>
      {/* 모든 Room 조회 */}
      <div className="bg-white p-4 mb-8 inline-block rounded-xl w-full">
        <div className="flex flex-row items-center gap-x-4 px-6 pt-3 pb-6">
          <div className="font-bold text-xl">모든 Room 조회</div>
        </div>
        <div>
          <Table className="text-center">
            <Table.Head>
              <Table.HeadCell>호실 ID</Table.HeadCell>
              <Table.HeadCell>호실명</Table.HeadCell>
              <Table.HeadCell>부서명</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <TableBody>
              {rooms?.map(room => (
                <Table.Row key={room.roomId}>
                  <Table.Cell
                    onClick={() => setOpenPartitionsModal(room.roomId)}
                    className="cursor-pointer hover:underline">
                    {room.roomId}
                  </Table.Cell>
                  <Table.Cell>{room.roomName}</Table.Cell>
                  <Table.Cell>{room ? room.departmentName : '-'}</Table.Cell>
                  <Table.Cell>
                    <img
                      onClick={() => deleteRoom({ roomId: room.roomId })}
                      className="w-6 h-6 cursor-pointer"
                      src={Delete}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Room별 Partitions 조회 모달 */}
      <div className="flex justify-center items-center">
        <Modal
          className="flex justify-center items-center w-full p-6"
          show={openPartitionsModal}
          size="md"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClose={() => setOpenPartitionsModal(false)}
          popup>
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <Table>
                <Table.Head className="break-keep">
                  <Table.HeadCell>호실명</Table.HeadCell>
                  <Table.HeadCell>파티션</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>
                      {roomPartitions?.data?.partitions[0]?.roomName}
                    </Table.Cell>
                    <Table.Cell>
                      {roomPartitions?.data?.partitions
                        ?.map(
                          room => `${room?.roomName}-${room?.partitionNumber}`,
                        )
                        .join(', ')}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default CreateRoom;
