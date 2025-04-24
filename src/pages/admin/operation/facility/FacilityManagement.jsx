import React, { useState } from 'react';
import {
  useCreateRoom,
  useAllRooms,
  useDeleteRoom,
  usePartitionsByRoomId,
} from '../../../../api/room.api';
import { useCreatePartition } from '../../../../api/roomPartition.api';
import { useSnackbar } from 'react-simple-snackbar';
import Delete from '../../../../assets/icons/delete.png';
import { Modal } from 'flowbite-react';
import { Button, Table, TableBody } from 'flowbite-react';

const FacilityManagement = () => {
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
      <div className="font-bold text-3xl text-black px-4 py-8">Facilities</div>
      <div className="px-8">
        {/* Room */}
        <div className="font-bold text-3xl text-gray-600 mb-6">Room</div>
        {/* Room 생성 */}
        <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-lg w-full">
          {/* Room 선택 */}
          <div className="font-bold text-xl p-3">Room 생성</div>
          <div className="flex flex-row p-4">
            <div>호실 이름 : </div>
            <input
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              type="string"
              className="mx-4 border rounded-sm"
            />
          </div>
          {/* 부서 선택 */}
          <div className="flex flex-row p-4">
            <div>부서 ID : </div>
            <input
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              type="string"
              className="mx-4 border rounded-sm"
            />
          </div>
          <Button onClick={createRoom} className="bg-blue-500 mt-8">
            호실 생성
          </Button>
        </div>
        {/* 모든 Room 조회 */}
        <div className="bg-white p-4 mb-8 inline-block rounded-xl hover:shadow-lg w-full">
          <div className="flex flex-row items-center px-6 pt-3 pb-6">
            <div className="font-bold text-xl">모든 Room 조회</div>
            <Button
              onClick={() => setIsGetRooms(true)}
              className="ml-4 bg-blue-500 cursor-pointer">
              조회
            </Button>
          </div>
          {isGetRooms && (
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
                      <Table.Cell>
                        {room ? room.departmentName : '-'}
                      </Table.Cell>
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
              <div
                onClick={() => setIsGetRooms(false)}
                className="ml-3 cursor-pointer hover:underline">
                간략히 &gt;
              </div>
            </div>
          )}
        </div>
        {/* Partition */}
        <div className="font-bold text-3xl text-gray-600 mt-10 mb-6">
          Partition
        </div>
        {/* 파티션 생성 */}
        <div className="bg-white p-4 mb-8 inline-block rounded-xl hover:shadow-lg w-full">
          <div className="flex flex-row items-center gap-x-6">
            <div className="font-bold text-xl p-3">Partition 생성</div>
            {/* Partition 생성 버튼 */}
            <Button
              onClick={createPartition}
              className="bg-gray-300 rounded-full text-black mt-8 m-3">
              파티션 생성
            </Button>
          </div>
          {/* RoomId */}
          <div className="flex flex-row items-center p-3">
            <div>Room Id : </div>
            <input
              onChange={e => setRoomId(e.target.value)}
              value={roomId}
              type="number"
              className="rounded mx-2"></input>
          </div>
          {/* PartitionNumber */}
          <div className="flex flex-row items-center p-3">
            <div>Partition Number : </div>
            <input
              onChange={e => setPartitionNumber(e.target.value)}
              value={partitionNumber}
              type="number"
              className="rounded mx-2"></input>
          </div>
        </div>
      </div>

      {/* todo: room 수정 */}
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
                      {RoomPartitions?.data?.partitions[0]?.roomName}
                    </Table.Cell>
                    <Table.Cell>
                      {RoomPartitions?.data?.partitions
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

export default FacilityManagement;
