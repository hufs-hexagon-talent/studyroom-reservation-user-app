import React, { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';
import { Table } from 'flowbite-react';
import { fetchDate } from '../../../../api/policySchedule.api';
import { useAllPolicies } from '../../../../api/roomOperationPolicy.api';
import MyDatePicker from './DatePicker';
import SelectRoom from './SelectRoom';
import CheckPolicy from './CheckPolicy';
import { format } from 'date-fns';

const ScheduleManagement = () => {
  const DEPARTMENT_ID = 1;
  const [availableDate, setAvailableDate] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: policies } = useAllPolicies();

  // 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
  useEffect(() => {
    const getDate = async () => {
      const dates = await fetchDate(DEPARTMENT_ID);
      setAvailableDate(dates);
    };
    getDate();
  }, []);

  // 페이지네이션
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDates = availableDate?.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(availableDate.length / itemsPerPage);

  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">Schedule</div>
      <div className="flex flex-col gap-y-6">
        {/* 스케줄 설정 */}
        <div className="bg-white rounded-xl hover:shadow-2xl px-6 pt-4 pb-8">
          <div className="font-bold py-6 px-6 text-xl">스케줄 설정</div>
          <div className="px-4 pb-2">
            <SelectRoom
              selectedRooms={selectedRooms}
              setSelectedRooms={setSelectedRooms}
              selectedDates={selectedDates}
              selectedPolicyId={selectedPolicyId}
            />
            <div className="flex flex-row gap-x-20">
              <MyDatePicker
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
              />
              <CheckPolicy
                selectedPolicyId={selectedPolicyId}
                setSelectedPolicyId={setSelectedPolicyId}
              />
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          {/* 현재 운영 정책이 설정된 날짜 */}
          <div className="bg-white p-8 rounded-xl hover:shadow-2xl">
            <div className="font-bold text-xl">
              현재 운영 정책이 설정된 날짜
            </div>
            <div className="mt-8">
              <Table className="mx-auto">
                <Table.Body className="divide-y">
                  {paginatedDates?.map((date, index) => (
                    <Table.Row key={index} className="bg-white">
                      <Table.Cell className="text-gray-600 text-lg">
                        {format(date, 'yyyy년 MM월 dd일')}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              <div className="flex justify-center mt-4">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  shape="rounded"
                />
              </div>
            </div>
          </div>

          {/* 스케줄 삭제 */}
          <div className="bg-white rounded-xl hover:shadow-2xl">
            <div className="font-bold p-8 text-xl">스케줄 삭제</div>
            <div className="px-4 pb-4">
              <Table>
                <Table.Head className="text-center">
                  <Table.HeadCell></Table.HeadCell>
                  <Table.HeadCell>Policy ID</Table.HeadCell>
                  <Table.HeadCell>운영 시작 시간</Table.HeadCell>
                  <Table.HeadCell>운영 종료 시간</Table.HeadCell>
                  <Table.HeadCell>최대 사용 시간(분)</Table.HeadCell>
                </Table.Head>
                <Table.Body className="text-center divide-y">
                  {policies?.map(policy => (
                    <Table.Row
                      key={policy.roomOperationPolicyId}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="p-4">
                        <div className="text-red-600 cursor-pointer hover:underline">
                          삭제
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {policy.roomOperationPolicyId}
                      </Table.Cell>
                      <Table.Cell>{policy.operationStartTime}</Table.Cell>
                      <Table.Cell>{policy.operationEndTime}</Table.Cell>
                      <Table.Cell>{policy.eachMaxMinute}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
