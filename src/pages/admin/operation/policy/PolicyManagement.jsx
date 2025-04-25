import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Table, TableBody } from 'flowbite-react';
import {
  useCreatePolicy,
  useAllPolicies,
} from '../../../../api/roomOperationPolicy.api';
import { useSnackbar } from 'react-simple-snackbar';
import RightArrow from '../../../../assets/icons/right_arrow.png';
import UnderArrow from '../../../../assets/icons/under_arrow_black.png';

const PolicyManagement = () => {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [eachMaxMinute, setEachMaxMinute] = useState(60);
  const [isGetPolicies, setIsGetPolicies] = useState(false);
  const { mutateAsync: doCreatePolicy } = useCreatePolicy();
  const { data: policies } = useAllPolicies();

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
    },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });

  // 정책 생성
  const createPolicy = async () => {
    try {
      const response = await doCreatePolicy({
        operationStartTime: format(startTime, 'HH:mm:ss'),
        operationEndTime: format(endTime, 'HH:mm:ss'),
        eachMaxMinute: eachMaxMinute,
      });
      console.log(response.message);
      openSuccessSnackbar('정책이 생성 되었습니다.', 3000);
      console.log(startTime, endTime, eachMaxMinute);
    } catch (error) {
      console.log(error);
      openErrorSnackbar(
        error.response?.data?.message || '정책 생성 중 오류가 발생하였습니다.',
        3000,
      );
    }
  };

  // 정책 조회
  const getPolicy = () => {
    setIsGetPolicies(true);
  };

  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">
        Policy Management
      </div>

      <div className="bg-white p-8 inline-block rounded-xl mb-8 hover:shadow-lg w-full">
        <div className="flex flex-row items-center px-4 pb-8">
          <div className="text-xl font-bold">정책 생성</div>
          <Button
            onClick={createPolicy}
            className="ml-4 bg-gray-300 cursor-pointer">
            <img className="w-4 h-4" src={RightArrow} />
          </Button>
        </div>
        <div className="space-y-8 px-4">
          {/* 시작 시각 */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">시작 시각 :</label>
            <DatePicker
              selected={startTime}
              onChange={date => setStartTime(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeCaption="시간"
              dateFormat="HH:mm:ss"
              className="border p-2 rounded-md"
            />
          </div>
          {/* 종료 시각 */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">종료 시각 :</label>
            <DatePicker
              selected={endTime}
              onChange={date => setEndTime(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeCaption="시간"
              dateFormat="HH:mm:ss"
              className="border p-2 rounded-md"
            />
          </div>
          {/* 최대 예약 가능 시간 */}
          <div className="flex flex-row gap-x-4">
            <div>최대 예약 가능 시간 : </div>
            <input
              value={eachMaxMinute}
              onChange={e => setEachMaxMinute(e.target.value)}
              type="number"
              className="border p-2 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 inline-block rounded-xl mb-8 hover:shadow-lg w-full">
        <div className="flex flex-row items-center">
          <div className="text-xl p-6 font-bold">모든 정책 조회</div>
          <Button
            onClick={getPolicy}
            className="my-8 ml-4 bg-gray-300 text-black cursor-pointer">
            <img className="w-4 h-4" src={UnderArrow} />
          </Button>
        </div>
        {isGetPolicies && (
          <div>
            <Table className="text-center">
              <Table.Head>
                <Table.HeadCell>정책 ID</Table.HeadCell>
                <Table.HeadCell>시작 시각</Table.HeadCell>
                <Table.HeadCell>종료 시각</Table.HeadCell>
                <Table.HeadCell>최대 이용 시간</Table.HeadCell>
              </Table.Head>
              <TableBody>
                {policies?.map(policy => (
                  <Table.Row key={policy.roomOperationPolicyId}>
                    <Table.Cell>{policy.roomOperationPolicyId}</Table.Cell>
                    <Table.Cell>{policy.operationStartTime}</Table.Cell>
                    <Table.Cell>{policy.operationEndTime}</Table.Cell>
                    <Table.Cell>{policy.eachMaxMinute}</Table.Cell>
                  </Table.Row>
                ))}
              </TableBody>
            </Table>
            <div
              onClick={() => setIsGetPolicies(false)}
              className="cursor-pointer hover:underline">
              간략히
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyManagement;
