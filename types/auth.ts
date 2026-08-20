export type Role = "superadmin" | "owner_workspace" | "admin_workspace";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  workspace_id?: string;
  tenant_id?: string;
  is_active: boolean;
};

export type LoginResponse = {
  access_token: string;
  expires_at: string;
  token_type: string;
  user: AuthUser;
};

export type APIError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type Envelope<T> = {
  data?: T;
  error?: APIError;
};
