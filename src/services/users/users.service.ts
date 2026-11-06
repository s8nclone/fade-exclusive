import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  AdminStaffUserDTO,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from "./users.types";

export const usersService = {
  list: async () =>
    (await http.get<ApiSuccess<AdminStaffUserDTO[]>>("/admin/users")).data.data,

  create: async (input: CreateAdminUserInput) =>
    (await http.post<ApiSuccess<AdminStaffUserDTO>>("/admin/users", input)).data.data,

  update: async (id: string, input: UpdateAdminUserInput) =>
    (
      await http.patch<ApiSuccess<AdminStaffUserDTO>>(
        `/admin/users/${encodeURIComponent(id)}`,
        input,
      )
    ).data.data,
};
