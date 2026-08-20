import { useQuery } from "@tanstack/react-query";
import { AuditLogService } from "@/services/audit-log.service";
import type { AuditLogFilters } from "@/types";

export const auditLogQK = {
  all: ["auditLogs"] as const,
  list: (filters?: AuditLogFilters) => [...auditLogQK.all, filters] as const,
};

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogQK.list(filters),
    queryFn: () => AuditLogService.getAuditLogs(filters),
  });
}
