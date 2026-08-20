"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth-storage";
import { useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";

export function useLogout(redirectTo: string = "/login") {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.error("Logout API call failed", e);
    }
    clearAuth();
    queryClient.clear();
    router.push(redirectTo);
  }, [router, redirectTo, queryClient]);
}
