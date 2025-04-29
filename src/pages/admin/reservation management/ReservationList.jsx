import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useAllRooms } from '../../../api/room.api';
import { useAllPartitions } from '../../../api/roomPartition.api';
import RoomReservationCard from './RoomReservationCard';

const ReservationList = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: rooms } = useAllRooms();
  const { data: partitions } = useAllPartitions();

  // 호실명 배열
  const roomName = rooms?.map(room => room.roomName);

  // 룸 - 파티션 매핑
  const roomPartitionMap = roomName?.reduce((acc, name) => {
    const matchedPartitions = partitions
      ?.filter(p => p.roomName === name)
      .map(p => p.partitionNumber);

    if (matchedPartitions?.length > 0) {
      acc[name] = matchedPartitions;
    }

    return acc;
  }, {});

  console.log('roomPartitionMap : ', roomPartitionMap);
  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">
        Reservation List
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

export default ReservationList;
