import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { AuditLogListQuery, AuditLogListResponse } from "./audit.types";

export const auditService = {
  adminList: async (q: Partial<AuditLogListQuery> = {}) =>
    (
      await http.get<ApiSuccess<AuditLogListResponse>>("/admin/audit", {
        params: q,
      })
    ).data.data,
};
