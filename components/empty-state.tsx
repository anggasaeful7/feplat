import React from "react";
import Link from "next/link";
import { PlusIcon } from "@/app/_components/icons";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
        {icon || <PlusIcon className="h-7 w-7" />}
      </div>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
        >
          <PlusIcon className="h-4 w-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
