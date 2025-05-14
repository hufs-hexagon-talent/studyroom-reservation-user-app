import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Modal, Table } from 'flowbite-react';
import { Pagination } from '@mui/material';
import {
  useUnblocked,
  useAllUsers,
  useBlockedUser,
  useUserRoleList,
  exportUserExcel,
} from '../../../api/user.api';
import { useSnackbar } from 'react-simple-snackbar';
import { FaFileExcel } from 'react-icons/fa6';

const FetchState = () => {
  const { data: allUsers } = useAllUsers();
  const { data: blocked } = useBlockedUser();
  const { data: userRoleList } = useUserRoleList();
  const { mutate: doUnblocked, refetch } = useUnblocked();
  const [currentPage, setCurrentPage] = useState(1);
  const [openBlockedModal, setOpenBlockedModal] = useState(false);
  const [selectedBlockedInfo, setSelectedBlockedInfo] = useState(null);
  const [userList, setUserList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const itemsPerPage = 17;

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#4CAF50', color: '#FFFFFF' },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#FF3333' },
  });

  const handlePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // 블락 해제 함수
  const handleUnblocked = async userId => {
    await doUnblocked(userId, {
      onSuccess: () => {
        openSuccessSnackbar('블락 해제 되었습니다.', 3000);
        refetch();
      },
      onError: error => {
        openErrorSnackbar(
          error?.response?.data?.errors?.[0]?.message ||
            error?.response?.data?.message,
          3000,
        );
      },
    });
  };

  // serviceRole 선택
  const handleRoleSelect = role => {
    setCurrentPage(1);
    setSelectedRoles(
      prev =>
        prev.includes(role)
          ? prev.filter(r => r !== role) // 제거
          : [...prev, role], // 추가
    );
  };

  // serviceRole에 따라 필터링
  const filteredUsers =
    selectedRoles.length > 0
      ? userList.filter(user => selectedRoles.includes(user.serviceRole))
      : userList;

  // 현재 페이지에 해당하는 데이터 추출
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    if (allUsers) {
      setUserList(allUsers);
    }
  }, [allUsers]);

  return (
    <div className="overflow-x-auto">
      {/* Blocked User List */}
      <div>
        <div className="font-bold text-3xl text-black p-8">Users State</div>
        <div className="flex justify-between items-center">
          {/* State Checkbox */}
          <div className="flex flex-row gap-x-6 items-center px-4 pb-8">
            {userRoleList?.map(role => (
              <div key={role} className="flex flex-row gap-x-2 items-center">
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleSelect(role)}
                  className="rounded-none text-[#1D2430] focus:ring-[#1D2430]"
                />
                <div>{role}</div>
              </div>
            ))}
          </div>
          {/* Export Excel */}
          <Button
            color="dark"
            onClick={() => {
              if (selectedRoles.length === 0) {
                openErrorSnackbar('역할을 하나 이상 선택해주세요.');
                return;
              }
              exportUserExcel(selectedRoles);
            }}>
            <div className="flex flex-row gap-x-3 items-center">
              <FaFileExcel />
              <div>내보내기</div>
            </div>
          </Button>
        </div>
        {/* Users Table */}
        <Table>
          <Table.Head className="text-center">
            <Table.HeadCell>User Id</Table.HeadCell>
            <Table.HeadCell>Service Role</Table.HeadCell>
            <Table.HeadCell>학번</Table.HeadCell>
            <Table.HeadCell>이름</Table.HeadCell>
            <Table.HeadCell>학과</Table.HeadCell>
            <Table.HeadCell>이메일</Table.HeadCell>
            {filteredUsers.some(user => user.serviceRole === 'BLOCKED') && (
              <Table.HeadCell>
                <span className="sr-only">삭제</span>
              </Table.HeadCell>
            )}
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {paginatedData?.map((user, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800">
                {/* Blocked일때만 눌렀을 때 Modal 열리게 */}
                <Table.Cell
                  onClick={() => {
                    if (user.serviceRole === 'BLOCKED') {
                      const blockedInfo = blocked?.find(
                        b => b.userInfoResponse.userId === user.userId,
                      );
                      setSelectedBlockedInfo(blockedInfo);
                      setOpenBlockedModal(true);
                    }
                  }}
                  className={`whitespace-nowrap font-medium text-gray-900 dark:text-white
                  ${user.serviceRole === 'BLOCKED' ? 'cursor-pointer hover:underline' : ''}
                `}>
                  {user.userId}
                </Table.Cell>
                <Table.Cell>{user.serviceRole}</Table.Cell>
                <Table.Cell>{user.serial ? user.serial : '-'}</Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>
                  {user.departmentId === 1 ? '컴퓨터공학부' : '정보통신공학과'}
                </Table.Cell>

                <Table.Cell>{user.email ? user.email : '-'}</Table.Cell>
                {user.serviceRole === 'BLOCKED' ? (
                  <Table.Cell>
                    <a
                      onClick={() => handleUnblocked(user.userId)}
                      className="font-medium text-red-600 cursor-pointer hover:underline dark:text-cyan-500">
                      삭제
                    </a>
                  </Table.Cell>
                ) : (
                  filteredUsers.some(u => u.serviceRole === 'BLOCKED') && (
                    <Table.Cell />
                  )
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination
            count={Math.ceil((filteredUsers?.length || 0) / itemsPerPage)}
            page={currentPage}
            onChange={handlePage}
            shape="rounded"
          />
        </div>

        <Modal
          className="flex justify-center items-center w-full"
          show={openBlockedModal}
          onClose={() => {
            setOpenBlockedModal(false);
            setSelectedBlockedInfo(null);
          }}>
          <Modal.Header>Blocked Period</Modal.Header>
          <Modal.Body>
            <Table>
              <Table.Head className="text-center text-md">
                <Table.HeadCell>User Id</Table.HeadCell>
                <Table.HeadCell>이름</Table.HeadCell>
                <Table.HeadCell>블락 시작일</Table.HeadCell>
                <Table.HeadCell>블락 종료일</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y text-center text-lg">
                <Table.Row
                  key={selectedBlockedInfo?.userInfoResponse.userId}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {selectedBlockedInfo?.userInfoResponse.userId}
                  </Table.Cell>
                  <Table.Cell>
                    {selectedBlockedInfo?.userInfoResponse.name}
                  </Table.Cell>
                  <Table.Cell>
                    {selectedBlockedInfo?.startBlockedDate}
                  </Table.Cell>
                  <Table.Cell>{selectedBlockedInfo?.endBlockedDate}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default FetchState;
