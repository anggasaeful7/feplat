"use client";

import { useState, useCallback } from "react";

import { useInvoices } from "@/hooks/api/use-invoice";
import { InvoicesTable } from "./_components/invoices-table";
import { InvoiceFormPanel } from "./_components/invoice-form-panel";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "@/lib/validations/invoice";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PlusIcon } from "@/app/_components/icons";
import type { InvoiceStatus, PlatformInvoice } from "@/types";

const LIMIT = 25;

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [offset, setOffset] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformInvoice | undefined>(undefined);

  const { data, isLoading, isError } = useInvoices({
    q: search.trim() || undefined,
    status: status || undefined,
    limit: LIMIT,
    offset,
  });

  const invoices = data?.items ?? [];
  const total = data?.total ?? 0;

  const openNew = useCallback(() => {
    setEditing(undefined);
    setPanelOpen(true);
  }, []);

  const openEdit = useCallback((invoice: PlatformInvoice) => {
    setEditing(invoice);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setEditing(undefined);
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Invoices</h1>
          <p className="text-sm text-muted max-w-xl">
            Tagihan Maintenance &amp; Support ke tenant. Nominal dan deskripsi diisi manual.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
        >
          <PlusIcon className="h-4 w-4" />
          Invoice Baru
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
          placeholder="Cari bill to / PO number / nomor…"
          className="h-11 w-full max-w-sm rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as InvoiceStatus | "");
            setOffset(0);
          }}
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand"
        >
          <option value="">Semua status</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {INVOICE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-surface">
          <Spinner className="h-6 w-6 text-brand" />
        </div>
      ) : isError ? (
        <ErrorState message="Gagal memuat invoice." />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="Belum ada invoice"
          description="Buat invoice pertama untuk menagih tenant."
        />
      ) : (
        <div className="space-y-4">
          <InvoicesTable items={invoices} onEdit={openEdit} />

          <div className="flex items-center justify-between text-sm text-muted">
            <span>
              {offset + 1}–{offset + invoices.length} dari {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                className="rounded-lg border border-border px-3 py-1.5 transition hover:bg-surface-muted disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={offset + invoices.length >= total}
                onClick={() => setOffset(offset + LIMIT)}
                className="rounded-lg border border-border px-3 py-1.5 transition hover:bg-surface-muted disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      )}

      <InvoiceFormPanel open={panelOpen} invoice={editing} onClose={closePanel} />
    </div>
  );
}
