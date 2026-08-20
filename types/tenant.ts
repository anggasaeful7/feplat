export type Tenant = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

export type TenantListResponse = {
  items: Tenant[];
  total: number;
  limit: number;
  offset: number;
};

export type TenantWritePayload = {
  name: string;
  owner_email: string;
  owner_name: string;
  slug: string;
};

export const DEFAULT_TENANTS_PAGE_SIZE = 10;

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
