import React, { useState } from 'react';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Table, TableBody, Modal, Checkbox } from 'flowbite-react';

import {
  useCreatePolicy,
  useAllPolicies,
  useDeletePolicy,
} from '../../../../api/roomOperationPolicy.api';
import { useSnackbar } from 'react-simple-snackbar';
import UnderArrow from '../../../../assets/icons/under_arrow_black.png';
import TimeSelector from '../../../../components/clock/TimeRangeSelector';
import TimeSlider from '../../../../components/clock/TimeSlider';

const PolicyManagement = () => {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [eachMaxMinute, setEachMaxMinute] = useState(60);
  const [isGetPolicies, setIsGetPolicies] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const { mutateAsync: doCreatePolicy } = useCreatePolicy();
  const { mutateAsync: doDeletePolicy } = useDeletePolicy();
  const { data: policies, refetch } = useAllPolicies();

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
        operationStartTime: startTime ? `${startTime}:00` : '',
        operationEndTime: endTime ? `${endTime}:00` : '',
        eachMaxMinute: eachMaxMinute,
      });
      refetch();
      console.log(
        response?.data.roomOperationPolicyId,
        response?.data.operationStartTime,
        response?.data.operationEndTime,
        response?.data.eachMaxMinute,
      );
      openSuccessSnackbar(response?.message, 3000);
    } catch (error) {
      openErrorSnackbar(
        error?.response.data.data.message ||
          '정책 생성 중 오류가 발생하였습니다.',
        3000,
      );
    }
  };

  // 정책 삭제
  const deletePolicy = async policyId => {
    try {
      const response = await doDeletePolicy(policyId);
      refetch();
      openSuccessSnackbar(response?.message, 3000);
    } catch (error) {
      openErrorSnackbar(
        error?.response.data.data.message ||
          '정책 삭제 중 오류가 발생하였습니다.',
        3000,
      );
    }
  };

  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">
        Policy Management
      </div>
      {/* 정책 생성 */}
      <div className="bg-white p-8 inline-block rounded-xl mb-8 shadow-md w-full">
        <div className="text-2xl font-semibold">정책 생성</div>
        <div className="w-2/3 space-y-2 px-4">
          <div className="flex flex-row items-center justify-between">
            <div className="font-semibold">시간 구간 선택</div>
            {/* 최대 예약 가능 시간 */}
            <div className="w-2/3">
              <TimeSlider value={eachMaxMinute} onChange={setEachMaxMinute} />
            </div>
          </div>
          {/* 시간 구간 선택 */}
          <TimeSelector setStartTime={setStartTime} setEndTime={setEndTime} />
          {/* 정책 생성 버튼 */}
          {/* todo: null일 때 정책 생성되는거 막기 */}
          <div className="flex justify-end pt-8">
            <Button
              onClick={createPolicy}
              className=" bg-gray-800 px-6 hover:bg-gray-700 text-white rounded disabled:bg-gray-200">
              생성
            </Button>
          </div>
        </div>
      </div>

      {/* 모든 정책 조회 */}
      <div className="bg-white p-4 inline-block rounded-xl mb-8 shadow-md w-full">
        <div className="flex flex-row items-center justify-between">
          <div className="text-xl p-6 font-bold">모든 정책 조회</div>
          <div>
            {selectedPolicyId && (
              <Button
                onClick={() => setOpenDeleteModal(selectedPolicyId)}
                color="dark"
                className="hover:bg-gray-700 text-white rounded">
                삭제
              </Button>
            )}
          </div>
        </div>
        <div>
          <Table className="text-center">
            <Table.Head>
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell>정책 ID</Table.HeadCell>
              <Table.HeadCell>시작 시각</Table.HeadCell>
              <Table.HeadCell>종료 시각</Table.HeadCell>
              <Table.HeadCell>최대 이용 시간</Table.HeadCell>
            </Table.Head>
            <TableBody>
              {policies?.map(policy => (
                <Table.Row key={policy.roomOperationPolicyId}>
                  <Table.Cell>
                    <Checkbox
                      className="rounded-none text-[#1D2430] focus:ring-[#1D2430]"
                      checked={
                        selectedPolicyId === policy.roomOperationPolicyId
                      }
                      onChange={() => {
                        setSelectedPolicyId(prev =>
                          prev === policy.roomOperationPolicyId
                            ? null
                            : policy.roomOperationPolicyId,
                        );
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>{policy.roomOperationPolicyId}</Table.Cell>
                  <Table.Cell>{policy.operationStartTime}</Table.Cell>
                  <Table.Cell>{policy.operationEndTime}</Table.Cell>
                  <Table.Cell>{policy.eachMaxMinute}</Table.Cell>
                </Table.Row>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <Modal
          show={openDeleteModal}
          className="flex justify-center items-center w-full p-6"
          size="md"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          once={() => setOpenDeleteModal(false)}
          popup>
          <Modal.Header />
          <Modal.Body>
            <div className="text-center space-y-12">
              <div className="text-lg font-semibold">
                정책을 삭제하시겠습니까?
              </div>
              <div className="flex justify-center gap-6">
                <Button
                  onClick={() => setOpenDeleteModal(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white rounded">
                  아니요
                </Button>
                <Button
                  onClick={() => {
                    deletePolicy(openDeleteModal);
                    setOpenDeleteModal(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded">
                  삭제
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default PolicyManagement;
