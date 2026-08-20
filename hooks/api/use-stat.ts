import { useQuery } from "@tanstack/react-query";
import { StatService } from "@/services/stat.service";
import type { AnalyticsRange } from "@/types";

export const statQK = {
  all: ["stats"] as const,
  overview: () => [...statQK.all, "overview"] as const,
  analytics: (range?: AnalyticsRange) => [...statQK.all, "analytics", range] as const,
};

export function useStatsOverview() {
  return useQuery({
    queryKey: statQK.overview(),
    queryFn: () => StatService.getStatsOverview(),
  });
}

export function useAnalytics(range: AnalyticsRange = "30d") {
  return useQuery({
    queryKey: statQK.analytics(range),
    queryFn: () => StatService.getAnalytics(range),
  });
}
