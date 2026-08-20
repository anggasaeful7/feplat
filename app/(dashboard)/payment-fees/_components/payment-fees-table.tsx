"use client";

import type { PaymentFee } from "@/types";
import { formatIDR } from "@/lib/utils";
import { PaymentFeeRowMenu } from "./payment-fee-row-menu";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const METHOD_LABELS: Record<string, string> = {
  QRIS: "QRIS",
  ALFAMART: "Alfamart",
  INDOMARET: "Indomaret",
  VA_BCA: "VA BCA",
  VA_BRI: "VA BRI",
  CONVENIENCE_STORE: "Convenience Store",
  ALFARMART: "Alfamart",
  INDOMART: "Indomaret",
};

type Props = {
  items: PaymentFee[];
  onEdit: (item: PaymentFee) => void;
  workspaceId: string;
};

export function PaymentFeesTable({ items, onEdit, workspaceId }: Props) {
  return (
    <TableContainer>
      <TableHeader>
        <tr>
          <TableHead>Payment Method</TableHead>
          <TableHead>Per Month</TableHead>
          <TableHead>Max Payment</TableHead>
          <TableHead>Max Month</TableHead>
          <TableHead>Flat</TableHead>
          <TableHead>Flat Value</TableHead>
          <TableHead className="text-right pr-5">Actions</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <span className="font-medium text-foreground">
                {METHOD_LABELS[item.payment_method] ?? item.payment_method}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground">
                Rp {formatIDR(item.payment_per_month)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground">
                Rp {formatIDR(item.maximum_payment)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground">
                {item.maximum_month}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.is_flat
                    ? "bg-warning-soft text-warning"
                    : "bg-surface-muted text-muted"
                }`}
              >
                {item.is_flat ? "Yes" : "No"}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground">
                Rp {formatIDR(item.flat_value)}
              </span>
            </TableCell>
            <TableCell className="text-right pr-3">
              <PaymentFeeRowMenu
                item={item}
                onEdit={onEdit}
                workspaceId={workspaceId}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}
