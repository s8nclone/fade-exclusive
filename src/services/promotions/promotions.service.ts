import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { PromotionAdminDTO, UpsertPromotionInput } from "./promotions.types";

export const promotionsService = {
  adminList: async () =>
    (await http.get<ApiSuccess<PromotionAdminDTO[]>>("/admin/promotions")).data.data,

  create: async (input: UpsertPromotionInput) =>
    (await http.post<ApiSuccess<PromotionAdminDTO>>("/admin/promotions", input)).data.data,

  update: async (id: string, input: Partial<UpsertPromotionInput>) =>
    (
      await http.patch<ApiSuccess<PromotionAdminDTO>>(
        `/admin/promotions/${encodeURIComponent(id)}`,
        input,
      )
    ).data.data,

  duplicate: async (id: string) =>
    (
      await http.post<ApiSuccess<PromotionAdminDTO>>(
        `/admin/promotions/${encodeURIComponent(id)}/duplicate`,
      )
    ).data.data,
};
