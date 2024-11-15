import React, { useState } from 'react';
import { Button, Table } from 'flowbite-react';
import { useUserBySerial, useUserByName } from '../../api/user.api';
import { useSnackbar } from 'react-simple-snackbar';
import { useNavigate } from 'react-router-dom';

const SerialCheck = () => {
  const [input, setInput] = useState('');
  const [userInfo, setUserInfo] = useState([]);
  const { refetch: fetchBySerial } = useUserBySerial(input, { enabled: false });
  const { refetch: fetchByName } = useUserByName(input, { enabled: false });
  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });
  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50',
    },
  });
  const navigate = useNavigate();

  // input 변경 시 호출
  const handleChange = e => {
    setInput(e.target.value);
  };

  // 조회 버튼 클릭 시 호출
  const handleFetchBtn = async () => {
    if (!input) {
      openErrorSnackbar('학번 또는 이름을 입력해주세요', 2500);
      return;
    }

    try {
      const isNumeric = !isNaN(input);
      const response = isNumeric ? await fetchBySerial() : await fetchByName();

      if (response.data.isSuccess === true) {
        // 응답을 배열 형태로 통일
        const usersData = isNumeric
          ? [response.data.data] // 학번 조회 시 객체를 배열로 감싸기
          : response.data.data.users; // 이름 조회 시 이미 배열 형태

        setUserInfo(usersData);
        openSuccessSnackbar(response.data.message, 2500);
      }
    } catch (error) {
      openErrorSnackbar(error.message, 2500);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-row items-center mb-5">
        <div className="mr-3">학번 또는 이름 </div>
        <input
          className="border rounded-sm w-32 h-7"
          onChange={handleChange}
          type="text"
          maxLength="9"
        />
        <Button
          onClick={handleFetchBtn}
          color="dark"
          className="ml-4 items-center h-8">
          조회
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Head className="text-center">
            <Table.HeadCell>역할</Table.HeadCell>
            <Table.HeadCell>이름</Table.HeadCell>
            <Table.HeadCell>학번</Table.HeadCell>
            <Table.HeadCell>이메일</Table.HeadCell>
            <Table.HeadCell>학과</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y text-center">
            {userInfo.length > 0 ? (
              userInfo.map(user => (
                <Table.Row
                  key={user.userId}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{user.serviceRole}</Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.serial}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.departmentName || '-'}</Table.Cell>
                  <Table.Cell>
                    <a
                      onClick={() =>
                        navigate(`/fetchReservations/${user.userId}`)
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
