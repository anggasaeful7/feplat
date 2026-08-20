"use client";

import { usePathname } from "next/navigation";
import type { AuthUser } from "@/types";
import { UserMenu } from "./user-menu";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tenants": "Tenants",
  "/workspaces": "WorkspaceAdmin",
  "/maps": "Maps",
  "/user-access": "User Access",
  "/analytics": "Analytics",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
  "/support": "Support",
};

function resolveTitle(pathname: string) {
  if (pathname === "/workspaces/new") return "New Workspace";
  if (/^\/workspaces\/[^/]+\/edit$/.test(pathname)) return "Edit Workspace";
  const key = Object.keys(titles).find(
    (k) => pathname === k || pathname.startsWith(k + "/")
  );
  return key ? titles[key] : "Dashboard";
}

export function Topbar({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-border bg-background/85 px-8 backdrop-blur">
      <h2 className="text-2xl font-semibold tracking-tight text-brand">
        {title}
      </h2>

      <div className="flex items-center gap-2">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
