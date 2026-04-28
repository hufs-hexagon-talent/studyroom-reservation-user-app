import { z } from 'zod';

export const bannerSchema = z.object({
  bannerId: z.number(),
  bannerType: z.string(),
  imageUrl: z.string(),
  linkUrl: z.string().nullable().optional(),
  active: z.boolean(),
  createAt: z.string(),
  updateAt: z.string(),
});

export type Banner = z.infer<typeof bannerSchema>;

export interface CreateBannerRequest {
  bannerType: string;
  imageUrl: string;
  linkUrl?: string;
}

export interface EditBannerRequest {
  bannerId: number;
  bannerType: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
}
