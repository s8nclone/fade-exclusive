import type { z } from "zod";
import type { adminLoginSchema } from "./auth.schema";

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export interface AdminUserSessionDTO {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager";
  totpEnabled: boolean;
}
