import "server-only";
import { getStore } from "@/server/db/client";
import type { SeedAuditLog } from "@/server/db/seed-data";

export interface RecordAuditParams {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  beforeJson?: unknown;
  afterJson?: unknown;
}

export function recordAuditLog(params: RecordAuditParams): SeedAuditLog {
  const store = getStore();
  const entry: SeedAuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    summary: params.summary,
    beforeJson: params.beforeJson ?? null,
    afterJson: params.afterJson ?? null,
    createdAt: new Date().toISOString(),
  };
  store.auditLogs.unshift(entry);
  return entry;
}
