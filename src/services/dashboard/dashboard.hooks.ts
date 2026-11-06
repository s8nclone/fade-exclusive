"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";

export const dashboardKeys = {
  summary: ["admin", "dashboard"] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: () => dashboardService.getSummary(),
    staleTime: 15_000,
  });
}
