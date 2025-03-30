import React from 'react';
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

  if (!statics) return null;

  const {
    totalReservations,
    todayReservations,
    weeklyReservations,
    monthlyReservations,
  } = statics;

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
    { name: 'Today', value: todayReservations },
    { name: 'Weekly', value: weeklyReservations },
    { name: 'Monthly', value: monthlyReservations },
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
      </div>

      {/* 파이 차트 */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">예약 비율</h2>
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
              label>
              {pieData.map((entry, index) => (
                // 파이 조각마다 색상 지정
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 막대 차트 */}
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
