export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  method: string;
  path: string;
  status_code: number;
  ip: string | null;
  user_agent: string | null;
  request_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AuditLogListResponse = {
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
};

export type AuditLogFilters = {
  search?: string;
  actor_email?: string;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};

export const DEFAULT_AUDIT_PAGE_SIZE = 10;
