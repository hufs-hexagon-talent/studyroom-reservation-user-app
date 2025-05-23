import React from 'react';
import { useAllRooms } from '../../api/room.api';
import { useSchedules } from '../../api/policySchedule.api';
import { Checkbox } from 'flowbite-react';
import { format } from 'date-fns';
import { useCustomSnackbars } from '../snackbar/SnackBar';
import Create from '../../assets/icons/create.png';

const SelectRoom = ({
  selectedRooms,
  setSelectedRooms,
  selectedDates,
  selectedPolicyId,
}) => {
  const { data: rooms } = useAllRooms();
  const { mutateAsync: doSchedule } = useSchedules();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();

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
      openErrorSnackbar(
        '정책, 날짜, 그리고 호실을 모두 선택해야 합니다.',
        3000,
      );
      return;
    }
    try {
      const response = await doSchedule({
        roomOperationPolicyId: selectedPolicyId,
        roomIds: selectedRooms,
        policyApplicationDates: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
      });
      openSuccessSnackbar(response.message, 3000);
    } catch (error) {
      openErrorSnackbar(
        error.response?.data?.message || '스케줄 주입 중 오류가 발생했습니다.',
        3000,
      );
    }
  };

  return (
    <div className="flex justify-between items-centerpb-8">
      <div>
        <div className="flex flex-row gap-3">
          {rooms
            ?.filter(room => room.departmentId === 1)
            .map(room => (
              <div key={room.roomId} className="flex items-center mb-3">
                <Checkbox
                  className="rounded-none text-[#1D2430] focus:ring-[#1D2430] cursor-pointer"
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
      <img
        src={Create}
        onClick={handleButton}
        className="w-7 h-7 cursor-pointer hover:scale-125"
      />
    </div>
  );
};

export default SelectRoom;
