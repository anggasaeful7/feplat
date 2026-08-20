"use client";

import Link from "next/link";
import type { BillComponent } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { BillComponentRowMenu } from "./bill-component-row-menu";
import { BillComponentStatusToggle } from "./bill-component-status-toggle";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type Props = {
  items: BillComponent[];
  basePath: string;
};

export function BillComponentsTable({ items, basePath }: Props) {
  return (
    <TableContainer>
      <TableHeader>
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Variable</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sort</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right pr-5">Actions</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link
                href={`${basePath}${basePath.includes("?") ? "&" : "?"}panel=edit&id=${item.id}`}
                className="min-w-0"
              >
                <span className="truncate font-medium text-foreground hover:text-brand transition-colors">
                  {item.name}
                </span>
                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-muted max-w-xs">
                    {item.description}
                  </p>
                )}
              </Link>
            </TableCell>
            <TableCell>
              <span className="text-sm font-medium text-foreground">
                Rp {item.amount.toLocaleString("id-ID")}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.is_variable
                    ? "bg-warning-soft text-warning"
                    : "bg-surface-muted text-muted"
                }`}
              >
                {item.is_variable ? "Variable" : "Fixed"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <BillComponentStatusToggle id={item.id} active={item.is_active} />
                <span
                  className={`text-xs ${
                    item.is_active ? "text-success font-medium" : "text-muted"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-xs text-muted font-mono">
                {item.sort_order}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-xs text-muted">
                {formatDateTime(item.created_at)}
              </span>
            </TableCell>
            <TableCell className="text-right pr-3">
              <BillComponentRowMenu
                itemId={item.id}
                itemName={item.name}
                basePath={basePath}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}
