import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  AdminPaginated,
  AdminProductDTO,
  AdminProductListQuery,
  BulkProductActionInput,
  CategoryDTO,
  Paginated,
  ProductCardDTO,
  ProductDetailDTO,
  ProductListQuery,
  UpsertProductInput,
} from "./products.types";

export const productsService = {
  list: async (q: Partial<ProductListQuery>) =>
    (
      await http.get<ApiSuccess<Paginated<ProductCardDTO>>>("/public/products", {
        params: q,
      })
    ).data.data,

  detail: async (slug: string) =>
    (
      await http.get<ApiSuccess<ProductDetailDTO>>(
        `/public/products/${encodeURIComponent(slug)}`,
      )
    ).data.data,

  adminList: async (q: Partial<AdminProductListQuery>) =>
    (
      await http.get<
        ApiSuccess<AdminPaginated<AdminProductDTO> & { categories: CategoryDTO[] }>
      >("/admin/products", {
        params: q,
      })
    ).data.data,

  create: async (input: UpsertProductInput) =>
    (await http.post<ApiSuccess<AdminProductDTO>>("/admin/products", input)).data.data,

  update: async (id: string, input: Partial<UpsertProductInput>) =>
    (
      await http.patch<ApiSuccess<AdminProductDTO>>(
        `/admin/products/${encodeURIComponent(id)}`,
        input,
      )
    ).data.data,

  duplicate: async (id: string) =>
    (
      await http.post<ApiSuccess<AdminProductDTO>>(
        `/admin/products/${encodeURIComponent(id)}/duplicate`,
      )
    ).data.data,

  archiveOrDelete: async (id: string, permanent = false) =>
    (
      await http.delete<ApiSuccess<{ id: string; mode: "archived" | "deleted" }>>(
        `/admin/products/${encodeURIComponent(id)}`,
        { params: { permanent: permanent ? "true" : "false" } },
      )
    ).data.data,

  bulkAction: async (input: BulkProductActionInput) =>
    (await http.post<ApiSuccess<{ updatedCount: number }>>("/admin/products/bulk", input))
      .data.data,
};
