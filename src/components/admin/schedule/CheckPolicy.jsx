import React, { useState } from 'react';
import { Table, Checkbox } from 'flowbite-react';

import { useAllPolicies } from '../../../api/roomOperationPolicy.api';

const CheckPolicy = () => {
  const { data: policies, refetch } = useAllPolicies();
  const [isFetched, setIsFetched] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);

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
          className="bg-blue-500 text-white px-3 py-2 ml-8 text-xs rounded-full"
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
              {policies.data.operationPolicyInfos.map(policy => (
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
            className="mt-2 text-sm text-blue-600 cursor-pointer"
            onClick={handleTableVisibility}>
            간략히 &gt;
          </div>
        </div>
      )}
    </div>
  );
};
export default CheckPolicy;
