import { z } from 'zod';

export const roomOperationPolicySchema = z.object({
  roomOperationPolicyId: z.number(),
  operationStartTime: z.string(),
  operationEndTime: z.string(),
  eachMaxMinute: z.number(),
});

export type RoomOperationPolicy = z.infer<typeof roomOperationPolicySchema>;

export interface CreatePolicyRequest {
  operationStartTime: string;
  operationEndTime: string;
  eachMaxMinute: number;
}

export interface EditPolicyRequest {
  roomOperationPolicyId: number;
  operationStartTime: string;
  operationEndTime: string;
  eachMaxMinute: number;
}
