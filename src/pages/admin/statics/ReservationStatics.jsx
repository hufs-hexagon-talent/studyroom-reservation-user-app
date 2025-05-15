import React, { useState } from 'react';
import { useReservationStatics } from '../../../api/reservation.api';
import { usePartition } from '../../../api/roomPartition.api';
import { parseStatics } from '../../../utils/statics.utils';
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
import { Modal, ModalBody, ModalHeader, Table } from 'flowbite-react';

const COLORS = ['#DB4437', '#F4B400', '#0F9D58', '#4285F4'];

const ReservationStatics = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedRoomName, setSelectedRoomName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showReservationMinutesModal, setShowReservationMinutesModal] =
    useState(false);
  const { data: reservationStatics } = useReservationStatics(today);

  const {
    room1Partitions,
    room2Partitions,
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
    room1PartitionTodayReservations,
    room2PartitionTodayReservations,
    room1PartitionWeeklyReservations,
    room2PartitionWeeklyReservations,
    room1PartitionMonthlyReservations,
    room2PartitionMonthlyReservations,
    room1PartitionMonthlyReservationsMinutes,
    room2PartitionMonthlyReservationsMinutes,
  } = parseStatics(reservationStatics);

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

  // room1에 대한 partition 정보
  const { data: room1PartitionsInfo = [] } = usePartition(room1Partitions);

  // room2에 대한 partition 정보
  const { data: room2PartitionsInfo = [] } = usePartition(room2Partitions);

  // 파티션ID -> 파티션 Number로 매핑
  const partitionNumberMap = {};
  [...room1PartitionsInfo, ...room2PartitionsInfo].forEach(p => {
    partitionNumberMap[p.roomPartitionId] = p.partitionNumber;
  });

  // 오늘 예약 데이터 배열 형태로 변환
  const convertToTodayData = partitionObj =>
    Object.entries(partitionObj).map(([partitionId, count]) => {
      const partitionNumber = partitionNumberMap[partitionId];
      return { partition: `${selectedRoomName}-${partitionNumber}`, count };
    });

  // 조건에 따라 오늘 예약 데이터 선택
  const selectedTodayData =
    selectedRoomId === 1
      ? convertToTodayData(room1PartitionTodayReservations)
      : selectedRoomId === 2
        ? convertToTodayData(room2PartitionTodayReservations)
        : [];

  // 주간 예약 데이터 배열 형태로 변환
  const convertToWeekData = partitionObj =>
    Object.entries(partitionObj).map(([partitionId, count]) => {
      const partitionNumber = partitionNumberMap[partitionId];
      return { partition: partitionNumber, count };
    });

  // 조건에 따라 주간 예약 데이터 선택
  const selectedWeeklyData =
    selectedRoomName === '306'
      ? convertToWeekData(room1PartitionWeeklyReservations)
      : selectedRoomName === '428'
        ? convertToWeekData(room2PartitionWeeklyReservations)
        : [];

  // 월간 예약 데이터 배열 형태로 변환
  const convertToMonthData = partitionObj =>
    Object.entries(partitionObj).map(([partitionId, count]) => {
      const partitionNumber = partitionNumberMap[partitionId];
      return { partition: partitionNumber, count };
    });

  // 조건에 따라 월간 예약 데이터 선택
  const selectedMonthlyData =
    selectedRoomName === '306'
      ? convertToMonthData(room1PartitionMonthlyReservations)
      : selectedRoomName === '428'
        ? convertToMonthData(room2PartitionMonthlyReservations)
        : [];

  // 월간 예약 시간 데이터 배열 형태로 변환
  const convertToMonthReservationMinutesData = partitionObj =>
    Object.entries(partitionObj).map(([partitionId, minutes]) => {
      const partitionNumber = partitionNumberMap[partitionId];
      return { name: `${selectedRoomName}-${partitionNumber}`, value: minutes };
    });

  // 조건에 따라 월간 예약 시간 데이터 선택
  const selectedMonthlyReservationMintesData =
    selectedRoomName === '306'
      ? convertToMonthReservationMinutesData(
          room1PartitionMonthlyReservationsMinutes,
        )
      : selectedRoomName === '428'
        ? convertToMonthReservationMinutesData(
            room2PartitionMonthlyReservationsMinutes,
          )
        : [];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <div className="font-bold text-3xl text-black p-8">
          Reservation Statics
        </div>

        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          {/* 호실 별 예약 수 (Today)*/}
          <div className="bg-white shadow-md rounded-2xl p-4">
            <h2 className="text-lg font-bold mb-2">호실 별 예약 수 (Today)</h2>
            <div className="flex justify-center items-end h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: '306호',
                      roomName: '306',
                      roomId: 1,
                      count: room1TodayReservations,
                    },
                    {
                      name: '428호',
                      roomName: '428',
                      roomId: 2,
                      count: room2TodayReservations,
                    },
                  ]}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  onClick={data => {
                    const roomName =
                      data?.activePayload?.[0]?.payload?.roomName;
                    const roomId = data?.activePayload?.[0]?.payload?.roomId;
                    if (roomName) {
                      setSelectedRoomName(roomName);
                      setSelectedRoomId(roomId);
                      setShowTodayModal(true);
                    }
                  }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4285F4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-rows-3 gap-6 ">
            {/* 예약 수 통계 */}
            <div className="bg-white shadow-md rounded-2xl px-6 py-4">
              <div className="text-lg font-semibold mb-2">
                시간 별 예약 수 통계
              </div>
              <div className="flex flex-row text-center items-center justify-center gap-x-10">
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
                  <div className="text-2xl font-bold">
                    {monthlyReservations}
                  </div>
                </div>
              </div>
            </div>

            {/* 주간 호실 별 예약 수 */}
            <div className="bg-white shadow-md rounded-2xl px-6 py-4">
              <div className="text-lg font-semibold mb-2">
                주간 호실 별 예약 수
              </div>
              <div className="flex flex-row justify-around items-end text-center">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowWeekModal(true);
                    setSelectedRoomName('306');
                  }}>
                  <div className="text-gray-500 text-lg">306호</div>
                  <div className="text-3xl font-bold">
                    {room1WeeklyReservations}
                  </div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowWeekModal(true);
                    setSelectedRoomName('428');
                  }}>
                  <div className="text-gray-500 text-lg">428호</div>
                  <div className="text-3xl font-bold">
                    {room2WeeklyReservations}
                  </div>
                </div>
              </div>
            </div>

            {/* 월간 호실 별 예약 수 */}
            <div className="bg-white shadow-md rounded-2xl px-6 py-4">
              <div className="text-lg font-semibold mb-2">
                월간 호실 별 예약 수
              </div>
              <div className="flex flex-row justify-around items-end text-center">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowMonthModal(true);
                    setSelectedRoomName('306');
                  }}>
                  <div className="text-gray-500 text-lg">306호</div>
                  <div className="text-3xl font-bold">
                    {room1MonthlyReservations}
                  </div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowMonthModal(true);
                    setSelectedRoomName('428');
                  }}>
                  <div className="text-gray-500 text-lg">428호</div>
                  <div className="text-3xl font-bold">
                    {room2MonthlyReservations}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 월간 호실 사용 시간 파이 차트 */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-2">월간 호실 사용 시간</h2>
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
                }}
                onClick={(data, index) => {
                  const roomName = data?.name;
                  if (roomName === '306' || roomName === '428') {
                    setSelectedRoomName(roomName);
                    setShowReservationMinutesModal(true);
                  }
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

        {/* 막대 차트 */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-2">예약 비교</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Today" fill="#DB4437" />
              <Bar dataKey="Weekly" fill="#F4B400" />
              <Bar dataKey="Monthly" fill="#0F9D58" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal Component */}

      {/* 호실 - 파티션 별 예약 수 (Today) 모달 */}
      <Modal show={showTodayModal} onClose={() => setShowTodayModal(false)}>
        <ModalHeader>{selectedRoomName}호 파티션 별 금일 예약 수</ModalHeader>
        <ModalBody>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={selectedTodayData}>
              <XAxis dataKey="partition" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </ModalBody>
      </Modal>

      {/* 호실 - 파티션 별 예약 수 (Week) 모달 */}
      <Modal show={showWeekModal} onClose={() => setShowWeekModal(false)}>
        <ModalHeader>{selectedRoomName}호 파티션 별 주간 예약 수</ModalHeader>
        <ModalBody>
          <Table>
            <Table.Head>
              <Table.HeadCell>파티션</Table.HeadCell>
              <Table.HeadCell>예약 수</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {selectedWeeklyData?.map(row => (
                <Table.Row key={row.partition} className="bg-white">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                    {selectedRoomName}-{row.partition}
                  </Table.Cell>
                  <Table.Cell>{row.count}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </ModalBody>
      </Modal>

      {/* 호실 - 파티션 별 예약 수 (Month) 모달 */}
      <Modal show={showMonthModal} onClose={() => setShowMonthModal(false)}>
        <ModalHeader>{selectedRoomName}호 파티션 별 월간 예약 수</ModalHeader>
        <ModalBody>
          <Table>
            <Table.Head>
              <Table.HeadCell>파티션</Table.HeadCell>
              <Table.HeadCell>예약 수</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {selectedMonthlyData?.map(row => (
                <Table.Row key={row.partition} className="bg-white">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                    {selectedRoomName}-{row.partition}
                  </Table.Cell>
                  <Table.Cell>{row.count}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </ModalBody>
      </Modal>

      {/* 호실 - 파티션 별 월간 호실 사용 시간 모달 */}
      <Modal
        show={showReservationMinutesModal}
        onClose={() => setShowReservationMinutesModal(false)}>
        <ModalHeader>{selectedRoomName}호 파티션 별 월간 사용 시간</ModalHeader>
        <ModalBody>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={selectedMonthlyReservationMintesData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => {
                  const hours = Math.floor(value / 60);
                  const minutes = value % 60;
                  return `${name}: ${hours}시간 ${minutes}분`;
                }}>
                {selectedMonthlyReservationMintesData?.map((entry, index) => (
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
                  return [`${hours}시간 ${minutes}분`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ReservationStatics;
