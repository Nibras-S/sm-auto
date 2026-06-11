import { asyncHandler } from '../../utils/asyncHandler';
import * as tax from './taxonomy.service';
import { toBrandDTO, toCategoryDTO, toSubcategoryDTO } from './serializers';
import {
  brandCreateSchema,
  brandUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  subcategoryCreateSchema,
  subcategoryUpdateSchema,
} from './catalog.validation';

const str = (v: unknown) => (typeof v === 'string' && v.length ? v : undefined);

// ── brands ───────────────────────────────────────────────────────────────────
export const publicBrands = asyncHandler(async (_req, res) => {
  res.json({ brands: (await tax.listBrands(true)).map(toBrandDTO) });
});
export const adminListBrands = asyncHandler(async (_req, res) => {
  res.json({ brands: (await tax.listBrands(false)).map(toBrandDTO) });
});
export const adminCreateBrand = asyncHandler(async (req, res) => {
  const input = brandCreateSchema.parse(req.body);
  res.status(201).json({ brand: toBrandDTO(await tax.createBrand(input)) });
});
export const adminUpdateBrand = asyncHandler(async (req, res) => {
  const input = brandUpdateSchema.parse(req.body);
  res.json({ brand: toBrandDTO(await tax.updateBrand(req.params.id, input)) });
});
export const adminDeleteBrand = asyncHandler(async (req, res) => {
  await tax.deleteBrand(req.params.id);
  res.status(204).send();
});

// ── categories ───────────────────────────────────────────────────────────────
export const publicCategories = asyncHandler(async (_req, res) => {
  res.json({ categories: (await tax.listCategories(true)).map(toCategoryDTO) });
});
export const publicCategoryDetail = asyncHandler(async (req, res) => {
  res.json({ category: toCategoryDTO(await tax.getCategoryBySlug(req.params.slug)) });
});
export const adminListCategories = asyncHandler(async (_req, res) => {
  res.json({ categories: (await tax.listCategories(false)).map(toCategoryDTO) });
});
export const adminCreateCategory = asyncHandler(async (req, res) => {
  const input = categoryCreateSchema.parse(req.body);
  res.status(201).json({ category: toCategoryDTO(await tax.createCategory(input)) });
});
export const adminUpdateCategory = asyncHandler(async (req, res) => {
  const input = categoryUpdateSchema.parse(req.body);
  res.json({ category: toCategoryDTO(await tax.updateCategory(req.params.id, input)) });
});
export const adminDeleteCategory = asyncHandler(async (req, res) => {
  await tax.deleteCategory(req.params.id);
  res.status(204).send();
});

// ── subcategories ────────────────────────────────────────────────────────────
export const publicSubcategories = asyncHandler(async (req, res) => {
  const slug = str(req.query.category);
  let categoryId: string | undefined;
  if (slug) {
    const cat = await tax.getCategoryBySlug(slug).catch(() => null);
    if (!cat) {
      res.json({ subcategories: [] });
      return;
    }
    categoryId = cat.id;
  }
  const list = await tax.listSubcategories({ categoryId, activeOnly: true });
  res.json({ subcategories: list.map(toSubcategoryDTO) });
});
export const adminListSubcategories = asyncHandler(async (req, res) => {
  const list = await tax.listSubcategories({ categoryId: str(req.query.category), activeOnly: false });
  res.json({ subcategories: list.map(toSubcategoryDTO) });
});
export const adminCreateSubcategory = asyncHandler(async (req, res) => {
  const input = subcategoryCreateSchema.parse(req.body);
  res.status(201).json({ subcategory: toSubcategoryDTO(await tax.createSubcategory(input)) });
});
export const adminUpdateSubcategory = asyncHandler(async (req, res) => {
  const input = subcategoryUpdateSchema.parse(req.body);
  res.json({ subcategory: toSubcategoryDTO(await tax.updateSubcategory(req.params.id, input)) });
});
export const adminDeleteSubcategory = asyncHandler(async (req, res) => {
  await tax.deleteSubcategory(req.params.id);
  res.status(204).send();
});

// ── filters ──────────────────────────────────────────────────────────────────
export const publicFilters = asyncHandler(async (_req, res) => {
  res.json(await tax.getFilterOptions());
});
