import type {
  BrandDTO,
  CategoryDTO,
  Paginated,
  ProductDTO,
  ProductStatus,
  SubcategoryDTO,
} from '@sm/shared';
import { api } from './api';

// ── Products ─────────────────────────────────────────────────────────────────
export interface ProductListParams {
  q?: string;
  status?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listProducts(params: ProductListParams): Promise<Paginated<ProductDTO>> {
  const { data } = await api.get('/admin/products', { params });
  return data;
}

export async function getProduct(id: string): Promise<ProductDTO> {
  const { data } = await api.get(`/admin/products/${id}`);
  return data.product;
}

export async function createProduct(body: Record<string, unknown>): Promise<ProductDTO> {
  const { data } = await api.post('/admin/products', body);
  return data.product;
}

export async function updateProduct(id: string, body: Record<string, unknown>): Promise<ProductDTO> {
  const { data } = await api.patch(`/admin/products/${id}`, body);
  return data.product;
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<ProductDTO> {
  const { data } = await api.patch(`/admin/products/${id}/status`, { status });
  return data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}

export async function addProductImage(
  id: string,
  img: { publicId: string | null; url: string; alt?: string },
): Promise<ProductDTO> {
  const { data } = await api.post(`/admin/products/${id}/images`, img);
  return data.product;
}

export async function removeProductImage(id: string, key: string): Promise<ProductDTO> {
  const { data } = await api.delete(`/admin/products/${id}/images`, { params: { key } });
  return data.product;
}

// ── Cloudinary upload ────────────────────────────────────────────────────────
interface SignResult {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
}

export async function uploadImage(file: File): Promise<{ publicId: string; url: string }> {
  const { data: sig } = await api.post<SignResult>('/admin/uploads/sign');
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = await res.json();
  return { publicId: json.public_id as string, url: json.secure_url as string };
}

// ── Categories ───────────────────────────────────────────────────────────────
export async function listCategories(): Promise<CategoryDTO[]> {
  const { data } = await api.get('/admin/categories');
  return data.categories;
}
export async function createCategory(body: Record<string, unknown>): Promise<CategoryDTO> {
  const { data } = await api.post('/admin/categories', body);
  return data.category;
}
export async function updateCategory(id: string, body: Record<string, unknown>): Promise<CategoryDTO> {
  const { data } = await api.patch(`/admin/categories/${id}`, body);
  return data.category;
}
export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}

// ── Brands ───────────────────────────────────────────────────────────────────
export async function listBrands(): Promise<BrandDTO[]> {
  const { data } = await api.get('/admin/brands');
  return data.brands;
}
export async function createBrand(body: Record<string, unknown>): Promise<BrandDTO> {
  const { data } = await api.post('/admin/brands', body);
  return data.brand;
}
export async function updateBrand(id: string, body: Record<string, unknown>): Promise<BrandDTO> {
  const { data } = await api.patch(`/admin/brands/${id}`, body);
  return data.brand;
}
export async function deleteBrand(id: string): Promise<void> {
  await api.delete(`/admin/brands/${id}`);
}

// ── Subcategories ────────────────────────────────────────────────────────────
export async function listSubcategories(categoryId?: string): Promise<SubcategoryDTO[]> {
  const { data } = await api.get('/admin/subcategories', { params: { category: categoryId } });
  return data.subcategories;
}
export async function createSubcategory(body: Record<string, unknown>): Promise<SubcategoryDTO> {
  const { data } = await api.post('/admin/subcategories', body);
  return data.subcategory;
}
export async function updateSubcategory(id: string, body: Record<string, unknown>): Promise<SubcategoryDTO> {
  const { data } = await api.patch(`/admin/subcategories/${id}`, body);
  return data.subcategory;
}
export async function deleteSubcategory(id: string): Promise<void> {
  await api.delete(`/admin/subcategories/${id}`);
}
