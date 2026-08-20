"use client";

import { useConfirmStore } from "@/store/use-confirm-store";
import {
  useDeleteInvoice,
  useDownloadInvoicePdf,
  useSetInvoiceStatus,
} from "@/hooks/api/use-invoice";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "@/lib/validations/invoice";
import type { PlatformInvoice } from "@/types";

type Props = {
  invoice: PlatformInvoice;
  onEdit: (invoice: PlatformInvoice) => void;
};

export function InvoiceRowMenu({ invoice, onEdit }: Props) {
  const confirm = useConfirmStore((state) => state.confirm);
  const deleteMutation = useDeleteInvoice();
  const statusMutation = useSetInvoiceStatus();
  const downloadMutation = useDownloadInvoicePdf();
  const pending = deleteMutation.isPending || statusMutation.isPending;

  function deleteInvoice() {
    confirm({
      title: "Hapus Invoice",
      message: `Hapus invoice #${invoice.number} untuk "${invoice.bill_to_name}"? Tindakan ini tidak bisa dibatalkan.`,
      isDestructive: true,
      confirmLabel: "Hapus",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(invoice.id);
      },
    });
  }

  return (
    <DropdownMenu
      width={200}
      trigger={
        <button
          type="button"
          aria-label={`Aksi untuk invoice ${invoice.number}`}
          disabled={pending}
          className="grid h-8 w-8 place-items-center rounded-md text-foreground/55 transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>
      }
    >
      <button
        type="button"
        onClick={() => downloadMutation.mutate(invoice)}
        disabled={downloadMutation.isPending}
        className="block w-full px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
      >
        {downloadMutation.isPending ? "Mengunduh…" : "Download PDF"}
      </button>
      <button
        type="button"
        onClick={() => onEdit(invoice)}
        className="block w-full px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground"
      >
        Edit Invoice
      </button>

      <hr className="my-1 border-border" />

      {INVOICE_STATUSES.filter((status) => status !== invoice.status).map((status) => (
        <button
          key={status}
          type="button"
          disabled={pending}
          onClick={() => statusMutation.mutate({ id: invoice.id, status })}
          className="block w-full px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
        >
          Tandai {INVOICE_STATUS_LABELS[status]}
        </button>
      ))}

      <hr className="my-1 border-border" />
      <DropdownItem
        disabled={pending}
        onClick={deleteInvoice}
        className="text-danger hover:bg-danger-soft/60"
      >
        Hapus Invoice
      </DropdownItem>
    </DropdownMenu>
  );
}
