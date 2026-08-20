"use client";

import type { PayoutLog } from "@/types";
import { formatCurrency, payoutStatusVariant } from "@/types/payout";
import { StatusBadge } from "@/components/status-badge";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type Props = {
  payouts: PayoutLog[];
};

export function PayoutsTable({ payouts }: Props) {
  return (
    <TableContainer>
      <TableHeader>
        <tr>
          <TableHead>Workspace Name</TableHead>
          <TableHead>Bank Account Name</TableHead>
          <TableHead>Bank Account Number</TableHead>
          <TableHead>Sub Account Number</TableHead>
          <TableHead>Balance Before Payout</TableHead>
          <TableHead>Payout Balance</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {payouts.map((payout) => (
          <TableRow key={payout.id}>
            <TableCell>
              <span className="font-medium text-foreground">
                {payout.workspace_name || "—"}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-foreground/70">
                {payout.bank_account_name || "—"}
              </span>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-foreground/70">
                {payout.bank_account_number || "—"}
              </span>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-foreground/70">
                {payout.sub_account_number || "—"}
              </span>
            </TableCell>
            <TableCell>
              <span className="font-medium text-foreground">
                {formatCurrency(Number(payout.balance_before_payout))}
              </span>
            </TableCell>
            <TableCell>
              <span className="font-medium text-foreground">
                {formatCurrency(Number(payout.payout_balance))}
              </span>
            </TableCell>
            <TableCell>
              <StatusBadge
                status={payoutStatusVariant(payout.status)}
                label={payout.status}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}
