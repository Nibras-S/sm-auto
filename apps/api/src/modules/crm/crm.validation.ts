import { z } from 'zod';
import { INQUIRY_STATUSES, LEAD_STATUSES, ORDER_STATUSES } from '@sm/shared';

const asEnum = (vals: readonly string[]) => z.enum(vals as [string, ...string[]]);

const contact = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
});

const vehicle = z
  .object({
    brand: z.string().optional(),
    model: z.string().optional(),
    generation: z.string().optional(),
    year: z.coerce.number().int().optional(),
    engineType: z.string().optional(),
    vin: z.string().optional(),
  })
  .partial()
  .optional();

const lineItem = z.object({
  productId: z.string().optional().nullable(),
  slug: z.string().optional(),
  name: z.string().trim().min(1),
  sku: z.string().optional(),
  partNumber: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  note: z.string().optional(),
});

const orderItem = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  note: z.string().optional(),
});

// ── public create ────────────────────────────────────────────────────────────
export const whatsappInquirySchema = z.object({
  contact,
  vehicle,
  emirate: z.string().optional(),
  items: z.array(lineItem).optional(),
  message: z.string().optional(),
});

export const contactInquirySchema = z.object({
  contact,
  vehicle,
  message: z.string().trim().min(1, 'Message is required'),
});

export const leadSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.coerce.number().int().optional(),
  requiredPart: z.string().optional(),
  notes: z.string().optional(),
});

export const quoteRequestSchema = z.object({
  contact,
  vehicle,
  items: z.array(lineItem).optional(),
  notes: z.string().optional(),
});

export const orderSchema = z.object({
  contact,
  shippingAddress: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      emirate: z.string().optional(),
      country: z.string().optional(),
    })
    .partial()
    .optional(),
  vehicle,
  items: z.array(orderItem).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

// ── admin updates ────────────────────────────────────────────────────────────
export const inquiryStatusSchema = z.object({ status: asEnum(INQUIRY_STATUSES) });
export const leadStatusSchema = z.object({ status: asEnum(LEAD_STATUSES) });
export const orderStatusSchema = z.object({
  status: asEnum(ORDER_STATUSES),
  note: z.string().optional(),
});
export const notesSchema = z.object({ internalNotes: z.string() });

export const orderUpdateSchema = z.object({
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  items: z
    .array(
      lineItem.extend({ unitPrice: z.number().int().nonnegative().nullable().optional() }),
    )
    .optional(),
});

export type WhatsappInquiryInput = z.infer<typeof whatsappInquirySchema>;
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
