import React, { useState } from 'react';
import { Table } from 'flowbite-react';
import { Pagination } from '@mui/material';

import { useBlockedUser } from '../../api/user.api';

const FetchBlockedUser = () => {
  const { data: blocked } = useBlockedUser();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 현재 페이지에 해당하는 데이터 추출
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = blocked?.slice(startIndex, startIndex + itemsPerPage);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="overflow-x-auto py-10">
      <div className="flex justify-center text-2xl mb-10">
        블락 당한 사용자 조회
      </div>
      <Table>
        <Table.Head className="text-center">
          <Table.HeadCell>User Id</Table.HeadCell>
          <Table.HeadCell>학번</Table.HeadCell>
          <Table.HeadCell>이름</Table.HeadCell>
          <Table.HeadCell>학과</Table.HeadCell>
          <Table.HeadCell>block 시작 날짜</Table.HeadCell>
          <Table.HeadCell>block 종료 날짜</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">삭제</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y text-center">
          {paginatedData
            ?.sort(
              (a, b) =>
                new Date(b.startBlockedDate) - new Date(a.startBlockedDate),
            )
            .map((user, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {user.userInfoResponse.userId}
                </Table.Cell>
                <Table.Cell>{user.userInfoResponse.serial}</Table.Cell>
                <Table.Cell>{user.userInfoResponse.name}</Table.Cell>
                <Table.Cell>
                  {user.userInfoResponse.departmentId === 1
                    ? '컴퓨터공학부'
                    : '정보통신공학과'}
                </Table.Cell>
                <Table.Cell>{user.startBlockedDate}</Table.Cell>
                <Table.Cell>{user.endBlockedDate}</Table.Cell>
                <Table.Cell>
                  <a
                    href="#"
                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                    Edit
                  </a>
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>

      {/* Pagination Component */}
      <div className="flex justify-center mt-4">
        <Pagination
          count={Math.ceil((blocked?.length || 0) / itemsPerPage)}
          page={currentPage}
          onChange={handleChangePage}
          shape="rounded"
        />
      </div>
    </div>
  );
};

export default FetchBlockedUser;
