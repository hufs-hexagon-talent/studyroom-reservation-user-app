import { z } from 'zod';

export const reservationInfoSchema = z.object({
  reservationId: z.number(),
  roomPartitionId: z.number(),
  roomPartitionName: z.string(),
  startDateTime: z.string(),
  endDateTime: z.string(),
  state: z.string(),
  username: z.string().optional(),
  name: z.string().optional(),
});

export type ReservationInfo = z.infer<typeof reservationInfoSchema>;

export interface CreateReservationRequest {
  roomPartitionId: number;
  startDateTime: string;
  endDateTime: string;
}

export interface ReservationSearchRequest {
  username?: string;
  serial?: string;
  roomIds?: number[];
  roomPartitionIds?: number[];
  startDateTime?: string;
  endDateTime?: string;
  states?: string[];
  page?: number;
  size?: number;
}

export interface PartitionReservationInfo {
  roomPartitionId: number;
  roomPartitionName: string;
  reservationInfoResponses: ReservationInfo[];
}
