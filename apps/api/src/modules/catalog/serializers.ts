import type {
  BrandDTO,
  CategoryDTO,
  CloudImage,
  ProductAvailability,
  ProductCondition,
  ProductDTO,
  ProductStatus,
  SubcategoryDTO,
} from '@sm/shared';
import type { ProductDoc } from '../../models/Product';
import type { BrandDoc } from '../../models/Brand';
import type { CategoryDoc } from '../../models/Category';
import type { SubcategoryDoc } from '../../models/Subcategory';

type Timestamped = { createdAt?: Date; updatedAt?: Date };
const iso = (d?: Date) => (d ? d.toISOString() : undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function image(i: any): CloudImage {
  return {
    publicId: i.publicId ?? null,
    url: i.url,
    alt: i.alt ?? undefined,
    sortOrder: i.sortOrder ?? 0,
  };
}

export function toBrandDTO(b: BrandDoc): BrandDTO {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo ? image(b.logo) : null,
    country: b.country ?? undefined,
    kind: (b.kind ?? []) as string[],
    displayOrder: b.displayOrder ?? 0,
    isActive: b.isActive ?? true,
  };
}

export function toCategoryDTO(c: CategoryDoc): CategoryDTO {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    icon: c.icon ? image(c.icon) : null,
    displayOrder: c.displayOrder ?? 0,
    isActive: c.isActive ?? true,
  };
}

export function toSubcategoryDTO(s: SubcategoryDoc): SubcategoryDTO {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    categoryId: String(s.category),
    categoryName: s.categoryName ?? undefined,
    displayOrder: s.displayOrder ?? 0,
    isActive: s.isActive ?? true,
  };
}

export function toProductDTO(p: ProductDoc): ProductDTO {
  const ts = p as unknown as Timestamped;
  const images = [...(p.images ?? [])]
    .map(image)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    partNumber: p.partNumber ?? undefined,
    oemNumber: p.oemNumber ?? undefined,
    brandId: p.brand ? String(p.brand) : null,
    brandName: p.brandName ?? undefined,
    brandSlug: p.brandSlug ?? undefined,
    categoryId: p.category ? String(p.category) : null,
    categoryName: p.categoryName ?? undefined,
    categorySlug: p.categorySlug ?? undefined,
    subcategoryId: p.subcategory ? String(p.subcategory) : null,
    subcategoryName: p.subcategoryName ?? undefined,
    productType: p.productType ?? undefined,
    productFamily: p.productFamily ?? undefined,
    condition: (p.condition as ProductCondition | undefined) ?? undefined,
    warranty: p.warranty ?? undefined,
    shortDescription: p.shortDescription ?? undefined,
    description: p.description ?? undefined,
    highlights: p.highlights ?? [],
    specs: (p.specs ?? []).map((s) => ({ label: s.label, value: s.value })),
    fitments: (p.fitments ?? []).map((f) => ({
      make: f.make,
      model: f.model ?? undefined,
      generation: f.generation ?? undefined,
      yearStart: f.yearStart ?? undefined,
      yearEnd: f.yearEnd ?? undefined,
      engineType: f.engineType ?? undefined,
    })),
    images,
    imageKey: p.imageKey ?? null,
    price: p.price ?? null,
    costPrice: p.costPrice ?? null,
    currency: p.currency ?? 'AED',
    status: p.status as ProductStatus,
    availability: p.availability as ProductAvailability,
    featured: Boolean(p.featured),
    trending: Boolean(p.trending),
    createdAt: iso(ts.createdAt),
    updatedAt: iso(ts.updatedAt),
  };
}
