import { api } from "@/lib/axios";
import type { AuditLogFilters, AuditLogListResponse } from "@/types";

export const AuditLogService = {
  getAuditLogs: async (filters: AuditLogFilters = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    const path = `/audit-logs${query ? `?${query}` : ""}`;
    return api<AuditLogListResponse>(path);
  },
};
