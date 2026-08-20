"use client";

import { useState } from "react";
import type { AuditLog } from "@/types";
import { formatDateTimeWithSeconds as formatDateTime, truncate } from "@/lib/utils";
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DetailModal } from "./detail-modal";

type Props = {
  items: AuditLog[];
};

export function AuditTable({ items }: Props) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const statusTone = (code: number) =>
    code >= 500 ? "text-danger" : code >= 400 ? "text-warning" : "text-success";

  return (
    <>
      <TableContainer>
        <TableHeader>
          <tr>
            <TableHead>Time</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead>IP</TableHead>
            <TableHead />
          </tr>
        </TableHeader>
        <TableBody>
          {items.map((log) => (
            <TableRow
              key={log.id}
              className={selectedLog?.id === log.id ? "bg-brand-soft/40" : ""}
            >
              <TableCell className="whitespace-nowrap text-foreground/80">
                {formatDateTime(log.created_at)}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {log.actor_email ?? <span className="text-muted">—</span>}
              </TableCell>
              <TableCell className="font-mono text-xs">{log.action}</TableCell>
              <TableCell className="text-xs">
                {log.resource_type ? (
                  <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5">
                    {log.resource_type}
                    {log.resource_id ? `: ${truncate(log.resource_id, 8)}` : ""}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </TableCell>
              <TableCell className={`text-right font-mono text-xs ${statusTone(log.status_code)}`}>
                {log.status_code}
              </TableCell>
              <TableCell className="text-xs text-muted">{log.ip ?? "—"}</TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => setSelectedLog(log)}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  View
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

      <DetailModal
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
}
