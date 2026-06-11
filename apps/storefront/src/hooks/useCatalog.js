import { useQuery } from "@tanstack/react-query";
import {
  fetchAllProducts,
  fetchProduct,
  fetchProductsByCategory,
  fetchRelated,
  searchProducts,
} from "../lib/catalogApi";

export function useAllProducts() {
  const q = useQuery({ queryKey: ["products"], queryFn: fetchAllProducts });
  const products = q.data ?? [];
  const productBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
  return { products, productBrands, isLoading: q.isLoading, isError: q.isError };
}

export function useFeaturedProducts() {
  const { products, isLoading } = useAllProducts();
  return { featured: products.filter((p) => p.featured), products, isLoading };
}

export function useProductsByCategory(slug) {
  const q = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: () => fetchProductsByCategory(slug),
    enabled: Boolean(slug),
  });
  return { products: q.data ?? [], isLoading: q.isLoading };
}

export function useProduct(slug) {
  const q = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: Boolean(slug),
    retry: false,
  });
  return { product: q.data, isLoading: q.isLoading, notFound: q.isError };
}

export function useRelatedProducts(slug) {
  const q = useQuery({
    queryKey: ["related", slug],
    queryFn: () => fetchRelated(slug),
    enabled: Boolean(slug),
  });
  return { related: q.data ?? [] };
}

export function useSearch(query) {
  const q = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProducts(query),
    enabled: Boolean(query && query.trim()),
  });
  return { results: q.data ?? [], isLoading: q.isLoading };
}
