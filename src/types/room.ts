import { z } from 'zod';

export const roomSchema = z.object({
  roomId: z.number(),
  roomName: z.string(),
  departmentId: z.number(),
});

export type Room = z.infer<typeof roomSchema>;

export const roomPartitionSchema = z.object({
  roomPartitionId: z.number(),
  roomPartitionName: z.string(),
  roomId: z.number(),
});

export type RoomPartition = z.infer<typeof roomPartitionSchema>;
