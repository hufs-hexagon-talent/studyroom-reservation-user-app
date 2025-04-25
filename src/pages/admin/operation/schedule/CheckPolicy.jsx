import React, { useState } from 'react';
import { Table, Checkbox } from 'flowbite-react';
import UnderArrow from '../../../../assets/icons/under_arrow_black.png';
import { useAllPolicies } from '../../../../api/roomOperationPolicy.api';

const CheckPolicy = ({ selectedPolicyId, setSelectedPolicyId }) => {
  const { data: policies, refetch } = useAllPolicies();
  const [isFetched, setIsFetched] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);

  const handleFetchPolicies = () => {
    refetch().then(() => {
      setIsFetched(true);
      setIsTableVisible(true);
    });
  };

  const handlePolicyCheckBox = policyId => {
    setSelectedPolicyId(policyId === selectedPolicyId ? null : policyId);
  };

  const handleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  return (
    <div>
      <div className="flex flex-row items-center">
        <div>모든 room Policy 조회 및 선택</div>
        <button
          className="bg-gray-300 text-white px-3 py-2 ml-8 text-xs rounded-full"
          onClick={handleFetchPolicies}>
          <img className="w-4 h-4" src={UnderArrow} />
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
              {policies?.map(policy => (
                <Table.Row
                  key={policy.roomOperationPolicyId}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="p-4">
                    <Checkbox
                      checked={
                        selectedPolicyId === policy.roomOperationPolicyId
                      }
                      onChange={() =>
                        handlePolicyCheckBox(policy.roomOperationPolicyId)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {policy.roomOperationPolicyId}
                  </Table.Cell>
                  <Table.Cell>{policy.operationStartTime}</Table.Cell>
                  <Table.Cell>{policy.operationEndTime}</Table.Cell>
                  <Table.Cell>{policy.eachMaxMinute}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <div
            className="mt-2 text-sm cursor-pointer"
            onClick={handleTableVisibility}>
            간략히 &gt;
          </div>
        </div>
      )}
    </div>
  );
};
export default CheckPolicy;
