"use client";

import Link from "next/link";
import type { Tenant } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { RowMenu } from "./row-menu";
import { StatusToggle } from "./status-toggle";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";

type Props = {
  tenants: Tenant[];
  basePath: string;
};

export function TenantsTable({ tenants, basePath }: Props) {
  return (
    <TableContainer>
      <TableHeader>
        <tr>
          <TableHead>Tenant Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right pr-5">Actions</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {tenants.map((tenant) => (
          <TableRow key={tenant.id}>
            <TableCell>
              <Link
                href={`${basePath}?panel=edit&id=${tenant.id}`}
                className="flex items-center gap-3"
              >
                <Avatar name={tenant.name} />
                <div className="min-w-0">
                  <span className="truncate font-medium text-foreground hover:text-brand transition-colors">
                    {tenant.name}
                  </span>
                </div>
              </Link>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-foreground/80 bg-surface-muted px-2 py-1 rounded">
                /{tenant.slug}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <StatusToggle id={tenant.id} active={tenant.is_active} />
                <span
                  className={`text-xs ${
                    tenant.is_active ? "text-success font-medium" : "text-muted"
                  }`}
                >
                  {tenant.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-xs text-muted">
                {formatDateTime(tenant.created_at)}
              </span>
            </TableCell>
            <TableCell className="text-right pr-3">
              <RowMenu
                tenantId={tenant.id}
                tenantName={tenant.name}
                basePath={basePath}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}
