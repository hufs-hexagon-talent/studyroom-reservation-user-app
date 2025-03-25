import React, { useState, useEffect } from 'react';

import { Table } from 'flowbite-react';
import { fetchDate } from '../../../api/policySchedule.api';
import { useAllPolicies } from '../../../api/roomOperationPolicy.api';

import MyDatePicker from './DatePicker';
import SelectRoom from './SelectRoom';
import CheckPolicy from './CheckPolicy';
import { format } from 'date-fns';

const DashBoardSchedule = () => {
  const DEPARTMENT_ID = 1;
  const [availableDate, setAvailableDate] = useState([]);

  const { data: policies } = useAllPolicies();

  // 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
  useEffect(() => {
    const getDate = async () => {
      const dates = await fetchDate(DEPARTMENT_ID);
      setAvailableDate(dates);
    };
    getDate();
  }, []);

  return (
    <div className="flex flex-row gap-x-6">
      {/* 스케줄 설정 */}
      <div className="bg-white inline-block rounded-xl mb-8 shadow-xl scale-95 hover:scale-100 transition-transform duration-200 ease-in-out">
        <div className="flex justify-center items-center font-bold py-6">
          스케줄 설정
        </div>
        <div className="px-4 pb-2">
          <SelectRoom />
          <MyDatePicker />
          <CheckPolicy />
        </div>
      </div>
      {/* 현재 운영 정책이 설정된 날짜 */}
      <div className="bg-white rounded-xl mb-8 shadow-xl scale-95 hover:scale-100 transition-transform duration-200 ease-in-out">
        <div className="flex justify-center text-center items-center font-bold py-6 px-10">
          현재 운영 정책이 설정된 날짜
        </div>
        <div className="max-h-80 overflow-y-auto px-4">
          <Table className="mx-auto items-center flex justify-center">
            <Table.Body className="divide-y">
              {availableDate.map((date, index) => (
                <Table.Row key={index} className="bg-white">
                  <Table.Cell className="text-gray-600">
                    {format(date, 'yyyy년 MM월 dd일')}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
      {/* 스케줄 삭제 */}
      <div className="bg-white inline-block rounded-xl mb-8 shadow-xl scale-95 hover:scale-100 transition-transform duration-200 ease-in-out">
        <div className="flex justify-center items-center font-bold py-6">
          스케줄 삭제
        </div>
        <div className="px-4 pb-2">
          <Table>
            <Table.Head className="text-center">
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell>Policy ID</Table.HeadCell>
              <Table.HeadCell>운영 시작 시간</Table.HeadCell>
              <Table.HeadCell>운영 종료 시간</Table.HeadCell>
              <Table.HeadCell>최대 사용 시간(분)</Table.HeadCell>
            </Table.Head>
            <Table.Body className="text-center divide-y">
              {policies?.data.operationPolicyInfos.map(policy => (
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
  );
};

export default DashBoardSchedule;
