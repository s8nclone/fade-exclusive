import { z } from "zod";

export const createAdminUserSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email address is required"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .max(128),
  role: z.enum(["owner", "manager"]).default("manager"),
});

export const updateAdminUserSchema = z.object({
  isActive: z.boolean().optional(),
  newPassword: z.string().min(12).max(128).optional(),
  totpEnabled: z.boolean().optional(),
});
