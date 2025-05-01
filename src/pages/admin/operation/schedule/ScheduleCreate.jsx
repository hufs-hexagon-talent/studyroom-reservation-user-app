import React, { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';
import { Table } from 'flowbite-react';
import { fetchDate } from '../../../../api/policySchedule.api';
import { useAllPolicies } from '../../../../api/roomOperationPolicy.api';
import MyDatePicker from '../../../../components/schedule/MyDatePicker';
import SelectRoom from '../../../../components/schedule/SelectRoom';
import CheckPolicy from '../../../../components/schedule/CheckPolicy';
import { format } from 'date-fns';

const ScheduleCreate = () => {
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
      <div className="font-bold text-3xl text-black px-4 py-8">
        Create Schedule
      </div>
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
      </div>
    </div>
  );
};

export default ScheduleCreate;
