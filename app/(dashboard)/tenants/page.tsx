import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
} from "@/app/_components/icons";
import { ApiError } from "@/lib/axios";
import { clampInt } from "@/lib/utils";
import { TenantService } from "@/services/tenant.service";
import { DEFAULT_TENANTS_PAGE_SIZE } from "@/types/tenant";
import type { Tenant, TenantListResponse } from "@/types";
import { TenantsTable } from "./_components/tenants-table";
import { TenantFormPanel } from "./_components/tenant-form-panel";
import { StatCard } from "@/components/stat-card";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SearchForm } from "@/components/search-form";

const BASE_PATH = "/tenants";

type SearchParams = {
  search?: string;
  offset?: string;
  limit?: string;
  panel?: "new" | "edit";
  id?: string;
};

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const limit = clampInt(params.limit, DEFAULT_TENANTS_PAGE_SIZE, 1, 200);
  const offset = clampInt(params.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  let data: TenantListResponse | null = null;
  let loadError: string | null = null;

  try {
    data = await TenantService.getTenants({ search: search || undefined, limit, offset });
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to reach the platform service. Try again in a moment.";
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const filtering = Boolean(search);

  // Compute stats for current page / view
  const activeCount = items.filter((t) => t.is_active).length;
  const inactiveCount = items.filter((t) => !t.is_active).length;

  const panel = params.panel;
  const panelOpen = Boolean(panel);
  let panelTenant: Tenant | undefined = undefined;

  if (panel && panel !== "new" && params.id) {
    panelTenant = items.find((t) => t.id === params.id);
    if (!panelTenant) {
      try {
        panelTenant = await TenantService.getTenant(params.id);
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Tenant Management
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Provision and configure tenant residency directories across the platform.
          </p>
        </div>

        <Link
          href={`${BASE_PATH}?panel=new`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
        >
          <PlusIcon className="h-4 w-4" />
          Add Tenant
        </Link>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Tenants"
          value={loadError ? "—" : total.toLocaleString()}
          tone="brand"
          icon={<UsersIcon className="h-4 w-4 text-brand" />}
          footer={
            filtering
              ? `Showing matches for "${search}"`
              : "Across the entire platform"
          }
        />
        <StatCard
          label="Active Tenants"
          value={loadError ? "—" : String(items.filter(t => t.is_active).length + (total > items.length ? " (page)" : ""))}
          tone="success"
          icon={<CheckCircleIcon className="h-4 w-4 text-success" />}
          footer={`${activeCount} active in current view`}
        />
        <StatCard
          label="Inactive Tenants"
          value={loadError ? "—" : String(items.filter(t => !t.is_active).length + (total > items.length ? " (page)" : ""))}
          tone="warning"
          icon={<ClockIcon className="h-4 w-4 text-warning" />}
          footer={`${inactiveCount} inactive in current view`}
        />
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Active Directories
          </h2>
          <div className="flex items-center gap-3">
            <SearchForm placeholder="Search tenants by name or slug…" />
          </div>
        </div>

        {loadError ? (
          <ErrorState message={loadError} />
        ) : items.length === 0 ? (
          <EmptyState
            title={filtering ? `No tenants match "${search}"` : "No tenants yet"}
            description={
              filtering
                ? "Try a different search term, or clear the filter to see everything."
                : "Provision your first platform tenant workspace to begin onboarding teams."
            }
            actionHref={!filtering ? `${BASE_PATH}?panel=new` : undefined}
            actionLabel={!filtering ? "Add your first tenant" : undefined}
          />
        ) : (
          <>
            <TenantsTable
              tenants={items}
              basePath={BASE_PATH}
            />

            <Pagination
              total={total}
              limit={limit}
              offset={offset}
              shown={items.length}
              createPageUrl={(nextOffset) => {
                const params = new URLSearchParams();
                if (search) params.set("search", search);
                if (limit !== DEFAULT_TENANTS_PAGE_SIZE) params.set("limit", String(limit));
                if (nextOffset > 0) params.set("offset", String(nextOffset));
                return `/tenants${params.size ? `?${params.toString()}` : ""}`;
              }}
            />
          </>
        )}
      </section>

      <TenantFormPanel
        open={panelOpen}
        mode={panel === "edit" ? "edit" : "new"}
        tenant={panelTenant}
        closeHref={buildHrefWithoutPanel(params)}
      />
    </div>
  );
}


function buildHrefWithoutPanel(params: SearchParams) {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.limit) sp.set("limit", params.limit);
  if (params.offset) sp.set("offset", params.offset);
  return `${BASE_PATH}${sp.size ? `?${sp.toString()}` : ""}`;
}
