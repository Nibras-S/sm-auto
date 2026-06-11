import { z } from 'zod';
import { QUOTATION_STATUSES } from '@sm/shared';

const item = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().trim().min(1),
  partNumber: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().int().nonnegative().default(0), // fils
});

const contact = z.object({
  name: z.string().trim().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export const quotationCreateSchema = z.object({
  contact,
  items: z.array(item).default([]),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});
export const quotationUpdateSchema = z.object({
  contact: contact.optional(),
  items: z.array(item).optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});
export const quotationStatusSchema = z.object({
  status: z.enum(QUOTATION_STATUSES as [string, ...string[]]),
});
export const fromQuoteRequestSchema = z.object({ quoteRequestId: z.string().min(1) });

export type QuotationCreateInput = z.infer<typeof quotationCreateSchema>;
export type QuotationUpdateInput = z.infer<typeof quotationUpdateSchema>;
