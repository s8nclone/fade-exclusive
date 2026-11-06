import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type { DashboardSummaryDTO } from "./dashboard.types";

export const dashboardService = {
  getSummary: async () =>
    (await http.get<ApiSuccess<DashboardSummaryDTO>>("/admin/dashboard")).data.data,
};
