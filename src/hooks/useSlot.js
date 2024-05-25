import{ useCallback } from 'react';

const useSlot = (
  startTimeIndex,
  endTimeIndex,
  selectedPartition,
  setSelectedPartition,
  setStartTimeIndex,
  setEndTimeIndex,
  formatDate,
  selectedDate,
  times,
  timeTableConfig
) => {
  const getSlotSelected = useCallback(
    (partition, timeIndex) => {
      if (!startTimeIndex || !endTimeIndex) return false;
      if (selectedPartition !== partition) return false;
      if (!(startTimeIndex <= timeIndex && timeIndex <= endTimeIndex)) return false;

      return true;
    },
    [startTimeIndex, endTimeIndex, selectedPartition]
  );

  const toggleSlot = useCallback(
    (partition, timeIndex) => {
      const isExist = getSlotSelected(partition, timeIndex);

      if (!startTimeIndex && !endTimeIndex) {
        setSelectedPartition(partition);
        setStartTimeIndex(timeIndex);
        setEndTimeIndex(timeIndex);
        return;
      }

      if (selectedPartition !== partition) {
        setSelectedPartition(partition);
        setStartTimeIndex(timeIndex);
        setEndTimeIndex(timeIndex);
        return;
      }

      if (startTimeIndex === endTimeIndex) {
        if (Math.abs(startTimeIndex - timeIndex) + 1 > timeTableConfig.maxReservationSlots) {
          // 예약 가능한 최대 슬롯 수를 초과한 경우 경고 표시
          console.log('예약은 최대 두시간까지만 가능합니다.');
          return;
        }
        if (startTimeIndex === timeIndex) {
          setSelectedPartition(null);
          setStartTimeIndex(null);
          setEndTimeIndex(null);
        } else if (startTimeIndex < timeIndex) {
          setEndTimeIndex(timeIndex);
        } else {
          setStartTimeIndex(timeIndex);
          setEndTimeIndex(timeIndex);
        }
        return;
      }

      setSelectedPartition(partition);
      setStartTimeIndex(timeIndex);
      setEndTimeIndex(timeIndex);

      // 시간과 날짜를 포함한 ISO 8601 형식으로 변환
      const formattedDate = formatDate(new Date(selectedDate));
      const startDateTime = `${formattedDate}T${times[startTimeIndex]}:00.000Z`;
      const endDateTime = `${formattedDate}T${times[endTimeIndex]}:00.000Z`;

      console.log({
        partition,
        startDateTime,
        endDateTime,
        isExist,
        selectedDate: formattedDate,
      });
    },
    [
      getSlotSelected,
      setSelectedPartition,
      setStartTimeIndex,
      setEndTimeIndex,
      formatDate,
      selectedDate,
      times,
      startTimeIndex,
      endTimeIndex,
      selectedPartition,
      timeTableConfig
    ]
  );

  return { getSlotSelected, toggleSlot };
};

export default useSlot;
