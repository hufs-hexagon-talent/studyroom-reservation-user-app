import React, { useState } from 'react';
import { useCreateRoom, useAllRooms } from '../../../../api/room.api';
import { useSnackbar } from 'react-simple-snackbar';
import { Button, Table, TableBody } from 'flowbite-react';

const FacilityManagement = () => {
  const [roomName, setRoomName] = useState('');
  const [departmentId, setDepartmentId] = useState(null);
  const [isGetRooms, setIsGetRooms] = useState(false);
  const { mutateAsync: doCreateRoom } = useCreateRoom();
  const { data: rooms } = useAllRooms();

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
      openSuccessSnackbar('호실이 생성 되었습니다.', 3000);
      console.log(roomName, departmentId);
    } catch (error) {
      openErrorSnackbar('호실 생성 중 오류가 발생하였습니다.', 3000);
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
          <div>Room 생성</div>
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
        <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-lg w-full">
          <div className="flex flex-row items-center">
            <div className="text-lg p-6">모든 Room 조회</div>
            <Button
              onClick={() => setIsGetRooms(true)}
              className="my-8 ml-4 bg-blue-600 cursor-pointer">
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
                </Table.Head>
                <TableBody>
                  {rooms?.map(room => (
                    <Table.Row key={room.roomId}>
                      <Table.Cell>{room.roomId}</Table.Cell>
                      <Table.Cell>{room.roomName}</Table.Cell>
                      <Table.Cell>{room.departmentName}</Table.Cell>
                    </Table.Row>
                  ))}
                </TableBody>
              </Table>
              <div
                onClick={() => setIsGetRooms(false)}
                className="cursor-pointer hover:underline">
                간략히
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityManagement;
