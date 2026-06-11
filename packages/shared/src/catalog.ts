// Catalog transport shapes shared by the API and the admin app.

import type { ProductAvailability, ProductCondition, ProductStatus } from './enums';

export interface CloudImage {
  /** Cloudinary public_id (null for legacy / externally-hosted images). */
  publicId: string | null;
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

/** Denormalized vehicle fitment row (no separate vehicle collections). */
export interface ProductFitment {
  make: string;
  model?: string;
  generation?: string;
  yearStart?: number;
  yearEnd?: number;
  engineType?: string;
}

export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  logo?: CloudImage | null;
  country?: string;
  kind: string[]; // 'part' and/or 'vehicle'
  displayOrder: number;
  isActive: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: CloudImage | null;
  displayOrder: number;
  isActive: boolean;
}

export interface SubcategoryDTO {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  partNumber?: string;
  oemNumber?: string;
  brandId?: string | null;
  brandName?: string;
  brandSlug?: string;
  categoryId?: string | null;
  categoryName?: string;
  categorySlug?: string;
  subcategoryId?: string | null;
  subcategoryName?: string;
  productType?: string;
  productFamily?: string;
  condition?: ProductCondition;
  warranty?: string;
  shortDescription?: string;
  description?: string;
  highlights: string[];
  specs: ProductSpec[];
  fitments: ProductFitment[];
  images: CloudImage[];
  /** Legacy bundled-asset key used as an image fallback for seeded products. */
  imageKey?: string | null;
  price: number | null; // integer fils; null => On Request
  costPrice?: number | null;
  currency: string;
  status: ProductStatus;
  availability: ProductAvailability;
  featured: boolean;
  trending: boolean;
  createdAt?: string;
  updatedAt?: string;
}
