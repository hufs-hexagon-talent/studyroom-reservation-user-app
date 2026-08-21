import { QueryClient } from '@tanstack/react-query';

// index.js 안에서 만들면 reservation.api.js 와 순환 참조가 생겨 별도 모듈로 둔다
export const queryClient = new QueryClient();
