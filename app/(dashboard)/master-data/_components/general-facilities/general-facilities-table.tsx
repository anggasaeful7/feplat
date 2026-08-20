"use client";

import Link from "next/link";
import type { GeneralFacility } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { GeneralFacilityRowMenu } from "./general-facility-row-menu";
import { GeneralFacilityStatusToggle } from "./general-facility-status-toggle";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type Props = {
  items: GeneralFacility[];
  basePath: string;
};

export function GeneralFacilitiesTable({ items, basePath }: Props) {
  return (
    <TableContainer>
      <TableHeader>
        <tr>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Auto Suspend</TableHead>
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
              </Link>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <GeneralFacilityStatusToggle id={item.id} active={item.is_active} />
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
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.is_auto_suspend
                    ? "bg-warning-soft text-warning"
                    : "bg-surface-muted text-muted"
                }`}
              >
                {item.is_auto_suspend ? "Yes" : "No"}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-xs text-muted">
                {formatDateTime(item.created_at)}
              </span>
            </TableCell>
            <TableCell className="text-right pr-3">
              <GeneralFacilityRowMenu
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
