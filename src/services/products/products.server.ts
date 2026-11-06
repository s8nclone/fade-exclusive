import "server-only";
import { serverFetch } from "@/lib/http/fetch.server";
import type { Paginated, ProductCardDTO, ProductDetailDTO, ProductListQuery } from "./products.types";

export async function prefetchProductsServer(
  query: Partial<ProductListQuery> = {},
): Promise<Paginated<ProductCardDTO>> {
  const params = new URLSearchParams();
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.type) params.set("type", query.type);
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);

  const qs = params.toString();
  return serverFetch<Paginated<ProductCardDTO>>(`/public/products${qs ? `?${qs}` : ""}`, {
    revalidate: 60,
    tags: ["products"],
  });
}

export async function prefetchProductDetailServer(slug: string): Promise<ProductDetailDTO> {
  return serverFetch<ProductDetailDTO>(`/public/products/${encodeURIComponent(slug)}`, {
    revalidate: 60,
    tags: ["products", `product-${slug}`],
  });
}
