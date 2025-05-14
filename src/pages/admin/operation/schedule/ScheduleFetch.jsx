import React, { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';
import { Table, Modal } from 'flowbite-react';
import {
  fetchDate,
  fetchScheduleByDate,
} from '../../../../api/policySchedule.api';
import { format } from 'date-fns';

const ScheduleFetch = () => {
  const DEPARTMENT_ID = 1;
  const [availableDate, setAvailableDate] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openPolicyModal, setOpenPolicyModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const getDate = async () => {
      const dates = await fetchDate(DEPARTMENT_ID);
      setAvailableDate(dates);
    };
    getDate();
  }, []);

  // 날짜 별 스케줄 로드 함수
  useEffect(() => {
    const loadSchedule = async () => {
      if (openPolicyModal && selectedDate) {
        const data = await fetchScheduleByDate(
          format(new Date(selectedDate), 'yyyy-MM-dd'),
        );
        setSelectedSchedule(data);
      }
    };

    loadSchedule();
  }, [openPolicyModal, selectedDate]);

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
      <div className="bg-white shadow-md p-8 lg:w-1/2 rounded-xl ">
        <div className="font-bold text-xl">현재 운영 정책이 설정된 날짜</div>
        <div className="mt-8">
          <Table className="mx-auto">
            <Table.Body className="divide-y">
              {paginatedDates?.map((date, index) => (
                <Table.Row
                  key={index}
                  className="cursor-pointer bg-white"
                  onClick={() => {
                    setSelectedDate(date);
                    setOpenPolicyModal(true);
                  }}>
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

      {/* Modal */}
      <Modal
        show={openPolicyModal}
        onClose={() => {
          setOpenPolicyModal(false);
          setSelectedSchedule([]);
        }}
        className="flex justify-center items-center">
        <Modal.Header>
          상세 정보 (
          {selectedDate ? format(new Date(selectedDate), 'yyyy-MM-dd') : ''})
        </Modal.Header>
        <Modal.Body>
          {selectedSchedule.length > 0 ? (
            <div className="flex flex-col gap-2 text-gray-800">
              {selectedSchedule.map((item, idx) => (
                <div key={idx} className="p-2 border rounded">
                  <div>
                    호실 ID: <strong>{item.roomId}</strong>
                  </div>
                  <div>
                    정책 ID: <strong>{item.roomOperationPolicyId}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">스케줄 정보가 없습니다.</div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ScheduleFetch;
