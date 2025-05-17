import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Modal, Table } from 'flowbite-react';
import { Pagination } from '@mui/material';
import {
  useUnblocked,
  useBlockedUser,
  useUserRoleList,
  exportUserExcel,
  useUserSearch,
} from '../../../api/user.api';
import { useSnackbar } from 'react-simple-snackbar';
import { FaFileExcel } from 'react-icons/fa6';

const FetchState = () => {
  const { data: blocked } = useBlockedUser();
  const { data: userRoleList } = useUserRoleList();
  const { mutate: doUnblocked, refetch } = useUnblocked();
  const { mutate: userSearch } = useUserSearch();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [userList, setUserList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [openBlockedModal, setOpenBlockedModal] = useState(false);
  const [selectedBlockedInfo, setSelectedBlockedInfo] = useState(null);

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
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  };

  // 유저 조회
  const fetchUsers = () => {
    const payload = {
      page: currentPage - 1, // 페이지는 0부터 시작
      // selectedRoles가 비어있다면 role을 요청에 안넣어서 전체 유저 조회하도록
      ...(selectedRoles.length > 0 && { role: selectedRoles }),
    };

    userSearch(payload, {
      onSuccess: res => {
        const { items, meta } = res.data;
        setUserList(items || []);
        setTotalPages(meta.totalPages);
        setPageSize(meta.size);
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

  // 체크박스 또는 페이지가 바뀌면 유저 목록 다시 가져오기
  useEffect(() => {
    fetchUsers();
  }, [selectedRoles, currentPage]);

  return (
    <div className="overflow-x-auto">
      {/* Blocked User List */}
      <div>
        <div className="font-bold text-3xl text-black p-8">Users State</div>
        <div className="flex justify-between items-center">
          {/* Role Checkbox */}
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
            {userList.some(user => user.serviceRole === 'BLOCKED') && (
              <Table.HeadCell>
                <span className="sr-only">삭제</span>
              </Table.HeadCell>
            )}
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {userList.map((user, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell
                  // blocked이면 userId 클릭할 수 있게
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
                <Table.Cell>{user.serial ?? '-'}</Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>
                  {user.departmentId === 1 ? '컴퓨터공학부' : '정보통신공학과'}
                </Table.Cell>
                <Table.Cell>{user.email ?? '-'}</Table.Cell>
                {user.serviceRole === 'BLOCKED' ? (
                  <Table.Cell>
                    <a
                      onClick={() => handleUnblocked(user.userId)}
                      className="font-medium text-red-600 cursor-pointer hover:underline dark:text-cyan-500">
                      삭제
                    </a>
                  </Table.Cell>
                ) : (
                  userList.some(u => u.serviceRole === 'BLOCKED') && (
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
            count={totalPages}
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
