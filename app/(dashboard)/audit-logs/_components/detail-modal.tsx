"use client";

import type { AuditLog } from "@/types";
import { formatDateTimeWithSeconds as formatDateTime, truncate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
};

export function DetailModal({ log, open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event details</DialogTitle>
        </DialogHeader>

        {log && (
          <>
            <p className="text-xs text-muted-foreground font-mono break-all -mt-2">{log.id}</p>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Time" value={formatDateTime(log.created_at)} />
              <Detail label="Action" value={log.action} mono />
              <Detail label="Actor" value={log.actor_email ?? "—"} />
              <Detail label="Role" value={log.actor_role ?? "—"} />
              <Detail label="Method" value={log.method} mono />
              <Detail label="Path" value={log.path} mono />
              <Detail label="Status" value={String(log.status_code)} mono />
              <Detail label="IP" value={log.ip ?? "—"} />
              <Detail label="Request ID" value={log.request_id ?? "—"} mono />
              <Detail
                label="User Agent"
                value={log.user_agent ? truncate(log.user_agent, 60) : "—"}
              />
            </dl>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Metadata
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
{JSON.stringify(log.metadata ?? {}, null, 2)}
              </pre>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={`mt-1 ${mono ? "font-mono text-xs" : ""} text-foreground`}>
        {value}
      </dd>
    </div>
  );
}
