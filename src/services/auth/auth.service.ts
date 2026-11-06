import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { AdminLoginInput, AdminUserSessionDTO } from "./auth.types";

export const authService = {
  login: async (input: AdminLoginInput) =>
    (
      await http.post<ApiSuccess<{ user: AdminUserSessionDTO }>>(
        "/auth/login",
        input,
      )
    ).data.data,

  me: async () =>
    (await http.get<ApiSuccess<{ user: AdminUserSessionDTO | null }>>("/auth/session"))
      .data.data,

  logout: async (allDevices = false) =>
    (
      await http.post<ApiSuccess<{ ok: boolean }>>("/auth/logout", {
        allDevices,
      })
    ).data.data,
};
