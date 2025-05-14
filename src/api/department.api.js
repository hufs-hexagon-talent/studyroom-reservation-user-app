import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import axios from 'axios';

// [관리자] 모든 부서 조회
const fetchDepartments = async () => {
  const authState = JSON.parse(localStorage.getItem('authState'));
  const accessToken = authState?.accessToken;

  const response = await axios.get(
    `https://api.studyroom-qa.alpaon.net/departments`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data.data;
};

export const useDepartmets = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });
};
