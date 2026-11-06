import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { BannerDTO, UpsertBannerInput } from "./banners.types";

export const bannersService = {
  listPublic: async () =>
    (await http.get<ApiSuccess<BannerDTO[]>>("/public/banners")).data.data,

  adminList: async () =>
    (await http.get<ApiSuccess<BannerDTO[]>>("/admin/banners")).data.data,

  create: async (input: UpsertBannerInput) =>
    (await http.post<ApiSuccess<BannerDTO>>("/admin/banners", input)).data.data,

  update: async (id: string, input: Partial<UpsertBannerInput>) =>
    (
      await http.patch<ApiSuccess<BannerDTO>>(
        `/admin/banners/${encodeURIComponent(id)}`,
        input,
      )
    ).data.data,

  remove: async (id: string) =>
    (
      await http.delete<ApiSuccess<{ id: string }>>(
        `/admin/banners/${encodeURIComponent(id)}`,
      )
    ).data.data,
};
