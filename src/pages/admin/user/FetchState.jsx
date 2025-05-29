import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Checkbox, Modal, Table } from 'flowbite-react';
import { Input, Pagination } from '@mui/material';
import {
  useUnblocked,
  useBlockedUser,
  useUserRoleList,
  exportUserExcel,
  useUserSearch,
  useUserUpdate,
  useUserById,
} from '../../../api/user.api';
import { useDepartmets } from '../../../api/department.api';
import { useCustomSnackbars } from '../../../components/snackbar/SnackBar';
import { FaFileExcel } from 'react-icons/fa6';

const FetchState = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState([]);
  const [input, setInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [userList, setUserList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null); // 체크된 userId (단일)

  const [editname, setEditName] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editSerial, setEditSerial] = useState('');
  const [editServiceRole, setEditServiceRole] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState(null);
  const [editEmail, setEditEmail] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [openBlockedModal, setOpenBlockedModal] = useState(false);
  const [selectedBlockedInfo, setSelectedBlockedInfo] = useState(null);
  const [searchParams] = useSearchParams();
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();

  const { data: selectedUserData } = useUserById(selectedUserId);
  const { data: departments } = useDepartmets();
  const { data: blocked } = useBlockedUser();
  const { data: userRoleList } = useUserRoleList();
  const { data: user } = useUserById();
  const { mutate: doUnblocked, refetch } = useUnblocked();
  const { mutate: userSearch } = useUserSearch();
  const { mutate: userUpdate } = useUserUpdate();

  // 페이지 누를때 상태 관리
  const handlePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  console.log('selectedUserId:', selectedUserId);

  // URL에 따라 role 필터 선택
  useEffect(() => {
    const queryRoles = searchParams.getAll('role');
    if (queryRoles.length > 0) {
      setSelectedRoles(queryRoles);
    }
  }, []);

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
    const isNumeric = !isNaN(input);
    const payload = {
      page: currentPage - 1,
      ...(selectedRoles.length > 0 && { role: selectedRoles }),
      ...(input && {
        ...(isNumeric ? { serial: input } : { name: input }),
      }),
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

  // 유저 정보 수정
  const handleUserUpdate = async userId => {
    await userUpdate(
      {
        userId,
        username: editUserName,
        serial: editSerial,
        serviceRole: editServiceRole,
        name: editname,
        email: editEmail,
        departmentId: editDepartmentId,
      },
      {
        onSuccess: data => {
          openSuccessSnackbar(data.message, 3000);
          refetch();
          setEditModalOpen(false);
          setSelectedUserId(null);
          setEditName('');
          setEditUserName('');
          setEditSerial('');
          setEditEmail('');
          setEditServiceRole('');
          setEditDepartmentId(null);
          fetchUsers();
        },
        onError: () => {
          openErrorSnackbar('유저 정보 수정에 실패했습니다.', 3000);
        },
      },
    );
  };

  const handleCheckboxChange = user => {
    // 토글: 이미 선택된 유저를 다시 클릭하면 해제
    if (selectedUserId === user.userId) {
      setSelectedUserId(null);
    } else {
      setSelectedUserId(user.userId);
      setEditName(user.name);
      setEditUserName(user.username);
      setEditSerial(user.serial);
      setEditEmail(user.email);
      setEditServiceRole(user.serviceRole);
      setEditDepartmentId(user.departmentId);
    }
  };

  // 입력할 떄마다 & Enter 키 입력 시 유저 조회
  const handleSearchUser = () => {
    setCurrentPage(1); // 검색 시 1페이지로
    fetchUsers();
  };

  // 체크박스 또는 페이지가 바뀌면 유저 목록 다시 가져오기
  useEffect(() => {
    fetchUsers();
  }, [selectedRoles, currentPage, input]);

  return (
    <div className="overflow-x-auto">
      {/* Blocked User List */}
      <div>
        <div className="font-bold text-3xl text-black p-8">Users State</div>
        <div className="flex flex-row items-center mx-5 mb-6">
          <div className="mr-3">학번 또는 이름 </div>
          <input
            className="border rounded-sm w-32 h-7"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSearchUser();
              }
            }}
            type="text"
            maxLength="9"
          />
        </div>
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

          <div className="flex flex-row items-center space-x-4">
            {/* 회원 정보 수정 버튼 */}
            {selectedUserId && (
              <Button color="dark" onClick={() => setEditModalOpen(true)}>
                수정
              </Button>
            )}
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
                <div className="break-keep">내보내기</div>
              </div>
            </Button>
          </div>
        </div>
        {/* Users Table */}
        <Table>
          <Table.Head className="text-center">
            <Table.HeadCell className="bg-gray-200"></Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">User Id</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">
              Service Role
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">학번</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">이름</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">학과</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">이메일</Table.HeadCell>
            {userList.some(user => user.serviceRole === 'BLOCKED') && (
              <Table.HeadCell className="bg-gray-200">
                <span className="sr-only">삭제</span>
              </Table.HeadCell>
            )}
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {userList.map((user, index) => (
              <Table.Row
                key={index}
                className="bg-white cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="w-4">
                  <Checkbox
                    checked={selectedUserId === user.userId}
                    onChange={() => handleCheckboxChange(user)}
                    className="rounded-none text-[#1D2430] focus:ring-[#1D2430]"
                  />
                </Table.Cell>
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
                <Table.Cell
                  onClick={() =>
                    navigate(`/admin/fetchReservations/${user.userId}`)
                  }>
                  {user.serviceRole}
                </Table.Cell>
                <Table.Cell
                  onClick={() =>
                    navigate(`/admin/fetchReservations/${user.userId}`)
                  }>
                  {user.serial ?? '-'}
                </Table.Cell>
                <Table.Cell
                  onClick={() =>
                    navigate(`/admin/fetchReservations/${user.userId}`)
                  }>
                  {user.name}
                </Table.Cell>
                <Table.Cell
                  onClick={() =>
                    navigate(`/admin/fetchReservations/${user.userId}`)
                  }>
                  {user.departmentId === 1 ? '컴퓨터공학부' : '정보통신공학과'}
                </Table.Cell>
                <Table.Cell
                  onClick={() =>
                    navigate(`/admin/fetchReservations/${user.userId}`)
                  }>
                  {user.email ?? '-'}
                </Table.Cell>
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

        {/* 유저 정보 수정 모달 */}
        <Modal show={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <Modal.Header>
            <strong>#{selectedUserId}</strong> 유저 정보 수정
          </Modal.Header>
          <Modal.Body>
            <Table>
              <Table.Body>
                <Table.Row>
                  <Table.Cell className="border-b border-gray-300 bg-gray-200 font-semibold text-black">
                    유저 ID
                  </Table.Cell>
                  <Table.Cell className="border-b border-gray-300">
                    {selectedUserId}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="border-b border-gray-300 bg-gray-200 font-semibold text-black">
                    이름
                  </Table.Cell>
                  <Table.Cell className="border-b border-gray-300">
                    <Input
                      fullWidth
                      value={editname}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="border-b border-gray-300 bg-gray-200 font-semibold text-black">
                    USERNAME
                  </Table.Cell>
                  <Table.Cell className="border-b border-gray-300">
                    <Input
                      fullWidth
                      value={editUserName}
                      onChange={e => setEditUserName(e.target.value)}
                    />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="border-b border-gray-300 bg-gray-200 font-semibold text-black">
                    학번
                  </Table.Cell>
                  <Table.Cell className="border-b border-gray-300">
                    <Input
                      fullWidth
                      value={editSerial}
                      onChange={e => setEditSerial(e.target.value)}
                    />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="border-b border-gray-300 bg-gray-200 font-semibold text-black">
                    ROLE
                  </Table.Cell>
                  <Table.Cell className="border-b border-gray-300">
                    <select
                      className="w-full border rounded-md px-2 py-1"
                      value={editServiceRole}
                      onChange={e => setEditServiceRole(e.target.value)}>
                      <option value="">선택</option>
                      {userRoleList?.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell className="border-b border-gray-300 bg-gray-200 font-semibold text-black">
                    이메일
                  </Table.Cell>
                  <Table.Cell className="border-b border-gray-300">
                    <Input
                      fullWidth
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                    />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className=" bg-gray-200 font-semibold text-black">
                    부서
                  </Table.Cell>
                  <Table.Cell>
                    <select
                      className="w-full border rounded-md px-2 py-1"
                      value={editDepartmentId ?? ''}
                      onChange={e =>
                        setEditDepartmentId(Number(e.target.value))
                      }>
                      <option value="">선택</option>
                      {departments?.map(dept => (
                        <option
                          key={dept.departmentId}
                          value={dept.departmentId}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>

            <div className="flex justify-end mt-4">
              <Button
                color="dark"
                onClick={() => handleUserUpdate(selectedUserId)}>
                수정
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* 회원 블락 기간 조회 모달 */}
        <Modal
          className="flex justify-center items-center w-full"
          show={openBlockedModal}
          onClose={() => {
            setOpenBlockedModal(false);
            setSelectedBlockedInfo(null);
          }}>
          <Modal.Header>
            {selectedBlockedInfo?.userInfoResponse.name}의 Blocked Period
          </Modal.Header>
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
