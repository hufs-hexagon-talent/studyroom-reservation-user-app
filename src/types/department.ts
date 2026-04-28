import { z } from 'zod';

export const departmentSchema = z.object({
  departmentId: z.number(),
  departmentName: z.string(),
});

export type Department = z.infer<typeof departmentSchema>;
