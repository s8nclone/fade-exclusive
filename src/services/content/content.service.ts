import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  ContentPageDTO,
  PressItemDTO,
  UpdateContentPageInput,
  UpsertPressItemInput,
} from "./content.types";

export const contentService = {
  listPress: async () =>
    (await http.get<ApiSuccess<PressItemDTO[]>>("/public/press")).data.data,

  getPage: async (slug: string) =>
    (
      await http.get<ApiSuccess<ContentPageDTO>>(
        `/public/content/${encodeURIComponent(slug)}`,
      )
    ).data.data,

  adminGetContentBundle: async () =>
    (
      await http.get<
        ApiSuccess<{ pages: ContentPageDTO[]; pressItems: PressItemDTO[] }>
      >("/admin/content")
    ).data.data,

  adminUpdatePage: async (slug: string, input: UpdateContentPageInput) =>
    (
      await http.put<ApiSuccess<ContentPageDTO>>(
        `/admin/content/${encodeURIComponent(slug)}`,
        input,
      )
    ).data.data,

  adminCreatePress: async (input: UpsertPressItemInput) =>
    (await http.post<ApiSuccess<PressItemDTO>>("/admin/press", input)).data.data,
};
