import { ProductAvailability, ProductStatus, STOREFRONT_VISIBLE_STATUSES } from '@sm/shared';
import { Product, type ProductDoc } from '../../models/Product';
import { Brand } from '../../models/Brand';
import { Category } from '../../models/Category';
import { Subcategory } from '../../models/Subcategory';
import { AppError } from '../../utils/AppError';
import { uniqueSlug } from '../../utils/slug';
import { destroyAsset } from '../../config/cloudinary';
import type { ProductInput, ProductUpdateInput } from './catalog.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SCALAR_FIELDS = [
  'name',
  'sku',
  'partNumber',
  'oemNumber',
  'productType',
  'productFamily',
  'condition',
  'warranty',
  'shortDescription',
  'description',
  'currency',
  'imageKey',
  'featured',
  'trending',
] as const;

function assignScalars(doc: ProductDoc, input: ProductUpdateInput) {
  for (const key of SCALAR_FIELDS) {
    if (input[key] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any)[key] = input[key];
    }
  }
  if (input.price !== undefined) doc.price = input.price ?? null;
  if (input.costPrice !== undefined) doc.costPrice = input.costPrice ?? null;
  if (input.highlights !== undefined) doc.set('highlights', input.highlights);
  if (input.specs !== undefined) doc.set('specs', input.specs);
  if (input.fitments !== undefined) doc.set('fitments', input.fitments);
  if (input.images !== undefined) {
    doc.set(
      'images',
      input.images.map((im, i) => ({
        publicId: im.publicId ?? null,
        url: im.url,
        alt: im.alt,
        sortOrder: im.sortOrder ?? i,
      })),
    );
  }
}

async function applyRefs(doc: ProductDoc, input: ProductUpdateInput) {
  if (input.brandId !== undefined) {
    if (input.brandId) {
      const brand = await Brand.findById(input.brandId);
      if (!brand) throw AppError.badRequest('Invalid brandId');
      doc.brand = brand._id;
      doc.brandName = brand.name;
      doc.brandSlug = brand.slug;
    } else {
      doc.set('brand', undefined);
      doc.brandName = undefined;
      doc.brandSlug = undefined;
    }
  }
  if (input.categoryId !== undefined) {
    if (input.categoryId) {
      const cat = await Category.findById(input.categoryId);
      if (!cat) throw AppError.badRequest('Invalid categoryId');
      doc.category = cat._id;
      doc.categoryName = cat.name;
      doc.categorySlug = cat.slug;
    } else {
      doc.set('category', undefined);
      doc.categoryName = undefined;
      doc.categorySlug = undefined;
    }
  }
  if (input.subcategoryId !== undefined) {
    if (input.subcategoryId) {
      const sub = await Subcategory.findById(input.subcategoryId);
      if (!sub) throw AppError.badRequest('Invalid subcategoryId');
      doc.subcategory = sub._id;
      doc.subcategoryName = sub.name;
    } else {
      doc.set('subcategory', undefined);
      doc.subcategoryName = undefined;
    }
  }
}

// ── writes ───────────────────────────────────────────────────────────────────
export async function createProduct(input: ProductInput): Promise<ProductDoc> {
  const doc = new Product();
  doc.slug = await uniqueSlug(Product, input.name);
  assignScalars(doc, input);
  await applyRefs(doc, input);
  doc.status = (input.status as ProductStatus | undefined) ?? ProductStatus.Draft;
  doc.availability =
    (input.availability as ProductAvailability | undefined) ??
    (doc.price != null ? ProductAvailability.Available : ProductAvailability.OnRequest);
  await doc.save();
  return doc;
}

export async function updateProduct(id: string, input: ProductUpdateInput): Promise<ProductDoc> {
  const doc = await Product.findById(id);
  if (!doc) throw AppError.notFound('Product not found');
  assignScalars(doc, input);
  await applyRefs(doc, input);
  if (input.status !== undefined) doc.status = input.status as ProductStatus;
  if (input.availability !== undefined) doc.availability = input.availability as ProductAvailability;
  await doc.save();
  return doc;
}

export async function setStatus(id: string, status: ProductStatus): Promise<ProductDoc> {
  const doc = await Product.findById(id);
  if (!doc) throw AppError.notFound('Product not found');
  doc.status = status;
  await doc.save();
  return doc;
}

export async function deleteProduct(id: string): Promise<void> {
  const doc = await Product.findById(id);
  if (!doc) throw AppError.notFound('Product not found');
  for (const img of doc.images ?? []) {
    // eslint-disable-next-line no-await-in-loop
    await destroyAsset(img.publicId);
  }
  await doc.deleteOne();
}

export async function addImage(
  id: string,
  img: { publicId?: string | null; url: string; alt?: string; sortOrder?: number },
): Promise<ProductDoc> {
  const doc = await Product.findById(id);
  if (!doc) throw AppError.notFound('Product not found');
  const sortOrder = img.sortOrder ?? (doc.images?.length ?? 0);
  doc.images.push({ publicId: img.publicId ?? null, url: img.url, alt: img.alt, sortOrder });
  await doc.save();
  return doc;
}

export async function removeImage(id: string, key: string): Promise<ProductDoc> {
  const doc = await Product.findById(id);
  if (!doc) throw AppError.notFound('Product not found');
  const match = (i: { publicId?: string | null; url: string }) => i.publicId === key || i.url === key;
  const target = (doc.images ?? []).find(match);
  doc.set('images', (doc.images ?? []).filter((i) => !match(i)));
  await doc.save();
  if (target) await destroyAsset(target.publicId);
  return doc;
}

export async function reorderImages(id: string, order: string[]): Promise<ProductDoc> {
  const doc = await Product.findById(id);
  if (!doc) throw AppError.notFound('Product not found');
  doc.images.forEach((i, idx) => {
    const key = i.publicId ?? i.url;
    const pos = order.indexOf(key);
    i.sortOrder = pos === -1 ? idx : pos;
  });
  await doc.save();
  return doc;
}

// ── admin reads ──────────────────────────────────────────────────────────────
interface AdminListQuery {
  q?: string;
  status?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listAdmin(query: AdminListQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = query.brand;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { name: rx },
      { sku: rx },
      { partNumber: rx },
      { oemNumber: rx },
      { brandName: rx },
    ];
  }
  const [data, total] = await Promise.all([
    Product.find(filter)
      .sort(query.sort || '-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);
  return { data, total, page, limit };
}

export async function getById(id: string): Promise<ProductDoc> {
  const doc = await Product.findById(id);
  if (!doc) throw AppError.notFound('Product not found');
  return doc;
}

// ── public reads ─────────────────────────────────────────────────────────────
interface PublicListQuery {
  categorySlug?: string;
  brandSlug?: string;
  subcategory?: string;
  make?: string;
  model?: string;
  availability?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listPublic(query: PublicListQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(60, Math.max(1, query.limit ?? 24));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { status: { $in: STOREFRONT_VISIBLE_STATUSES } };

  if (query.categorySlug) {
    const cat = await Category.findOne({ slug: query.categorySlug, isActive: true });
    filter.category = cat?._id ?? null;
  }
  if (query.brandSlug) {
    const brand = await Brand.findOne({ slug: query.brandSlug, isActive: true });
    filter.brand = brand?._id ?? null;
  }
  if (query.subcategory) filter.subcategory = query.subcategory;
  if (query.availability) filter.availability = query.availability;
  if (query.featured !== undefined) filter.featured = query.featured;
  if (query.make) filter['fitments.make'] = new RegExp(`^${escapeRegex(query.make)}$`, 'i');
  if (query.model) filter['fitments.model'] = new RegExp(escapeRegex(query.model), 'i');

  const [data, total] = await Promise.all([
    Product.find(filter)
      .sort(query.sort || '-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);
  return { data, total, page, limit };
}

export async function getBySlugPublic(slug: string): Promise<ProductDoc> {
  const doc = await Product.findOne({ slug, status: { $in: STOREFRONT_VISIBLE_STATUSES } });
  if (!doc) throw AppError.notFound('Product not found');
  return doc;
}

export async function relatedPublic(slug: string): Promise<ProductDoc[]> {
  const p = await Product.findOne({ slug, status: { $in: STOREFRONT_VISIBLE_STATUSES } });
  if (!p) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const or: any[] = [];
  if (p.category) or.push({ category: p.category });
  if (p.brand) or.push({ brand: p.brand });
  if (!or.length) return [];
  return Product.find({
    status: { $in: STOREFRONT_VISIBLE_STATUSES },
    _id: { $ne: p._id },
    $or: or,
  }).limit(8);
}

export async function searchPublic(q: string, page = 1, limit = 24): Promise<ProductDoc[]> {
  const lim = Math.min(60, Math.max(1, limit));
  const skip = (Math.max(1, page) - 1) * lim;
  const visible = { status: { $in: STOREFRONT_VISIBLE_STATUSES } };

  const byText = await Product.find(
    { ...visible, $text: { $search: q } },
    { score: { $meta: 'textScore' } },
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(lim);
  if (byText.length) return byText;

  // Fallback: substring match on codes / names (handles partial part numbers).
  const rx = new RegExp(escapeRegex(q), 'i');
  return Product.find({
    ...visible,
    $or: [
      { name: rx },
      { sku: rx },
      { partNumber: rx },
      { oemNumber: rx },
      { brandName: rx },
      { fitmentText: rx },
    ],
  })
    .skip(skip)
    .limit(lim);
}
