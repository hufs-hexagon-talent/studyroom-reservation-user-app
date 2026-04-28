import { z } from 'zod';

export const allPartitionItemSchema = z.object({
  partitionId: z.number(),
  partitionNumber: z.number(),
  roomName: z.string(),
  roomId: z.number(),
});

export type AllPartitionItem = z.infer<typeof allPartitionItemSchema>;

export interface CreatePartitionRequest {
  roomId: number;
  partitionNumber: number;
}

export interface EditPartitionRequest {
  partitionId: number;
  roomId: number;
  partitionNumber: number;
}
