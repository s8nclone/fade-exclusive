import type { z } from "zod";
import type { createAdminUserSchema, updateAdminUserSchema } from "./users.schema";

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;

export interface AdminStaffUserDTO {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager";
  isActive: boolean;
  totpEnabled: boolean;
  createdAt: string;
}
