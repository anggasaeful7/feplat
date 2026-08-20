import { api } from "@/lib/axios";
import type { AuthUser } from "@/types";

export const AuthService = {
  getCurrentUser: async () => {
    return api<AuthUser>("/auth/me");
  },

  login: async (body: Record<string, unknown>) => {
    // Calling the local next route handler to set the HttpOnly session cookie
    return api<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  logout: async () => {
    // Calling the local next route handler to clear the HttpOnly session cookie
    return api<void>("/auth/logout", {
      method: "POST",
    });
  },
};
