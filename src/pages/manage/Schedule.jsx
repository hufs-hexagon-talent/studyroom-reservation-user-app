import React, { useState } from 'react';
import { Checkbox, Table, Button } from 'flowbite-react';
import { useAllPolicies, useAllRooms, useSchedules } from '../../api/user.api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko, tr } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useSnackbar } from 'react-simple-snackbar';

const Schedule = () => {
  const { data: policies, refetch } = useAllPolicies();
  const { data: rooms } = useAllRooms();
  const { mutateAsync: doSchedule } = useSchedules();
  const [isFetched, setIsFetched] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  registerLocale('ko', ko);

  const [openErrorSnackbar, closeErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });
  const [openSuccessSnackbar, closeSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
    },
  });

  const handleFetchPolicies = () => {
    refetch().then(() => {
      setIsFetched(true);
      setIsTableVisible(true);
    });
  };

  const handleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  const handlePolicyCheckBox = policyId => {
    setSelectedPolicyId(policyId === selectedPolicyId ? null : policyId);
    console.log(selectedPolicyId);
  };

  const handleRoomCheckbox = roomId => {
    setSelectedRooms(prevSelectedRooms =>
      prevSelectedRooms.includes(roomId)
        ? prevSelectedRooms.filter(id => id !== roomId)
        : [...prevSelectedRooms, roomId],
    );
    console.log('Selected rooms:', selectedRooms);
  };

  const handleDateChange = date => {
    let updatedDates;
    if (
      selectedDates.some(
        d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
      )
    ) {
      updatedDates = selectedDates.filter(
        d => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd'),
      );
    } else {
      updatedDates = [...selectedDates, date];
    }
    setSelectedDates(updatedDates);
    console.log(
      'Selected dates:',
      updatedDates.map(d => format(d, 'yyyy-MM-dd')),
    );
  };

  const handleButton = async () => {
    // console.log(
    //   selectedPolicyId,
    //   selectedRooms,
    //   selectedDates.map(d => format(d, 'yyyy-MM-dd')),
    // );
    if (
      !selectedPolicyId ||
      selectedRooms.length === 0 ||
      selectedDates.length === 0
    ) {
      openErrorSnackbar('정책, 날짜, 그리고 호실을 모두 선택해야 합니다.');
      setTimeout(() => {
        closeErrorSnackbar();
      }, 3000);
      return;
    }
    try {
      const response = await doSchedule({
        roomOperationPolicyId: selectedPolicyId,
        roomIds: selectedRooms,
        policyApplicationDates: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
      });
      openSuccessSnackbar(response.message);
      setTimeout(() => {
        closeSuccessSnackbar();
      }, 3000);
    } catch (error) {
      openErrorSnackbar(
        error.response?.data?.errorMessage ||
          '스케줄 주입 중 오류가 발생했습니다.',
      );
      setTimeout(() => {
        closeErrorSnackbar();
      }, 3000);
    }
  };

  return (
    <div className="p-4">
      {/* room Policy 조회 */}
      <div className="flex flex-row items-center">
        <div>모든 room Policy 조회 및 선택</div>
        <button
          className="bg-gray-700 text-white px-3 py-2 ml-8 text-xs rounded"
          onClick={handleFetchPolicies}>
          조회
        </button>
      </div>
      {isFetched && isTableVisible && policies && (
        <div className="overflow-x-auto mt-4">
          <Table>
            <Table.Head className="text-center">
              <Table.HeadCell>선택</Table.HeadCell>
              <Table.HeadCell>Policy ID</Table.HeadCell>
              <Table.HeadCell>운영 시작 시간</Table.HeadCell>
              <Table.HeadCell>운영 종료 시간</Table.HeadCell>
              <Table.HeadCell>최대 사용 시간(분)</Table.HeadCell>
            </Table.Head>
            <Table.Body className="text-center divide-y">
              {policies.data.items.map(policy => (
                <Table.Row
                  key={policy.policyId}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="p-4">
                    <Checkbox
                      checked={selectedPolicyId === policy.policyId}
                      onChange={() => handlePolicyCheckBox(policy.policyId)}
                    />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {policy.policyId}
                  </Table.Cell>
                  <Table.Cell>{policy.operationStartTime}</Table.Cell>
                  <Table.Cell>{policy.operationEndTime}</Table.Cell>
                  <Table.Cell>{policy.eachMaxMinute}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <div className="mt-2 cursor-pointer" onClick={handleTableVisibility}>
            간략히 &gt;
          </div>
        </div>
      )}
      <div className="flex flex-row justify-between">
        {/* 날짜 선택 */}
        <div className="w-1/2 pr-4">
          <div className="flex justify-center pt-10 font-bold text-lg">
            날짜 선택
          </div>
          <div className="text-sm py-3">
            선택된 날짜 :{' '}
            {selectedDates
              .sort((a, b) => a - b)
              .map(d => format(d, 'yyyy-MM-dd'))
              .join(', ')}
          </div>

          <div className="flex justify-center">
            <DatePicker
              locale={ko}
              dateFormat="yyyy년 MM월 dd일"
              selected={null}
              onChange={handleDateChange}
              inline
              highlightDates={selectedDates}
              showIcon
            />
          </div>
        </div>
        <div className="border-l border-gray-300"></div>
        {/* 호실 선택 */}
        <div className="flex items-center flex-col w-1/2">
          <div className="pt-10 pb-6 font-bold text-lg">호실 선택</div>
          <div>
            {rooms?.map(room => (
              <div key={room.roomId} className="flex items-center mb-3">
                <Checkbox
                  id={room.roomId}
                  checked={selectedRooms.includes(room.roomId)}
                  onChange={() => handleRoomCheckbox(room.roomId)}
                />
                <label htmlFor={room.roomId} className="ml-2">
                  {room.roomName}호
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-10">
        <Button
          onClick={handleButton}
          color="dark"
          className="w-full max-w-lg px-3 py-2 text-sm">
          스케줄 주입
        </Button>
      </div>
    </div>
  );
};

export default Schedule;
