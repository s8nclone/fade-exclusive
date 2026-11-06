import type { z } from "zod";
import type { auditLogListQuerySchema } from "./audit.schema";
import type { AdminPaginated } from "@/services/products/products.types";

export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>;

export interface AuditLogDTO {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  beforeJson: unknown;
  afterJson: unknown;
  createdAt: string;
}

export type AuditLogListResponse = AdminPaginated<AuditLogDTO>;
