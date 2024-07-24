import React, { useState } from 'react';
import { Checkbox, Table, Button } from 'flowbite-react';
import { useAllPolicies, useAllRooms } from '../../api/user.api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const Schedule = () => {
  const { data: policies, refetch } = useAllPolicies();
  const { data: rooms } = useAllRooms();
  const [isFetched, setIsFetched] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);

  registerLocale('ko', ko);

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
      updatedDates.map(d => format(d, 'yyyy-MM-dd')).join(', '),
    );
  };

  const handleButton = () => {};

  return (
    <div className="p-4">
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
        <div className="w-1/2 pr-4">
          <div className="pt-10 font-bold text-lg">날짜 선택</div>
          <div className="text-sm py-3">
            선택된 날짜 :{' '}
            {selectedDates.map(d => format(d, 'yyyy-MM-dd')).join(', ')}
          </div>
          <div>
            <DatePicker
              locale={ko}
              dateFormat="yyyy년 MM월 dd일"
              selected={null}
              onChange={handleDateChange}
              inline
              highlightDates={selectedDates}
            />
          </div>
        </div>
        <div className="border-l border-gray-300"></div>
        <div className="w-1/2 pl-10">
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
                  {room.roomName}
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
