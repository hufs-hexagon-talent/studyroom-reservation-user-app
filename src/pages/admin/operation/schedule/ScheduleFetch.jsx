import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '@mui/material';
import { Table, Modal, Checkbox, Button } from 'flowbite-react';
import {
  fetchDate,
  fetchScheduleByDate,
  useUpdateSchedule,
  useDeleteSchedule,
} from '../../../../api/policySchedule.api';
import { format } from 'date-fns';

const ScheduleFetch = () => {
  const DEPARTMENT_ID = 1;
  const navigate = useNavigate();

  const [availableDate, setAvailableDate] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [openPolicyModal, setOpenPolicyModal] = useState(false);
  const itemsPerPage = 5;

  const { mutateAsync: updateSchedule } = useUpdateSchedule();
  const { mutateAsync: deleteSchedule } = useDeleteSchedule();

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
              {paginatedDates?.map((date, index) => {
                const formattedDate = format(date, 'yyyy-MM-dd'); // ← 세미콜론 필수

                return (
                  <Table.Row
                    key={index}
                    className="cursor-pointer bg-white"
                    onClick={() => {
                      setSelectedDate(date);
                      navigate(`/divide/schedule/fetch/${formattedDate}`);
                      // setOpenPolicyModal(true);
                    }}>
                    <Table.Cell className="text-gray-600 text-lg">
                      {format(date, 'yyyy년 MM월 dd일')}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
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

      {/* 스케줄 수정 모달 */}
      <Modal
        show={openPolicyModal}
        onClose={() => {
          setOpenPolicyModal(false);
          setSelectedSchedule([]);
        }}
        className="flex justify-center items-center">
        <Modal.Header>
          <div className="flex flex-row justify-between">
            <div>
              스케줄 정보 (
              {selectedDate
                ? format(new Date(selectedDate), 'yyyy-MM-dd')
                : '-'}
              )
            </div>
            {selectedScheduleId && (
              <div className="flex space-x-2">
                <Button color="dark">수정</Button>
                <Button color="dark">삭제</Button>
              </div>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedSchedule?.length > 0 ? (
            <div className="flex flex-col gap-2 text-gray-800">
              <Table className="text-center">
                <Table.Head className="text-center break-keep">
                  <Table.HeadCell></Table.HeadCell>
                  <Table.HeadCell>스케줄 ID</Table.HeadCell>
                  <Table.HeadCell>호실명</Table.HeadCell>
                  <Table.HeadCell>정책 ID</Table.HeadCell>
                  <Table.HeadCell>시작 시각</Table.HeadCell>
                  <Table.HeadCell>종료 시각</Table.HeadCell>
                  <Table.HeadCell>최대 이용 시각</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {selectedSchedule?.map(schedule => (
                    <Table.Row key={schedule.scheduleId}>
                      <Table.Cell>
                        <Checkbox
                          onChange={() => {
                            setSelectedScheduleId(prev =>
                              prev === schedule.scheduleId
                                ? null
                                : schedule.scheduleId,
                            );
                          }}
                          className="rounded-none text-[#1D2430] focus:ring-[#1D2430] cursor-pointer"
                        />
                      </Table.Cell>
                      <Table.Cell>{schedule.scheduleId}</Table.Cell>
                      <Table.Cell>{schedule.roomName}</Table.Cell>
                      <Table.Cell>{schedule.policyId}</Table.Cell>
                      <Table.Cell>{schedule.operationStartTime}</Table.Cell>
                      <Table.Cell>{schedule.operationEndTime}</Table.Cell>
                      <Table.Cell>{schedule.eachMaxMinute}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
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
