import React, { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';
import { Table } from 'flowbite-react';
import { fetchDate } from '../../../../api/policySchedule.api';
import { useAllPolicies } from '../../../../api/roomOperationPolicy.api';
import { format } from 'date-fns';

const ScheduleFetch = () => {
  const DEPARTMENT_ID = 1;
  const [availableDate, setAvailableDate] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
        Fetch Schedule
      </div>
      {/* 현재 운영 정책이 설정된 날짜 */}
      <div className="bg-white p-8 lg:w-1/2 rounded-xl ">
        <div className="font-bold text-xl">현재 운영 정책이 설정된 날짜</div>
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
    </div>
  );
};

export default ScheduleFetch;
