import type { Role } from "./auth";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  workspace_id?: string;
  tenant_id?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
};

export type UserListResponse = {
  items: User[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateUserPayload = {
  email: string;
  full_name: string;
  password: string;
  role: Role;
  workspace_id?: string;
  tenant_id?: string;
  is_active?: boolean;
};

export type UpdateUserPayload = {
  full_name?: string;
  role?: Role;
  workspace_id?: string;
  tenant_id?: string;
  is_active?: boolean;
};

export const ROLES: Role[] = [
  "superadmin",
  "owner_workspace",
  "admin_workspace",
];

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Superadmin",
  owner_workspace: "Tenant Admin",
  admin_workspace: "Workspace Admin",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  superadmin: "Full platform control across every workspace.",
  owner_workspace: "Owns multiple workspaces and manages their admins.",
  admin_workspace: "Operational access within a single workspace.",
};

export const DEFAULT_USERS_PAGE_SIZE = 10;
