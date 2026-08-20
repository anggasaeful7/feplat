"use client";

import type { InvoiceStatus, PlatformInvoice } from "@/types";
import { formatIDR, formatDate } from "@/lib/utils";
import { StatusBadge, type StatusVariant } from "@/components/status-badge";
import { INVOICE_STATUS_LABELS } from "@/lib/validations/invoice";
import { InvoiceRowMenu } from "./invoice-row-menu";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const STATUS_VARIANTS: Record<InvoiceStatus, StatusVariant> = {
  draft: "neutral",
  sent: "info",
  paid: "success",
  void: "danger",
};

type Props = {
  items: PlatformInvoice[];
  onEdit: (invoice: PlatformInvoice) => void;
};

export function InvoicesTable({ items, onEdit }: Props) {
  return (
    <TableContainer>
      <TableHeader>
        <tr>
          <TableHead>#</TableHead>
          <TableHead>Bill To</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>PO Number</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right pr-5">Aksi</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {items.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              <span className="font-medium text-foreground">#{invoice.number}</span>
            </TableCell>
            <TableCell>
              <div className="font-medium text-foreground">{invoice.bill_to_name}</div>
              {invoice.workspace_name && (
                <div className="text-xs text-muted">{invoice.workspace_name}</div>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground">{formatDate(invoice.invoice_date)}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground">{invoice.po_number || "—"}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-medium text-foreground">
                Rp {formatIDR(invoice.total_amount)}
              </span>
            </TableCell>
            <TableCell>
              <StatusBadge
                status={STATUS_VARIANTS[invoice.status]}
                label={INVOICE_STATUS_LABELS[invoice.status]}
              />
            </TableCell>
            <TableCell className="text-right pr-3">
              <InvoiceRowMenu invoice={invoice} onEdit={onEdit} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}
