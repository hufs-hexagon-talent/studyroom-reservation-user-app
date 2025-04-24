import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useAllRooms } from '../../../api/room.api';
import RoomReservationCard from '../../../components/admin/reservation management/RoomReservationCard';

const ReservationState = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: rooms, isLoading } = useAllRooms();

  // 각 방에 대한 partition 매핑
  const roomPartitionMap = {
    306: [1, 2, 3, 4],
    428: [5, 6],
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">
        Reservation State Management
      </div>
      <div className="py-4">
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          locale="ko"
          className="border border-gray-300 p-2 rounded"
        />
      </div>

      <div className="flex flex-row gap-x-6 gap-y-4">
        {rooms?.map(room => {
          const partitionIds = roomPartitionMap[Number(room.roomName)] || [];

          return (
            <RoomReservationCard
              key={room.roomId}
              room={room}
              selectedDate={selectedDate}
              partitionIds={partitionIds}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ReservationState;
