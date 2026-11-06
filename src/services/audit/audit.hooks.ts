"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditService } from "./audit.service";
import type { AuditLogListQuery } from "./audit.types";

export const auditKeys = {
  adminList: (q: Partial<AuditLogListQuery>) => ["admin", "audit", q] as const,
};

export function useAdminAuditLogs(q: Partial<AuditLogListQuery> = {}) {
  return useQuery({
    queryKey: auditKeys.adminList(q),
    queryFn: () => auditService.adminList(q),
    placeholderData: keepPreviousData,
  });
}
