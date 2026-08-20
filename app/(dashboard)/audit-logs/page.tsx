import { ClockIcon } from "@/app/_components/icons";
import { ApiError } from "@/lib/axios";
import { AuditLogService } from "@/services/audit-log.service";
import {
  clampInt,
  trimOrUndefined,
} from "@/lib/utils";
import {
  DEFAULT_AUDIT_PAGE_SIZE,
} from "@/types/audit-log";
import { ErrorState } from "@/components/error-state";
import { Pagination } from "@/components/pagination";
import { AuditTable } from "./_components/audit-table";
import { FiltersForm } from "./_components/filters-form";

type SearchParams = {
  search?: string;
  actor_email?: string;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  offset?: string;
  limit?: string;
};

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = {
    search: trimOrUndefined(sp.search),
    actor_email: trimOrUndefined(sp.actor_email),
    action: trimOrUndefined(sp.action),
    resource_type: trimOrUndefined(sp.resource_type),
    date_from: trimOrUndefined(sp.date_from),
    date_to: trimOrUndefined(sp.date_to),
    limit: clampInt(sp.limit, DEFAULT_AUDIT_PAGE_SIZE, 1, 200),
    offset: clampInt(sp.offset, 0, 0, Number.MAX_SAFE_INTEGER),
  };

  let data = null;
  let loadError: string | null = null;
  try {
    data = await AuditLogService.getAuditLogs(filters);
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load audit logs.";
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted max-w-xl">
            Chronological record of every administrative action across the platform.
          </p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
          <ClockIcon className="h-6 w-6" />
        </div>
      </header>

      <FiltersForm initial={filters} />

      {loadError ? (
        <ErrorState message={loadError} />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">
          No audit events match these filters.
        </div>
      ) : (
        <>
          <AuditTable items={items} />

          <Pagination
            total={total}
            limit={filters.limit}
            offset={filters.offset}
            shown={items.length}
            createPageUrl={(nextOffset) => {
              const u = new URLSearchParams();
              for (const [k, v] of Object.entries(sp)) {
                if (k === "offset") continue;
                if (v) u.set(k, v);
              }
              if (nextOffset > 0) u.set("offset", String(nextOffset));
              return `/audit-logs${u.size ? `?${u.toString()}` : ""}`;
            }}
            createPageSizeUrl={(newLimit) => {
              const u = new URLSearchParams();
              for (const [k, v] of Object.entries(sp)) {
                if (k === "offset" || k === "limit") continue;
                if (v) u.set(k, v);
              }
              if (newLimit !== DEFAULT_AUDIT_PAGE_SIZE) u.set("limit", String(newLimit));
              return `/audit-logs${u.size ? `?${u.toString()}` : ""}`;
            }}
          />
        </>
      )}
    </div>
  );
}
