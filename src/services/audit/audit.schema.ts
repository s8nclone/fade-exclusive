import { z } from "zod";

export const auditLogListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  entity: z.string().optional(),
  q: z.string().optional(),
});
