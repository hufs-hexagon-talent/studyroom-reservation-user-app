import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Table, TableBody, Modal, Checkbox } from 'flowbite-react';
import {
  useCreatePolicy,
  useAllPolicies,
  useDeletePolicy,
  usePolicy,
  useEditPolicy,
} from '../../../../api/roomOperationPolicy.api';
import { useSnackbar } from 'react-simple-snackbar';
import 'react-datepicker/dist/react-datepicker.css';

import EachMaxMinuteSelector from '../../../../components/clock/EachMaxMinuteSelector';
import TimePicker from '../../../../components/clock/TimePicker';
import TimeSelector from '../../../../components/clock/TimeRangeSelector';
import TimeSlider from '../../../../components/clock/TimeSlider';

const PolicyManagement = () => {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [eachMaxMinute, setEachMaxMinute] = useState(60);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);

  const [operationStartTime, setOperationStartTime] = useState(new Date());
  const [operationEndTime, setOperationEndTime] = useState(new Date());
  const [operationEachMaxMinute, setOperationEachMaxMinute] = useState(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(null);
  const { mutateAsync: doCreatePolicy } = useCreatePolicy();
  const { mutateAsync: doDeletePolicy } = useDeletePolicy();
  const { data: policies, refetch } = useAllPolicies();
  const { data: policy } = usePolicy(selectedPolicyId);
  const { mutate: editPolicy } = useEditPolicy(selectedPolicyId);

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

  useEffect(() => {
    if (policy) {
      setOperationStartTime(policy.operationStartTime || '');
      setOperationEndTime(policy.operationEndTime || '');
      setOperationEachMaxMinute(policy.eachMaxMinute?.toString() || '');
    }
  }, [policy]);

  // 정책 생성
  const createPolicy = async () => {
    try {
      const response = await doCreatePolicy({
        operationStartTime: startTime ? `${startTime}:00` : '',
        operationEndTime: endTime ? `${endTime}:00` : '',
        eachMaxMinute: eachMaxMinute,
      });
      refetch();
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

  // 정책 수정
  const updatePolicy = async () => {
    try {
      await editPolicy(
        {
          roomOperationPolicyId: selectedPolicyId,
          operationStartTime,
          operationEndTime,
          eachMaxMinute: Number(operationEachMaxMinute),
        },
        {
          onSuccess: () => {
            refetch();
            setOpenEditModal(null);
            openSuccessSnackbar('정책이 성공적으로 수정되었습니다.', 3000);
          },
          onError: error => {
            openErrorSnackbar('정책 수정 중 오류가 발생했습니다.', 3000);
          },
        },
      );
    } catch (error) {
      console.error(error);
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
              <div className="flex flex-row gap-x-6">
                <Button
                  onClick={() => setOpenEditModal(selectedPolicyId)}
                  color="dark"
                  className="hover:bg-gray-700 text-white rounded">
                  수정
                </Button>
                <Button
                  onClick={() => setOpenDeleteModal(selectedPolicyId)}
                  color="dark"
                  className="hover:bg-gray-700 text-white rounded">
                  삭제
                </Button>
              </div>
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

      {/* 수정 모달 */}
      <div className="flex justify-center items-center">
        <Modal show={openEditModal} onClose={() => setOpenEditModal(false)}>
          <Modal.Header>정책 수정</Modal.Header>
          <Modal.Body>
            {policy ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>정책 ID</Table.HeadCell>
                  <Table.HeadCell>시작 시각</Table.HeadCell>
                  <Table.HeadCell>종료 시각</Table.HeadCell>
                  <Table.HeadCell>최대 이용 시간</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  <Table.Row key={policy.roomOperationPolicyId}>
                    <Table.Cell>{policy.roomOperationPolicyId}</Table.Cell>
                    <Table.Cell>
                      <TimePicker
                        value={operationStartTime}
                        onChange={setOperationStartTime}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <TimePicker
                        value={operationEndTime}
                        onChange={setOperationEndTime}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <EachMaxMinuteSelector
                        value={operationEachMaxMinute}
                        onChange={setOperationEachMaxMinute}
                      />
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            ) : (
              <div>정책 정보를 불러오는 중입니다...</div>
            )}
            <div className="flex justify-end mt-6">
              <Button onClick={updatePolicy} color="dark">
                수정
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>

      {/* 삭제 모달 */}
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
          onClose={() => setOpenDeleteModal(false)}
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
