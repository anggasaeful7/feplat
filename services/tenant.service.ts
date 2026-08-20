import { api } from "@/lib/axios";
import type { Tenant, TenantListResponse, TenantWritePayload } from "@/types";

export type ListTenantsParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export const TenantService = {
  getTenants: async (params?: ListTenantsParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.search) searchParams.append("search", params.search);
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
    }
    const query = searchParams.toString();
    const path = `/tenants${query ? `?${query}` : ""}`;
    return api<TenantListResponse>(path);
  },

  getTenant: async (id: string) => {
    return api<Tenant>(`/tenants/${encodeURIComponent(id)}`);
  },

  createTenant: async (payload: TenantWritePayload) => {
    return api<Tenant>("/tenants", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTenant: async (id: string, payload: Partial<TenantWritePayload> & { is_active?: boolean }) => {
    return api<Tenant>(`/tenants/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteTenant: async (id: string) => {
    return api(`/tenants/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  setTenantActive: async (id: string, isActive: boolean) => {
    return api<Tenant>(`/tenants/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  },
};
