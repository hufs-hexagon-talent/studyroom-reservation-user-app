import React, { useState } from 'react';
import { useCreateRoom } from '../../../../../api/room.api';
import { useSnackbar } from 'react-simple-snackbar';
import Create from '../../../../../assets/icons/create.png';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [departmentId, setDepartmentId] = useState(null);
  const { mutateAsync: doCreateRoom } = useCreateRoom();

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

  return (
    <div>
      <div className="font-bold text-3xl text-gray-600 mb-6">Room</div>
      {/* Room 생성 */}
      <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-lg w-full">
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
      </div>
    </div>
  );
};

export default CreateRoom;
