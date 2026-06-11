import { Brand } from '../../models/Brand';
import { Category } from '../../models/Category';
import { Subcategory } from '../../models/Subcategory';
import { Product } from '../../models/Product';
import { AppError } from '../../utils/AppError';
import { slugify, uniqueSlug } from '../../utils/slug';
import type { BrandInput, CategoryInput, SubcategoryInput } from './catalog.validation';

// ── Brands ───────────────────────────────────────────────────────────────────
export function listBrands(activeOnly = false) {
  return Brand.find(activeOnly ? { isActive: true } : {}).sort('displayOrder name');
}

export async function createBrand(input: BrandInput) {
  const slug = await uniqueSlug(Brand, input.name);
  return Brand.create({ ...input, slug, kind: input.kind ?? ['vehicle'] });
}

export async function updateBrand(id: string, input: Partial<BrandInput>) {
  const brand = await Brand.findById(id);
  if (!brand) throw AppError.notFound('Brand not found');
  brand.set(input);
  await brand.save();
  return brand;
}

export async function deleteBrand(id: string) {
  if (await Product.exists({ brand: id })) {
    throw AppError.conflict('This brand is used by products and cannot be deleted');
  }
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) throw AppError.notFound('Brand not found');
}

// ── Categories ───────────────────────────────────────────────────────────────
export function listCategories(activeOnly = false) {
  return Category.find(activeOnly ? { isActive: true } : {}).sort('displayOrder name');
}

export async function getCategoryBySlug(slug: string) {
  const cat = await Category.findOne({ slug });
  if (!cat) throw AppError.notFound('Category not found');
  return cat;
}

export async function createCategory(input: CategoryInput) {
  const slug = await uniqueSlug(Category, input.name);
  return Category.create({ ...input, slug });
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const cat = await Category.findById(id);
  if (!cat) throw AppError.notFound('Category not found');
  cat.set(input);
  await cat.save();
  return cat;
}

export async function deleteCategory(id: string) {
  if (await Product.exists({ category: id })) {
    throw AppError.conflict('This category is used by products and cannot be deleted');
  }
  if (await Subcategory.exists({ category: id })) {
    throw AppError.conflict('Remove this category’s subcategories first');
  }
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) throw AppError.notFound('Category not found');
}

// ── Subcategories ────────────────────────────────────────────────────────────
async function uniqueSubSlug(categoryId: unknown, base: string, excludeId?: string) {
  const root = slugify(base) || 'item';
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (
    await Subcategory.exists({
      category: categoryId,
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

export function listSubcategories(opts: { categoryId?: string; activeOnly?: boolean } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (opts.categoryId) filter.category = opts.categoryId;
  if (opts.activeOnly) filter.isActive = true;
  return Subcategory.find(filter).sort('displayOrder name');
}

export async function createSubcategory(input: SubcategoryInput) {
  const cat = await Category.findById(input.categoryId);
  if (!cat) throw AppError.badRequest('Invalid categoryId');
  const slug = await uniqueSubSlug(cat._id, input.name);
  return Subcategory.create({
    name: input.name,
    slug,
    category: cat._id,
    categoryName: cat.name,
    displayOrder: input.displayOrder ?? 0,
    isActive: input.isActive ?? true,
  });
}

export async function updateSubcategory(id: string, input: Partial<SubcategoryInput>) {
  const sub = await Subcategory.findById(id);
  if (!sub) throw AppError.notFound('Subcategory not found');
  if (input.categoryId) {
    const cat = await Category.findById(input.categoryId);
    if (!cat) throw AppError.badRequest('Invalid categoryId');
    sub.category = cat._id;
    sub.categoryName = cat.name;
  }
  if (input.name !== undefined) sub.name = input.name;
  if (input.displayOrder !== undefined) sub.displayOrder = input.displayOrder;
  if (input.isActive !== undefined) sub.isActive = input.isActive;
  await sub.save();
  return sub;
}

export async function deleteSubcategory(id: string) {
  if (await Product.exists({ subcategory: id })) {
    throw AppError.conflict('This subcategory is used by products and cannot be deleted');
  }
  const sub = await Subcategory.findByIdAndDelete(id);
  if (!sub) throw AppError.notFound('Subcategory not found');
}

// ── Filters (storefront facets) ──────────────────────────────────────────────
export async function getFilterOptions() {
  const [categories, brands, makes, models] = await Promise.all([
    Category.find({ isActive: true }).sort('displayOrder name').select('name slug'),
    Brand.find({ isActive: true }).sort('displayOrder name').select('name slug'),
    Product.distinct('fitments.make', { status: 'Active' }),
    Product.distinct('fitments.model', { status: 'Active' }),
  ]);
  return {
    categories: categories.map((c) => ({ name: c.name, slug: c.slug })),
    brands: brands.map((b) => ({ name: b.name, slug: b.slug })),
    makes: (makes as string[]).filter(Boolean).sort(),
    models: (models as string[]).filter(Boolean).sort(),
  };
}
