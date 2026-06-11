import { z } from 'zod';

const image = z
  .object({ publicId: z.string().nullable().optional(), url: z.string().url() })
  .nullable()
  .optional();

export const bannerCreateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image,
  link: z.string().optional(),
  placement: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const bannerUpdateSchema = bannerCreateSchema.partial();

export const faqCreateSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  category: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const faqUpdateSchema = faqCreateSchema.partial();

export const contentUpsertSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().default(''),
});
