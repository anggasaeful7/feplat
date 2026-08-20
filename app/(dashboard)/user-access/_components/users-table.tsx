"use client";

import Link from "next/link";
import type { Tenant, User, Workspace } from "@/types";
import { RoleBadge } from "./role-badge";
import { RowMenu } from "./row-menu";
import { StatusToggle } from "./status-toggle";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { initials, relativeTime } from "@/lib/utils";

type Props = {
  users: User[];
  workspaces: Workspace[];
  tenants: Tenant[];
  currentUserId?: string;
  basePath: string;
};

export function UsersTable({
  users,
  workspaces,
  tenants,
  currentUserId,
  basePath,
}: Props) {
  const tntMap = new Map(tenants.map((w) => [w.id, w]));
  const wsMap = new Map(workspaces.map((w) => [w.id, w]));

  return (
    <TableContainer>
      <TableHeader>
        <tr>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Workspace</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last login</TableHead>
          <TableHead className="text-right pr-5">Actions</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {users.map((u) => {
          const tenant = u.tenant_id
            ? tntMap.get(u.tenant_id)
            : null;
          const workspace = u.workspace_id
            ? wsMap.get(u.workspace_id)
            : null;
          const isSelf = currentUserId === u.id;

          return (
            <TableRow key={u.id}>
              <TableCell>
                <Link
                  href={`${basePath}?panel=edit&id=${u.id}`}
                  className="flex items-center gap-3"
                >
                  <Avatar name={u.full_name} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">
                        {u.full_name}
                      </span>
                      {isSelf && (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand">
                          You
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {u.email}
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <RoleBadge role={u.role} />
              </TableCell>
              <TableCell>
                {tenant ? (
                  <Link
                    href={`/tenant/${tenant.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-sm text-foreground/85 hover:text-brand"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded bg-surface-muted text-[10px] font-bold">
                      {initials(tenant.name)}
                    </span>
                    <span className="truncate">
                      {tenant.name}
                    </span>
                  </Link>
                ) : u.tenant_id ? (
                  <span className="font-mono text-xs text-muted">
                    {u.tenant_id.slice(0, 8)}…
                  </span>
                ) : (
                  <span className="text-xs text-muted">-</span>
                )}
              </TableCell>
              <TableCell>
                {workspace ? (
                  <Link
                    href={`/workspaces/${workspace.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-sm text-foreground/85 hover:text-brand"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded bg-surface-muted text-[10px] font-bold">
                      {initials(workspace.display_name)}
                    </span>
                    <span className="truncate">
                      {workspace.display_name}
                    </span>
                  </Link>
                ) : u.workspace_id ? (
                  <span className="font-mono text-xs text-muted">
                    {u.workspace_id.slice(0, 8)}…
                  </span>
                ) : (
                  <span className="text-xs text-muted">Platform-wide</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusToggle
                    id={u.id}
                    active={u.is_active}
                    disabled={isSelf}
                  />
                  <span
                    className={`text-xs ${u.is_active ? "text-success" : "text-muted"}`}
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted">
                  {relativeTime(u.last_login_at)}
                </span>
              </TableCell>
              <TableCell className="text-right pr-3">
                <RowMenu
                  userId={u.id}
                  userName={u.full_name}
                  basePath={basePath}
                  isSelf={isSelf}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </TableContainer>
  );
}
