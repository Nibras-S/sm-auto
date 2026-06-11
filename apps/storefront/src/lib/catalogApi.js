import { apiClient } from "./apiClient";

// Map an API ProductDTO to the legacy shape the storefront components expect,
// so existing UI (ProductCard, ProductDetail, etc.) keeps working unchanged.
export function mapProduct(dto) {
  if (!dto) return dto;
  return {
    slug: dto.slug,
    name: dto.name,
    sku: dto.sku,
    partNumber: dto.partNumber,
    oemNumber: dto.oemNumber,
    brand: dto.brandName || "",
    category: dto.categorySlug || "",
    categoryName: dto.categoryName || "",
    type: dto.productType || "",
    availability: dto.availability,
    condition: dto.condition,
    warranty: dto.warranty,
    featured: !!dto.featured,
    trending: !!dto.trending,
    shortDescription: dto.shortDescription,
    description: dto.description,
    highlights: dto.highlights || [],
    specs: dto.specs || [],
    fitment: (dto.fitments || []).map((f) =>
      [
        f.make,
        f.model,
        f.generation,
        f.engineType,
        f.yearStart && f.yearEnd ? `${f.yearStart}-${f.yearEnd}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    ),
    images: dto.images || [],
    imageKey: dto.imageKey,
    price: dto.price ?? null,
    currency: dto.currency || "AED",
  };
}

export async function fetchAllProducts() {
  const { data } = await apiClient.get("/catalog/products", { params: { limit: 200 } });
  return (data.data || []).map(mapProduct);
}

export async function fetchProductsByCategory(slug) {
  const { data } = await apiClient.get("/catalog/products", {
    params: { category: slug, limit: 200 },
  });
  return (data.data || []).map(mapProduct);
}

export async function fetchProduct(slug) {
  const { data } = await apiClient.get(`/catalog/products/${slug}`);
  return mapProduct(data.product);
}

export async function fetchRelated(slug) {
  const { data } = await apiClient.get(`/catalog/products/${slug}/related`);
  return (data.related || []).map(mapProduct);
}

export async function searchProducts(q) {
  const { data } = await apiClient.get("/catalog/search", { params: { q } });
  return (data.data || []).map(mapProduct);
}
