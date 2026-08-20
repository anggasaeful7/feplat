import { api } from "@/lib/axios";
import type { User, UserListResponse, CreateUserPayload, UpdateUserPayload } from "@/types";

export type ListUsersParams = {
  search?: string;
  workspace_id?: string;
  tenant_id?: string;
  role?: string;
  limit?: number;
  offset?: number;
};

export const UserService = {
  getUsers: async (params?: ListUsersParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.search) searchParams.append("search", params.search);
      if (params.workspace_id) searchParams.append("workspace_id", params.workspace_id);
      if (params.tenant_id) searchParams.append("tenant_id", params.tenant_id);
      if (params.role) searchParams.append("role", params.role);
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
    }
    const query = searchParams.toString();
    const path = `/users${query ? `?${query}` : ""}`;
    return api<UserListResponse>(path);
  },

  getUser: async (id: string) => {
    return api<User>(`/users/${encodeURIComponent(id)}`);
  },

  createUser: async (payload: CreateUserPayload) => {
    return api<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUser: async (id: string, payload: UpdateUserPayload) => {
    return api<User>(`/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteUser: async (id: string) => {
    return api(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  changePassword: async (id: string, payload: { password: string; confPassword: string }) => {
    return api(`/users/${encodeURIComponent(id)}/password`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  setUserActive: async (id: string, isActive: boolean) => {
    return api<User>(`/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  },
};
