import Link from "next/link";
import { ApiError } from "@/lib/axios";
import { StatService } from "@/services/stat.service";
import type { RoleCount, WorkspaceCount } from "@/types";
import { StatCard } from "./_components/stat-card";

export default async function DashboardPage() {
  let data = null;
  let loadError: string | null = null;

  try {
    data = await StatService.getStatsOverview();
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load dashboard data.";
  }

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted max-w-xl">
          A unified overview of platform health, workspace activity, and recent
          administrative events.
        </p>
      </header>

      {loadError ? (
        <ErrorState message={loadError} />
      ) : data ? (
        <>
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Workspaces"
              value={data.workspaces.total}
              tone="brand"
              hint="All non-deleted tenants"
            />
            <StatCard
              label="Active Users"
              value={data.users.active}
              tone="success"
              hint={`of ${data.users.total} total`}
            />
            <StatCard
              label="Workspaces Expiring 30d"
              value={data.workspaces.expiring_30d}
              tone="warning"
              hint="Within the next 30 days"
            />
            <StatCard
              label="Audit Events 24h"
              value={data.audit.last_24h}
              tone="muted"
              hint={`${data.audit.last_7d.toLocaleString()} in last 7d`}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <BreakdownCard
              title="Workspaces by type"
              items={data.workspaces.by_tipe.map((w: WorkspaceCount) => ({
                label: w.name || w.code,
                count: w.total,
              }))}
            />
            <BreakdownCard
              title="Users by role"
              items={data.users.by_role.map((r: RoleCount) => ({
                label: r.name || r.code,
                count: r.total,
              }))}
            />
          </section>

          <section className="rounded-2xl border border-border bg-surface">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold">Recent Activity</h2>
              <Link
                href="/audit-logs"
                className="text-xs font-medium text-brand hover:underline"
              >
                View all →
              </Link>
            </header>
            <ul className="divide-y divide-border">
              {data.recent_activity.length === 0 ? (
                <li className="p-6 text-sm text-muted">
                  No activity recorded yet.
                </li>
              ) : (
                data.recent_activity.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm"
                  >
                    <span className="text-xs text-muted whitespace-nowrap">
                      {formatTime(a.created_at)}
                    </span>
                    <span className="font-mono text-xs text-foreground/80">
                      {a.action}
                    </span>
                    {a.actor_email && (
                      <span className="text-xs text-muted">
                        by {a.actor_email}
                      </span>
                    )}
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs font-mono ${statusTone(a.status_code)}`}
                    >
                      {a.status_code}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.length === 0 && (
          <li className="text-sm text-muted">No data.</li>
        )}
        {items.map((it) => (
          <li key={it.label} className="space-y-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-foreground">{it.label}</span>
              <span className="font-mono text-xs text-muted">{it.count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full bg-brand"
                style={{ width: `${(it.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-8">
      <h3 className="text-base font-semibold text-danger">
        Couldn&apos;t load dashboard data
      </h3>
      <p className="mt-1 text-sm text-foreground/70">{message}</p>
    </div>
  );
}

function statusTone(code: number) {
  if (code >= 500) return "bg-danger-soft text-danger";
  if (code >= 400) return "bg-warning-soft text-warning";
  return "bg-success-soft text-success";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
