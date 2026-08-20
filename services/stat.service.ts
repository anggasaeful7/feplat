import { api } from "@/lib/axios";
import type { AnalyticsData, AnalyticsRange, StatsOverview } from "@/types";

export const StatService = {
  getStatsOverview: async () => {
    return api<StatsOverview>("/stats/overview");
  },

  getAnalytics: async (range: AnalyticsRange = "30d") => {
    return api<AnalyticsData>(`/stats/analytics?range=${range}`);
  },
};
