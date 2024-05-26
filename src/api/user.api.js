import { useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

const fetchMe = async () => {
  const response = await apiClient.get(
    'https://api.studyroom.jisub.kim/users/me',
  );
  return response.data.data.name;
};

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });
};
