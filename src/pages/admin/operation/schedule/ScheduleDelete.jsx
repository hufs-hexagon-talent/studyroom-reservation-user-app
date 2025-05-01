import React, { useState, useEffect } from 'react';
import { Table } from 'flowbite-react';
import { fetchDate } from '../../../../api/policySchedule.api';
import { useAllPolicies } from '../../../../api/roomOperationPolicy.api';

const ScheduleDelete = () => {
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

  // todo: delete schedule api

  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">
        Delete Schedule
      </div>
      <div className="bg-white rounded-xl">
        <div className="px-4 py-8">
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
  );
};

export default ScheduleDelete;
