import React, { useState, useEffect } from 'react';
import { Button, Table } from 'flowbite-react';
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
      <div className="flex justify-between items-center">
        <div className="font-bold text-3xl text-black px-4 py-8">
          Delete Schedule
        </div>
        <Button color="dark">삭제</Button>
      </div>
      <div className="bg-white rounded-xl">
        <div>todo</div>
      </div>
    </div>
  );
};

export default ScheduleDelete;
