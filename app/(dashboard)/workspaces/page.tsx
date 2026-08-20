import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  TrendUpIcon,
} from "@/app/_components/icons";
import { ApiError } from "@/lib/axios";
import { WorkspaceService } from "@/services/workspace.service";
import { TenantService } from "@/services/tenant.service";
import { DEFAULT_PAGE_SIZE } from "@/types/workspace";
import type { WorkspaceListResponse, Tenant } from "@/types";
import { SearchForm } from "@/components/search-form";

// Shared components
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";

// Local components & utils
import { WorkspaceCard } from "./_components/workspace-card";
import { clampInt, isExpiringSoon } from "@/lib/utils";

const ACCENTS = [
  "bg-[#1f2937] text-white",
  "bg-[#dbeafe] text-[#1d4ed8]",
  "bg-[#0f172a] text-white",
  "bg-[#fde68a] text-[#854d0e]",
  "bg-[#dcfce7] text-[#166534]",
  "bg-[#fce7f3] text-[#9d174d]",
];

type SearchParams = {
  search?: string;
  offset?: string;
  limit?: string;
};

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const limit = clampInt(params.limit, DEFAULT_PAGE_SIZE, 1, 200);
  const offset = clampInt(params.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  let data: WorkspaceListResponse | null = null;
  let tenants: Tenant[] = [];
  let loadError: string | null = null;

  try {
    const [workspacesRes, tenantsRes] = await Promise.all([
      WorkspaceService.getWorkspaces({ search: search || undefined, limit, offset }),
      TenantService.getTenants({ limit: 200 }).catch(() => ({ items: [] as Tenant[] })),
    ]);
    data = workspacesRes;
    tenants = tenantsRes?.items ?? [];
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to reach the platform service. Try again in a moment.";
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const expiringSoon = items.filter((w) => isExpiringSoon(w.expired_at)).length;
  const filtering = Boolean(search);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Workspace Management
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Oversee and configure all tenant workspaces across the platform.
          </p>
        </div>

        <Link
          href="/workspaces/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
        >
          <PlusIcon className="h-4 w-4" />
          Add Workspace
        </Link>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Active Workspaces"
          value={loadError ? "—" : total.toLocaleString()}
          tone="brand"
          footerIcon={<TrendUpIcon className="h-4 w-4 text-success" />}
          footer={
            filtering
              ? `Showing matches for "${search}"`
              : "Across the entire platform"
          }
        />
        <StatCard
          label="Expiring Soon"
          value={loadError ? "—" : String(expiringSoon)}
          tone="warning"
          footerIcon={<ClockIcon className="h-4 w-4 text-warning" />}
          footer="Within the next 30 days (this page)"
        />
        <StatCard
          label="System Health"
          value="99.9%"
          tone="success"
          footerIcon={<CheckCircleIcon className="h-4 w-4 text-success" />}
          footer="All systems operational"
        />
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Active Directories
          </h2>
          <div className="flex items-center gap-3">
            <SearchForm placeholder="Search by name or slug…" />
          </div>
        </div>

        {loadError ? (
          <ErrorState message={loadError} title="Couldn't load workspaces" />
        ) : items.length === 0 ? (
          <EmptyState
            title={filtering ? `No workspaces match "${search}"` : "No workspaces yet"}
            description={
              filtering
                ? "Try a different search term, or clear the filter to see everything."
                : "Provision your first tenant workspace to begin onboarding teams."
            }
            actionHref={filtering ? undefined : "/workspaces/new"}
            actionLabel={filtering ? undefined : "Add your first workspace"}
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {(() => {
                const tenantMap = new Map(tenants.map((t) => [t.id, t]));
                return items.map((w, i) => {
                  const tenant = w.tenant_id ? tenantMap.get(w.tenant_id) : undefined;
                  return (
                    <WorkspaceCard
                      key={w.id}
                      workspace={w}
                      accent={ACCENTS[i % ACCENTS.length]}
                      tenant={tenant}
                    />
                  );
                });
              })()}
            </div>

            <Pagination
              total={total}
              limit={limit}
              offset={offset}
              shown={items.length}
              createPageUrl={(nextOffset) => {
                const params = new URLSearchParams();
                if (search) params.set("search", search);
                if (limit !== DEFAULT_PAGE_SIZE) params.set("limit", String(limit));
                if (nextOffset > 0) params.set("offset", String(nextOffset));
                return `/workspaces${params.size ? `?${params.toString()}` : ""}`;
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
