export type WorkspaceCount = {
  code: string;
  name: string;
  total: number;
};

export type RoleCount = {
  code: string;
  name: string;
  total: number;
};

export type RecentActivity = {
  id: string;
  action: string;
  actor_email: string | null;
  status_code: number;
  path: string;
  created_at: string;
};

export type StatsOverview = {
  workspaces: {
    total: number;
    expiring_30d: number;
    by_tipe: WorkspaceCount[];
  };
  users: {
    total: number;
    active: number;
    by_role: RoleCount[];
  };
  audit: {
    last_24h: number;
    last_7d: number;
  };
  recent_activity: RecentActivity[];
};

export type SeriesPoint = {
  date: string;
  count: number;
};

export type AnalyticsData = {
  range: string;
  signups_daily: SeriesPoint[];
  workspaces_monthly: SeriesPoint[];
  audit_daily: SeriesPoint[];
};

export type AnalyticsRange = "30d" | "90d" | "12m";
