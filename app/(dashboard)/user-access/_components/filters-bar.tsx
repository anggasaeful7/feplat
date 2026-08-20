"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { SearchIcon } from "@/app/_components/icons";
import { ROLES, ROLE_LABEL } from "@/types/user";
import type { Workspace, Tenant } from "@/types";

type Props = {
  workspaces: Workspace[];
  tenants: Tenant[];
  basePath: string;
  isOwnerWorkspace?: boolean;
};

export function FiltersBar({ workspaces, tenants, basePath, isOwnerWorkspace = false }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const role = sp.get("role") ?? "";
  const workspaceId = sp.get("workspace_id") ?? "";
  const tenantId = sp.get("tenant_id") ?? "";
  const status = sp.get("status") ?? "";
  const searchParam = sp.get("search") ?? "";
  const [search, setSearch] = useState(searchParam);

  function commit(next: URLSearchParams) {
    next.delete("offset");
    const qs = next.toString();
    router.replace(`${basePath}${qs ? `?${qs}` : ""}`);
  }

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "tenant_id") next.delete("workspace_id");
    commit(next);
  }

  function onSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setSearch(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setParam("search", value.trim() || null), 300);
  }

  const activeFilters = [
    role && {
      key: "role" as const,
      label: ROLE_LABEL[role as keyof typeof ROLE_LABEL] ?? role,
    },
    workspaceId && {
      key: "workspace_id" as const,
      label:
        workspaces.find((w) => w.id === workspaceId)?.display_name ??
        workspaceId.slice(0, 8),
    },
    tenantId && {
      key: "tenant_id" as const,
      label:
        tenants.find((t) => t.id === tenantId)?.name ??
        tenantId.slice(0, 8),
    },
    status && {
      key: "status" as const,
      label: status === "active" ? "Active" : "Inactive",
    },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-56 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-muted">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={search}
            onChange={onSearchChange}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>

        {!isOwnerWorkspace && (
          <Select
            label="Role"
            value={role}
            onChange={(v) => setParam("role", v)}
            options={[
              { value: "", label: "All roles" },
              ...ROLES.filter((r) => r !== "superadmin").map((r) => ({ value: r, label: ROLE_LABEL[r] })),
            ]}
          />
        )}

        {!isOwnerWorkspace && tenants.length > 0 && (
          <Select
            label="Tenant"
            value={tenantId}
            onChange={(v) => setParam("tenant_id", v)}
            options={[
              { value: "", label: "All tenants" },
              ...tenants.map((t) => ({
                value: t.id,
                label: t.name,
              })),
            ]}
          />
        )}

        {workspaces.length > 0 && (
          <Select
            label="Workspace"
            value={workspaceId}
            onChange={(v) => setParam("workspace_id", v)}
            options={[
              { value: "", label: "All workspaces" },
              ...workspaces
                .filter((w) => !tenantId || w.tenant_id === tenantId)
                .map((w) => ({
                  value: w.id,
                  label: w.display_name,
                })),
            ]}
          />
        )}

        <Segmented
          value={status}
          onChange={(v) => setParam("status", v)}
          options={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted">
            Filtering by
          </span>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setParam(f.key, null)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/80 transition hover:border-danger/40 hover:text-danger"
            >
              {f.label}
              <span aria-hidden>×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(sp.toString());
              ["role", "workspace_id", "tenant_id", "status"].forEach((k) =>
                next.delete(k)
              );
              commit(next);
            }}
            className="text-xs font-medium text-brand hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 rounded-full border border-border bg-surface px-3 pr-8 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label}: {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex h-10 items-center rounded-full border border-border bg-surface p-0.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${active
              ? "bg-brand text-white"
              : "text-foreground/70 hover:text-foreground"
              }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
