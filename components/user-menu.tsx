"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import type { AuthUser } from "@/types";
import { useLogout } from "@/hooks/use-logout";

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Superadmin",
  owner_workspace: "Tenant Admin",
  admin_workspace: "Workspace Admin",
};

export function UserMenu({ user }: { user: AuthUser | null }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogout();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const initials = user
    ? user.full_name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("") || user.email.slice(0, 2).toUpperCase()
    : "?";

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="ml-1 grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-brand text-white ring-2 ring-surface transition hover:opacity-90"
      >
        <span className="text-sm font-semibold">{initials}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <div className="truncate text-sm font-semibold text-foreground">
              {user?.full_name ?? "Unknown user"}
            </div>
            <div className="mt-0.5 truncate text-xs text-muted">
              {user?.email ?? "—"}
            </div>
            {user?.role && (
              <span className="mt-2 inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-brand">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            )}
          </div>

          <ul className="py-1 text-sm">
            <li>
              <Link
                role="menuitem"
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-foreground/80 hover:bg-surface-muted"
              >
                <CogIcon className="h-4 w-4" />
                Settings
              </Link>
            </li>
            <li>
              <button
                role="menuitem"
                type="button"
                disabled={pending}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-danger hover:bg-danger-soft/60 disabled:opacity-60"
              >
                <LogoutIcon className="h-4 w-4" />
                {pending ? "Signing out…" : "Sign out"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function CogIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
