"use client";

import { useSyncExternalStore } from "react";
import { AUTH_KEYS, readToken, readUser } from "@/lib/auth-storage";
import type { AuthUser } from "@/types";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key === AUTH_KEYS.token || e.key === AUTH_KEYS.user) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function useAccessToken(): string | null | undefined {
  return useSyncExternalStore(subscribe, readToken, () => undefined);
}

export function useAuthUser(): AuthUser | null | undefined {
  return useSyncExternalStore(subscribe, readUser, () => undefined);
}
