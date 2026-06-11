import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional(),
  marketingOptIn: z.boolean().optional(),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
  emirate: z.string().optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const vehicleSchema = z.object({
  label: z.string().optional(),
  brand: z.string().trim().min(1),
  model: z.string().optional(),
  generation: z.string().optional(),
  year: z.coerce.number().int().optional(),
  engineType: z.string().optional(),
  vin: z.string().optional(),
});

export const wishlistAddSchema = z.object({ slug: z.string().min(1) });
export const wishlistMergeSchema = z.object({ slugs: z.array(z.string()).default([]) });
