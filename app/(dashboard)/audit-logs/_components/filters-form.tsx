"use client";

import { useState } from "react";
import Link from "next/link";
import { DatePicker } from "@/components/ui/date-picker";

type FiltersInitial = {
  search?: string;
  actor_email?: string;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
};

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
      />
    </label>
  );
}

export function FiltersForm({
  initial,
}: {
  initial: FiltersInitial;
}) {
  const [dateFrom, setDateFrom] = useState(initial.date_from ?? "");
  const [dateTo, setDateTo] = useState(initial.date_to ?? "");

  return (
    <form
      action="/audit-logs"
      method="get"
      className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      <Field
        label="Search"
        name="search"
        defaultValue={initial.search ?? ""}
        placeholder="action, path, email"
      />
      <Field
        label="Actor email"
        name="actor_email"
        defaultValue={initial.actor_email ?? ""}
        placeholder="user@example.com"
      />
      <Field
        label="Action"
        name="action"
        defaultValue={initial.action ?? ""}
        placeholder="POST /api/v1/workspaces"
      />
      <Field
        label="Resource"
        name="resource_type"
        defaultValue={initial.resource_type ?? ""}
        placeholder="workspace, user, auth"
      />

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
          From
        </span>
        <DatePicker
          value={dateFrom}
          onChange={setDateFrom}
          placeholderText="From date"
        />
        <input type="hidden" name="date_from" value={dateFrom} />
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
          To
        </span>
        <DatePicker
          value={dateTo}
          onChange={setDateTo}
          placeholderText="To date"
        />
        <input type="hidden" name="date_to" value={dateTo} />
      </label>

      <div className="col-span-full flex items-center justify-end gap-2">
        <Link
          href="/audit-logs"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground/70 hover:bg-surface-muted"
        >
          Reset
        </Link>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
