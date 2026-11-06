import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  ConfirmUploadInput,
  MediaAssetDTO,
  RequestUploadSignInput,
  SignedUploadOfferDTO,
} from "./media.types";

export const mediaService = {
  adminList: async () =>
    (await http.get<ApiSuccess<MediaAssetDTO[]>>("/admin/media")).data.data,

  signUpload: async (input: RequestUploadSignInput) =>
    (
      await http.post<ApiSuccess<SignedUploadOfferDTO>>(
        "/public/uploads/sign",
        input,
      )
    ).data.data,

  confirmUpload: async (input: ConfirmUploadInput) =>
    (
      await http.post<ApiSuccess<MediaAssetDTO>>(
        "/public/uploads/confirm",
        input,
      )
    ).data.data,

  adminDeleteAsset: async (id: string) =>
    (
      await http.delete<ApiSuccess<{ id: string }>>(
        `/admin/media/${encodeURIComponent(id)}`,
      )
    ).data.data,
};
