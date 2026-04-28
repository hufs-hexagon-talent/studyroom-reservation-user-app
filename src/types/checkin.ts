import { z } from 'zod';

export const otpResponseSchema = z.object({
  verificationCode: z.string(),
});

export interface CheckInRequest {
  verificationCode: string;
  roomId: number;
}
