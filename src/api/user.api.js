import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

const fetchMe = async () => {
  const response = await apiClient.get(
    'https://api.studyroom.jisub.kim/users/me',
  );
  return response.data.name;
};

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });
};

export const useReserve = () => {
  return useMutation({
    mutationFn: async ({
      roomId, startDateTime, endDateTime
    }) =>{
      const res = await apiClient.post(
        'https://api.studyroom.jisub.kim/reservations',
        {
          roomId,
          startDateTime,
          endDateTime,
        },
      );

      return res.data
    }
  })
}

export const fetchDate = async() =>{
  const date_response = await apiClient.get(
'https://api.studyroom.jisub.kim/schedules/available-dates'
  );
  const dates = date_response.data.data.items.map(date => new Date(date));
  return dates;
}