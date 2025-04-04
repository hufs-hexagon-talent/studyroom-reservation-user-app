import React, { useMemo } from 'react';
import { useAllUsers } from '../../../api/user.api';
import { useStatics } from '../../../api/reservation.api';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#3b82f6', '#82ca9d', '#ffc658'];

const DashBoardStatics = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: allUsers = [] } = useAllUsers();
  const { data: statics } = useStatics(today);

  const totalReservations = statics?.totalReservations; // 총 예약 수

  const todayReservations = statics?.todayReservations; // 오늘 총 예약 수
  const weeklyReservations = statics?.weeklyReservations; // 주간 총 예약 수
  const monthlyReservations = statics?.monthlyReservations; // 월간 총 예약 수

  const room1TodayReservations = statics?.partitionStatsToday
    .filter(p => p.partitionId >= 1 && p.partitionId <= 4)
    .reduce((sum, cur) => sum + cur.reservationCount, 0); // 306호 오늘 총 예약 수
  const room2TodayReservtions = statics?.partitionStatsToday
    .filter(p => p.partitionId === 5 || p.partitionId === 6)
    .reduce((sum, cur) => sum + cur.reservationCount, 0); // 428호 오늘 총 예약 수

  const room1WeeklyReservations = statics?.partitionStatsWeekly
    .filter(p => p.partitionId >= 1 && p.partitionId <= 4)
    .reduce((sum, cur) => sum + cur.reservationCount, 0); // 306호 주간 총 예약 수
  const room2WeeklyReservations = statics?.partitionStatsWeekly
    .filter(p => p.partitionId === 5 || p.partitionId === 6)
    .reduce((sum, cur) => sum + cur.reservationCount, 0); // 428호 주간 총 예약 수

  const room1MonthlyReservations = statics?.partitionStatsMonthly
    .filter(p => p.partitionId >= 1 && p.partitionId <= 4)
    .reduce((sum, cur) => sum + cur.reservationCount, 0); // 306호 월간 총 예약 수
  const room2MonthlyReservations = statics?.partitionStatsMonthly
    .filter(p => p.partitionId === 5 || p.partitionId === 6)
    .reduce((sum, cur) => sum + cur.reservationCount, 0); // 428호 월간 총 예약 수

  const room1MonthlyReservationMinutes = statics?.partitionStatsMonthly
    .filter(p => p.partitionId >= 1 && p.partitionId <= 4)
    .reduce((sum, cur) => sum + cur.totalReservationMinutes, 0); // 306호 월간 총 사용시간
  const room2MonthlyReservationMinutes = statics?.partitionStatsMonthly
    .filter(p => p.partitionId === 5 || p.partitionId === 6)
    .reduce((sum, cur) => sum + cur.totalReservationMinutes, 0); // 428호 월간 총 사용시간

  const todayRate = ((todayReservations / totalReservations) * 100).toFixed(2);
  const weeklyRate = ((weeklyReservations / totalReservations) * 100).toFixed(
    2,
  );
  const monthlyRate = ((monthlyReservations / totalReservations) * 100).toFixed(
    2,
  );
  const avgReservationsPerUser = (totalReservations / allUsers.length).toFixed(
    2,
  );

  const pieData = [
    { name: '306', value: room1MonthlyReservationMinutes },
    { name: '428', value: room2MonthlyReservationMinutes },
  ];

  const barData = [
    {
      name: 'Reservations',
      Today: todayReservations,
      Weekly: weeklyReservations,
      Monthly: monthlyReservations,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
        {/* #1 전체 이용자 통계 */}
        <div className="bg-white shadow-md rounded-2xl px-6 py-4">
          <div className="text-gray-500 text-sm">전체 이용자 수</div>
          <div className="text-2xl font-bold">{allUsers.length}</div>
        </div>
        {/* #2 예약 수 통계 */}
        <div className="flex flex-row bg-white shadow-md rounded-2xl px-6 py-4 gap-x-10 text-center">
          <div>
            <div className="text-gray-500 text-sm">총 예약 수</div>
            <div className="text-2xl font-bold">{totalReservations}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">오늘 예약 수</div>
            <div className="text-2xl font-bold">{todayReservations}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">주간 예약 수</div>
            <div className="text-2xl font-bold">{weeklyReservations}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">월간 예약 수</div>
            <div className="text-2xl font-bold">{monthlyReservations}</div>
          </div>
        </div>
        {/* #3 1인 평균 예약 통계 */}
        <div className="bg-white shadow-md rounded-2xl px-6 py-4">
          <div className="text-gray-500 text-sm">1인당 평균 예약 수</div>
          <div className="text-2xl font-bold">{avgReservationsPerUser}</div>
        </div>
        {/* #4 평균 예약 통계 */}
        <div className="flex flex-row bg-white shadow-md rounded-2xl px-6 py-4 gap-x-10 text-center">
          <div>
            <div className="text-gray-500 text-sm">오늘 평균 예약</div>
            <div className="text-2xl font-bold">{todayRate}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">주간 평균 예약</div>
            <div className="text-2xl font-bold">{weeklyRate}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">월간 평균 예약</div>
            <div className="text-2xl font-bold">{monthlyRate}</div>
          </div>
        </div>
        {/* #5 오늘 호실 별 예약 수 */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-2">
            호실 별 예약 수 (Today)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                {
                  name: '306호',
                  count: room1TodayReservations,
                },
                {
                  name: '428호',
                  count: room2TodayReservtions,
                },
              ]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#5DADEC" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-rows-2 gap-6 ">
          {/* #6 주간 호실 별 예약 수 */}
          <div className="bg-white shadow-md rounded-2xl px-6 py-4">
            <div className="text-lg font-semibold mb-2">
              주간 호실 별 예약 수
            </div>
            <div className="flex flex-row justify-around items-end text-center">
              <div>
                <div className="text-gray-500 text-lg">306호</div>
                <div className="text-3xl font-bold">
                  {room1WeeklyReservations}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-lg">428호</div>
                <div className="text-3xl font-bold">
                  {room2WeeklyReservations}
                </div>
              </div>
            </div>
          </div>

          {/* #7 월간 호실 별 예약 수 */}
          <div className="bg-white shadow-md rounded-2xl px-6 py-4">
            <div className="text-lg font-semibold mb-2">
              월간 호실 별 예약 수
            </div>
            <div className="flex flex-row justify-around items-end text-center">
              <div>
                <div className="text-gray-500 text-lg">306호</div>
                <div className="text-3xl font-bold">
                  {room1MonthlyReservations}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-lg">428호</div>
                <div className="text-3xl font-bold">
                  {room2MonthlyReservations}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* #8 파이 차트 */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">월간 호실 사용 시간</h2>
        {/* 차트를 부모 컨테이너 크기에 맞게 반응형으로 보여줌 */}
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%" // 중심 좌표
              cy="50%" // 중심 좌표
              outerRadius={80} // 파이의 반지름 크기
              label={({ value, name }) => {
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return `${name}: ${hours}시간 ${minutes}분`;
              }}>
              {pieData.map((entry, index) => (
                // 파이 조각마다 색상 지정
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return [`${hours}시간 ${minutes}분`, `${name}호`]; // 숫자: 문자열 형식
              }}
              wrapperStyle={{ fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* #9 막대 차트 */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">예약 비교</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Today" fill="#3b82f6" />
            <Bar dataKey="Weekly" fill="#82ca9d" />
            <Bar dataKey="Monthly" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashBoardStatics;
