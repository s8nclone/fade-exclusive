import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password is required"),
  turnstileToken: z.string().optional(),
});
