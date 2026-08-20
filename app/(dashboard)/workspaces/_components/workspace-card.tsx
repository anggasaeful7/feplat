import React from "react";
import Link from "next/link";
import { PencilIcon } from "@/app/_components/icons";
import { DeleteWorkspaceButton } from "./delete-workspace-button";
import { TIPE_WORKSPACE_LABELS } from "@/types/workspace";
import type { Workspace, Tenant } from "@/types";
import { initials, getStatus, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export interface WorkspaceCardProps {
  workspace: Workspace;
  accent: string;
  tenant?: Tenant;
}

export function WorkspaceCard({ workspace, accent, tenant }: WorkspaceCardProps) {
  const status = getStatus(workspace.expired_at);
  const expirationTone =
    status.kind === "expiring"
      ? "text-warning"
      : status.kind === "expired"
        ? "text-danger"
        : "text-foreground";

  return (
    <article className="group rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(15,31,26,0.04)] transition hover:border-brand/30 hover:shadow-md">
      <header className="flex items-center gap-4">
        <div
          className={`grid h-12 w-12 place-items-center overflow-hidden rounded-lg text-[12px] font-bold tracking-tight ${accent}`}
        >
          {workspace.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={workspace.logo}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials(workspace.display_name) || "WS"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {workspace.display_name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <span className="truncate">/{workspace.slug}</span>
            {tenant && (
              <>
                <span className="text-border">•</span>
                <Link
                  href={`/tenants?panel=edit&id=${tenant.id}`}
                  className="truncate font-medium text-brand hover:underline"
                  title={`Tenant: ${tenant.name}`}
                >
                  {tenant.name}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-foreground/55">
          <Link
            href={`/workspaces/${workspace.id}/edit`}
            aria-label={`Edit ${workspace.display_name}`}
            className="grid h-8 w-8 place-items-center rounded-md transition hover:bg-surface-muted hover:text-foreground"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          <DeleteWorkspaceButton
            id={workspace.id}
            name={workspace.display_name}
          />
        </div>
      </header>

      <hr className="my-4 border-border" />

      <footer className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">Expiration</div>
          <div className={`text-sm font-medium ${expirationTone}`}>
            {formatDate(workspace.expired_at)}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground/70">
            {TIPE_WORKSPACE_LABELS[workspace.tipe_workspace] ??
              workspace.tipe_workspace_name ??
              "—"}
          </span>
          <StatusBadge status={status.kind} label={status.label} />
        </div>
      </footer>
    </article>
  );
}

