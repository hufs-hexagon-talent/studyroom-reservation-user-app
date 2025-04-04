import React, { useState } from 'react';
import { useAllRooms } from '../../../api/room.api';
import { useSchedules } from '../../../api/policySchedule.api';
import { Checkbox, Button } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { format } from 'date-fns';

const SelectRoom = ({
  selectedRooms,
  setSelectedRooms,
  selectedDates,
  selectedPolicyId,
}) => {
  const { data: rooms } = useAllRooms();
  const { mutateAsync: doSchedule } = useSchedules();

  const [openErrorSnackbar, closeErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });
  const [openSuccessSnackbar, closeSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
    },
  });

  const handleRoomCheckbox = roomId => {
    setSelectedRooms(prevSelectedRooms =>
      prevSelectedRooms.includes(roomId)
        ? prevSelectedRooms.filter(id => id !== roomId)
        : [...prevSelectedRooms, roomId],
    );
  };

  const handleButton = async () => {
    if (
      !selectedPolicyId ||
      selectedRooms.length === 0 ||
      selectedDates.length === 0
    ) {
      openErrorSnackbar('정책, 날짜, 그리고 호실을 모두 선택해야 합니다.');
      setTimeout(() => {
        closeErrorSnackbar();
      }, 3000);
      return;
    }
    try {
      const response = await doSchedule({
        roomOperationPolicyId: selectedPolicyId,
        roomIds: selectedRooms,
        policyApplicationDates: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
      });
      openSuccessSnackbar(response.message);
      setTimeout(() => {
        closeSuccessSnackbar();
      }, 3000);
    } catch (error) {
      openErrorSnackbar(
        error.response?.data?.message || '스케줄 주입 중 오류가 발생했습니다.',
      );
      setTimeout(() => {
        closeErrorSnackbar();
      }, 3000);
    }
  };

  return (
    <div className="flex justify-between">
      <div>
        <div className="flex flex-row gap-3">
          {rooms
            ?.filter(room => room.departmentId === 1)
            .map(room => (
              <div key={room.roomId} className="flex items-center mb-3">
                <Checkbox
                  className="rounded-none cursor-pointer"
                  id={room.roomId}
                  checked={selectedRooms.includes(room.roomId)}
                  onChange={() => handleRoomCheckbox(room.roomId)}
                />
                <label htmlFor={room.roomId} className="ml-2">
                  {room.roomName}호
                </label>
              </div>
            ))}
        </div>
      </div>
      <div>
        <div
          onClick={handleButton}
          className="text-blue-600 cursor-pointer hover:underline">
          주입하기↗
        </div>
      </div>
    </div>
  );
};

export default SelectRoom;
