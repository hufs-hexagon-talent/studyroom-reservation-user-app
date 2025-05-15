export const parseStatics = (statics, allUsers) => {
  const room1Partitions = [1, 2, 3, 4];
  const room2Partitions = [5, 6];

  // 예약 수 합계
  const sumReservations = (stats, partitions) =>
    stats
      ?.filter(p => partitions.includes(p.partitionId))
      .reduce((sum, cur) => sum + cur.reservationCount, 0) || 0;

  // 예약 시간 합계
  const sumMinutes = (stats, partitions) =>
    stats
      ?.filter(p => partitions.includes(p.partitionId))
      .reduce((sum, cur) => sum + cur.totalReservationMinutes, 0) || 0;

  // 총 예약 수
  const totalReservations = statics?.partitionStatsTotal.reduce(
    (sum, cur) => sum + cur.reservationCount,
    0,
  );
  // 오늘 총 예약 수
  const todayReservations = statics?.partitionStatsToday.reduce(
    (sum, cur) => sum + cur.reservationCount,
    0,
  );
  // 주간 총 예약 수
  const weeklyReservations = statics?.partitionStatsWeekly.reduce(
    (sum, cur) => sum + cur.reservationCount,
    0,
  );
  // 월간 총 예약 수
  const monthlyReservations = statics?.partitionStatsMonthly.reduce(
    (sum, cur) => sum + cur.reservationCount,
    0,
  );

  // 306호 오늘 총 예약 수
  const room1TodayReservations = sumReservations(
    statics?.partitionStatsToday,
    room1Partitions,
  );

  // 428호 오늘 총 예약 수
  const room2TodayReservations = sumReservations(
    statics?.partitionStatsToday,
    room2Partitions,
  );

  // 파티션별 예약 수 객체 생성 함수
  const getPartitionCounts = (stats, partitions) => {
    const map = {};
    partitions.forEach(pid => {
      const entry = stats.find(p => p.partitionId === pid);
      map[pid] = entry ? entry.reservationCount : 0;
    });
    return map;
  };

  // 306호 파티션 별 오늘 예약 수
  const room1PartitionTodayReservations = getPartitionCounts(
    statics?.partitionStatsToday || [],
    room1Partitions,
  );

  // 428호 파티션 별 오늘 예약 수
  const room2PartitionTodayReservations = getPartitionCounts(
    statics?.partitionStatsToday || [],
    room2Partitions,
  );

  // 306호 주간 총 예약 수
  const room1WeeklyReservations = sumReservations(
    statics?.partitionStatsWeekly,
    room1Partitions,
  );

  // 428호 주간 총 예약 수
  const room2WeeklyReservations = sumReservations(
    statics?.partitionStatsWeekly,
    room2Partitions,
  );

  // 306호 월간 총 예약 수
  const room1MonthlyReservations = sumReservations(
    statics?.partitionStatsMonthly,
    room1Partitions,
  );
  // 428호 월간 총 예약 수
  const room2MonthlyReservations = sumReservations(
    statics?.partitionStatsMonthly,
    room2Partitions,
  );

  // 306호 월간 총 사용시간
  const room1MonthlyReservationMinutes = sumMinutes(
    statics?.partitionStatsMonthly,
    room1Partitions,
  );
  // 428호 월간 총 사용시간
  const room2MonthlyReservationMinutes = sumMinutes(
    statics?.partitionStatsMonthly,
    room2Partitions,
  );

  // 사용자 평균 예약 수
  const avgReservationsPerUser = (totalReservations / allUsers.length).toFixed(
    2,
  );

  return {
    totalReservations,
    todayReservations,
    weeklyReservations,
    monthlyReservations,
    room1TodayReservations,
    room2TodayReservations,
    room1WeeklyReservations,
    room2WeeklyReservations,
    room1MonthlyReservations,
    room2MonthlyReservations,
    room1MonthlyReservationMinutes,
    room2MonthlyReservationMinutes,
    avgReservationsPerUser,
    room1PartitionTodayReservations,
    room2PartitionTodayReservations,
  };
};
