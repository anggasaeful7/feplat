import Link from "next/link";
import { PlusIcon, UsersIcon } from "@/app/_components/icons";
import { ApiError } from "@/lib/axios";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
import { WorkspaceService } from "@/services/workspace.service";
import { TenantService } from "@/services/tenant.service";
import type { Role } from "@/types";
import {
  DEFAULT_USERS_PAGE_SIZE,
  ROLE_LABEL,
  // ROLES,
} from "@/types/user";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
// import { StatCard } from "@/components/stat-card";
import { FiltersBar } from "./_components/filters-bar";
// import { computeStats } from "./_lib/stats";
import { UserFormPanel } from "./_components/user-form-panel";
import { UsersTable } from "./_components/users-table";

const BASE_PATH = "/user-access";

type SearchParams = {
  search?: string;
  role?: string;
  workspace_id?: string;
  tenant_id?: string;
  status?: string;
  limit?: string;
  offset?: string;
  panel?: "new" | "edit" | "password";
  id?: string;
};

export default async function UserAccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const roleFilter = params.role ?? "";
  const workspaceFilter = params.workspace_id ?? "";
  const tenantFilter = params.tenant_id ?? "";
  const statusFilter = params.status ?? "";
  const limit = clampInt(params.limit, DEFAULT_USERS_PAGE_SIZE, 1, 200);
  const offset = clampInt(params.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  // Resolve current user first to determine role-based scoping
  const currentUserResult = await AuthService.getCurrentUser().catch(() => null);
  const currentUser = currentUserResult ?? null;
  const isOwnerWorkspace = currentUser?.role === "owner_workspace";

  // owner_workspace can only manage admin_workspace users;
  // workspace scoping is handled by the backend (tenant-level) — no need to force workspace_id here.
  const effectiveRole = isOwnerWorkspace ? "admin_workspace" : roleFilter || undefined;

  const [usersResult, workspacesResult, tenantsResult] =
    await Promise.allSettled([
      UserService.getUsers({
        search: search || undefined,
        role: effectiveRole,
        workspace_id: workspaceFilter || undefined,
        tenant_id: tenantFilter || undefined,
        limit,
        offset,
      }),
      WorkspaceService.getWorkspaces({ limit: 200 }),
      // Tenants only needed for superadmin (owner_workspace can't manage tenants)
      isOwnerWorkspace ? Promise.resolve({ items: [], total: 0, limit: 200, offset: 0 }) : TenantService.getTenants({ limit: 200 }),
    ]);
  console.log(usersResult)
  const loadError =
    usersResult.status === "rejected"
      ? errorMessage(usersResult.reason)
      : null;

  const allUsers =
    usersResult.status === "fulfilled" ? usersResult.value.items : [];
  const total =
    usersResult.status === "fulfilled" ? usersResult.value.total : 0;
  const workspaces =
    workspacesResult.status === "fulfilled"
      ? workspacesResult.value.items
      : [];
  const tenants =
    tenantsResult.status === "fulfilled"
      ? tenantsResult.value.items
      : [];

  const users = allUsers.filter((u) => {
    if (statusFilter === "active" && !u.is_active) return false;
    if (statusFilter === "inactive" && u.is_active) return false;
    return true;
  });

  // const stats = computeStats(allUsers, total);

  const panel = params.panel;
  const panelOpen = Boolean(panel);
  const panelUser =
    panel && panel !== "new" && params.id
      ? allUsers.find((u) => u.id === params.id)
      : undefined;

  const filteringHints = [
    search ? `“${search}”` : null,
    roleFilter ? (ROLE_LABEL[roleFilter as Role] ?? roleFilter) : null,
    tenantFilter
      ? (tenants.find((t) => t.id === tenantFilter)?.name ?? "selected tenant")
      : null,
    workspaceFilter
      ? (workspaces.find((w) => w.id === workspaceFilter)?.display_name ??
        "selected workspace")
      : null,
    statusFilter
      ? statusFilter === "active"
        ? "active only"
        : "inactive only"
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {isOwnerWorkspace ? "Workspace Admins" : "User Access"}
          </h1>
          <p className="text-sm text-muted max-w-xl">
            {isOwnerWorkspace
              ? "Manage the administrator accounts for your workspace."
              : "Manage administrators and operators across the entire fleet. Roles map directly to permission scopes on the platform."}
          </p>
        </div>

        <Link
          href={`${BASE_PATH}?panel=new`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
        >
          <PlusIcon className="h-4 w-4" />
          {isOwnerWorkspace ? "Add admin" : "Invite user"}
        </Link>
      </header>

      {/* <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={isOwnerWorkspace ? "Workspace Admins" : "Total Users"}
          value={loadError ? "—" : stats.total.toLocaleString()}
          tone="brand"
          icon={<UsersIcon className="h-4 w-4" />}
          footer={isOwnerWorkspace ? "In your workspace" : "Across the platform"}
        />
        <StatCard
          label="Active"
          value={loadError ? "—" : stats.active.toLocaleString()}
          tone="success"
          icon={<CheckCircleIcon className="h-4 w-4" />}
          footer={`${stats.activePct}% of accounts on this page`}
        />
        {(isOwnerWorkspace ? (["admin_workspace"] as Role[]) : ROLES).map((r) => (
          <StatCard
            key={r}
            label={ROLE_LABEL[r]}
            value={loadError ? "—" : String(stats.byRole[r])}
            tone="brand"
            icon={
              <span
                className={`block h-2 w-2 rounded-full ${
                  r === "superadmin"
                    ? "bg-brand"
                    : r === "owner_workspace"
                      ? "bg-[#92400e]"
                      : "bg-[#1d4ed8]"
                }`}
              />
            }
            footer="In the current view"
          />
        ))}
      </section> */}

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Directory</h2>
          {filteringHints.length > 0 && (
            <p className="text-xs text-muted">
              Showing {users.length} {users.length === 1 ? "match" : "matches"}{" "}
              · {filteringHints.join(" · ")}
            </p>
          )}
        </div>

        <FiltersBar
          workspaces={workspaces}
          tenants={tenants}
          basePath={BASE_PATH}
          isOwnerWorkspace={isOwnerWorkspace}
        />

        {loadError ? (
          <ErrorState message={loadError} />
        ) : users.length === 0 ? (
          <EmptyState
            title={
              filteringHints.length > 0
                ? "No users match your filters"
                : isOwnerWorkspace
                  ? "No admins yet"
                  : "No users yet"
            }
            description={
              filteringHints.length > 0
                ? "Try a different search term, or clear the filters to see everyone."
                : isOwnerWorkspace
                  ? "Add the first workspace admin to help manage operations."
                  : "Invite the first operator to start managing the platform together."
            }
            actionHref={filteringHints.length === 0 ? `${BASE_PATH}?panel=new` : undefined}
            actionLabel={
              filteringHints.length === 0
                ? isOwnerWorkspace
                  ? "Add first admin"
                  : "Invite your first user"
                : undefined
            }
            icon={<UsersIcon className="h-7 w-7" />}
          />
        ) : (
          <>
            <UsersTable
              users={users}
              workspaces={workspaces}
              tenants={tenants}
              currentUserId={currentUser?.id}
              basePath={BASE_PATH}
            />

            <Pagination
              total={total}
              limit={limit}
              offset={offset}
              shown={users.length}
              createPageUrl={(nextOffset) => {
                const sp = new URLSearchParams();
                if (search) sp.set("search", search);
                if (roleFilter) sp.set("role", roleFilter);
                if (workspaceFilter) sp.set("workspace_id", workspaceFilter);
                if (tenantFilter) sp.set("tenant_id", tenantFilter);
                if (statusFilter) sp.set("status", statusFilter);
                if (limit !== DEFAULT_USERS_PAGE_SIZE) sp.set("limit", String(limit));
                if (nextOffset > 0) sp.set("offset", String(nextOffset));
                return `${BASE_PATH}${sp.size ? `?${sp.toString()}` : ""}`;
              }}
            />
          </>
        )}
      </section>

      <UserFormPanel
        open={panelOpen}
        mode={panel === "edit" ? "edit" : panel === "password" ? "password" : "new"}
        user={panelUser}
        workspaces={workspaces}
        tenants={tenants}
        closeHref={buildHrefWithoutPanel(params)}
        isOwnerWorkspace={isOwnerWorkspace}
      />
    </div>
  );
}

function buildHrefWithoutPanel(params: SearchParams) {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.role) sp.set("role", params.role);
  if (params.workspace_id) sp.set("workspace_id", params.workspace_id);
  if (params.tenant_id) sp.set("tenant_id", params.tenant_id);
  if (params.status) sp.set("status", params.status);
  if (params.limit) sp.set("limit", params.limit);
  if (params.offset) sp.set("offset", params.offset);
  return `${BASE_PATH}${sp.size ? `?${sp.toString()}` : ""}`;
}

function clampInt(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function errorMessage(reason: unknown) {
  if (reason instanceof ApiError) return reason.message;
  return "Unable to reach the platform service. Try again in a moment.";
}

