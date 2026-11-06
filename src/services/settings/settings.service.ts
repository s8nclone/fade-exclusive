import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  AdminSettingsBundleDTO,
  BankAccountDTO,
  PublicSettingsDTO,
  UpdateSettingsInput,
  UpsertBankAccountInput,
} from "./settings.types";

export const settingsService = {
  getPublic: async () =>
    (await http.get<ApiSuccess<PublicSettingsDTO>>("/public/settings")).data.data,

  adminGet: async () =>
    (await http.get<ApiSuccess<AdminSettingsBundleDTO>>("/admin/settings")).data.data,

  adminUpdate: async (input: UpdateSettingsInput) =>
    (await http.put<ApiSuccess<AdminSettingsBundleDTO>>("/admin/settings", input)).data
      .data,

  adminUpsertBankAccount: async (input: UpsertBankAccountInput) =>
    (
      await http.post<ApiSuccess<BankAccountDTO>>(
        "/admin/settings/bank-accounts",
        input,
      )
    ).data.data,
};
