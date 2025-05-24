import React, { useState } from 'react';
import { Button, Table } from 'flowbite-react';
import { useUserSearch } from '../../../api/user.api';
import { useCustomSnackbars } from '../../../components/snackbar/SnackBar';
import { useNavigate } from 'react-router-dom';

const SerialCheck = () => {
  const [input, setInput] = useState('');
  const [userInfo, setUserInfo] = useState([]);
  const { openSuccessSnackbar, openErrorSnackbar } = useCustomSnackbars();

  const { mutateAsync: userSearch } = useUserSearch();
  const navigate = useNavigate();

  // 사용자 조회 API 호출
  const handleFetch = async () => {
    if (!input) {
      openErrorSnackbar('학번 또는 이름을 입력해주세요', 2500);
      return;
    }
    const isNumeric = !isNaN(input);

    try {
      const payload = {
        ...(isNumeric ? { serial: input } : { name: input }),
        page: 0,
        size: 10,
      };

      const response = await userSearch(payload);
      const usersData = response.data.items;

      setUserInfo(usersData);
      openSuccessSnackbar(response?.message, 2500);
    } catch (error) {
      openErrorSnackbar(error?.response?.data?.message || '검색 실패', 2500);
    }
  };

  return (
    <div>
      <div className="font-bold text-3xl text-black px-4 py-8">Search User</div>
      <div className="flex flex-row items-center m-5">
        <div className="mr-3">학번 또는 이름 </div>
        <input
          className="border rounded-sm w-32 h-7"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleFetch();
            }
          }}
          type="text"
          maxLength="9"
        />
        <Button
          onClick={handleFetch}
          className="ml-4 bg-gray-300 text-black rounded-full items-center h-8">
          조회
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Head className="text-center">
            <Table.HeadCell className="bg-gray-200">역할</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">이름</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">학번</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">이메일</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">학과</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200"></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {userInfo.length > 0 ? (
              userInfo.map(user => (
                <Table.Row
                  key={user.userId}
                  className="bg-white cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{user.serviceRole}</Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.serial || '-'}</Table.Cell>
                  <Table.Cell>{user.email || '-'}</Table.Cell>
                  <Table.Cell>{user.departmentName || '-'}</Table.Cell>
                  <Table.Cell>
                    <a
                      onClick={() =>
                        navigate(`/divide/fetchReservations/${user.userId}`)
                      }
                      className="font-medium cursor-pointer text-blue-500 hover:underline dark:text-cyan-500">
                      예약 조회
                    </a>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan="6">조회된 결과가 없습니다.</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default SerialCheck;
