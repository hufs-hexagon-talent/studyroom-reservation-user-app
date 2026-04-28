import { z } from 'zod';

export const policyScheduleSchema = z.object({
  roomOperationPolicyScheduleId: z.number(),
  roomId: z.number(),
  roomOperationPolicyId: z.number(),
  policyApplicationDate: z.string(),
});

export type PolicySchedule = z.infer<typeof policyScheduleSchema>;

export interface CreateScheduleRequest {
  roomIds: number[];
  roomOperationPolicyId: number;
  policyApplicationDates: string[];
}

export interface UpdateScheduleRequest {
  roomOperationPolicyScheduleId: number;
  roomId: number;
  roomOperationPolicyId: number;
  policyApplicationDate: string;
}
