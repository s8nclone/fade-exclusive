import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { Paginated } from "@/services/products/products.types";
import type {
  CollectionCardDTO,
  CollectionDetailDTO,
  CollectionListQuery,
  UpsertCollectionInput,
} from "./collections.types";

export const collectionsService = {
  list: async (q: Partial<CollectionListQuery> = {}) =>
    (
      await http.get<ApiSuccess<Paginated<CollectionCardDTO>>>("/public/collections", {
        params: q,
      })
    ).data.data,

  detail: async (slug: string) =>
    (
      await http.get<ApiSuccess<CollectionDetailDTO>>(
        `/public/collections/${encodeURIComponent(slug)}`,
      )
    ).data.data,

  adminList: async () =>
    (await http.get<ApiSuccess<CollectionDetailDTO[]>>("/admin/collections")).data.data,

  create: async (input: UpsertCollectionInput) =>
    (await http.post<ApiSuccess<CollectionDetailDTO>>("/admin/collections", input)).data
      .data,

  update: async (id: string, input: Partial<UpsertCollectionInput>) =>
    (
      await http.patch<ApiSuccess<CollectionDetailDTO>>(
        `/admin/collections/${encodeURIComponent(id)}`,
        input,
      )
    ).data.data,
};
