import { z } from 'zod';

export const userInfoSchema = z.object({
  userId: z.number(),
  username: z.string(),
  serial: z.string(),
  name: z.string(),
  email: z.string(),
  serviceRole: z.enum(['USER', 'ADMIN', 'RESIDENT', 'BLOCKED']),
  departmentId: z.number(),
  isPasswordChangeRequired: z.boolean().optional(),
});

export type UserInfo = z.infer<typeof userInfoSchema>;
export type ServiceRole = UserInfo['serviceRole'];

export interface SignUpRequest {
  username: string;
  password: string;
  serial: string;
  name: string;
  email: string;
}

export interface PasswordChangeRequest {
  prePassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  token: string;
  newPassword: string;
}
