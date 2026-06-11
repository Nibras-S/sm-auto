import { z } from 'zod';
import { PRODUCT_AVAILABILITIES, PRODUCT_CONDITIONS, PRODUCT_STATUSES } from '@sm/shared';

const asEnum = (vals: readonly string[]) => z.enum(vals as [string, ...string[]]);

const imageInput = z.object({
  publicId: z.string().nullable().optional(),
  url: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const specInput = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const fitmentInput = z.object({
  make: z.string().min(1),
  model: z.string().optional(),
  generation: z.string().optional(),
  yearStart: z.number().int().optional(),
  yearEnd: z.number().int().optional(),
  engineType: z.string().optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(1).max(250),
  sku: z.string().min(1).max(80),
  partNumber: z.string().optional(),
  oemNumber: z.string().optional(),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  subcategoryId: z.string().nullable().optional(),
  productType: z.string().optional(),
  productFamily: z.string().optional(),
  condition: asEnum(PRODUCT_CONDITIONS).optional(),
  warranty: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  specs: z.array(specInput).optional(),
  fitments: z.array(fitmentInput).optional(),
  images: z.array(imageInput).optional(),
  imageKey: z.string().nullable().optional(),
  price: z.number().int().nonnegative().nullable().optional(), // integer fils
  costPrice: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().optional(),
  status: asEnum(PRODUCT_STATUSES).optional(),
  availability: asEnum(PRODUCT_AVAILABILITIES).optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
});
export const productUpdateSchema = productCreateSchema.partial();
export const statusSchema = z.object({ status: asEnum(PRODUCT_STATUSES) });
export const imageAddSchema = imageInput;
export const imageReorderSchema = z.object({ order: z.array(z.string()).min(1) });

export const brandCreateSchema = z.object({
  name: z.string().min(1),
  kind: z.array(z.enum(['part', 'vehicle'])).optional(),
  logo: imageInput.nullable().optional(),
  country: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const brandUpdateSchema = brandCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: imageInput.nullable().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const subcategoryCreateSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const subcategoryUpdateSchema = subcategoryCreateSchema.partial();

export type ProductInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type BrandInput = z.infer<typeof brandCreateSchema>;
export type CategoryInput = z.infer<typeof categoryCreateSchema>;
export type SubcategoryInput = z.infer<typeof subcategoryCreateSchema>;
