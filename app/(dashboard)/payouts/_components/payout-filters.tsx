"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PAYOUT_LOG_STATUSES } from "@/types/payout";

type Props = {
  currentStatus?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
};

export function PayoutFilters({
  currentStatus,
  currentDateFrom,
  currentDateTo,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const pushParams = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      if (overrides.status ?? currentStatus) {
        const v = overrides.status ?? currentStatus;
        if (v) sp.set("status", v);
      }
      if (overrides.date_from ?? currentDateFrom) {
        const v = overrides.date_from ?? currentDateFrom;
        if (v) sp.set("date_from", v);
      }
      if (overrides.date_to ?? currentDateTo) {
        const v = overrides.date_to ?? currentDateTo;
        if (v) sp.set("date_to", v);
      }
      router.push(`${pathname}${sp.size ? `?${sp.toString()}` : ""}`);
    },
    [router, pathname, currentStatus, currentDateFrom, currentDateTo]
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-44">
        <label className="mb-1 block text-xs font-medium text-muted">
          Status
        </label>
        <Select
          value={currentStatus ?? ""}
          onValueChange={(v) => pushParams({ status: v || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {PAYOUT_LOG_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-44">
        <label className="mb-1 block text-xs font-medium text-muted">
          Date From
        </label>
        <DatePicker
          value={currentDateFrom}
          onChange={(v) => pushParams({ date_from: v || undefined })}
          placeholderText="YYYY-MM-DD"
        />
      </div>

      <div className="w-44">
        <label className="mb-1 block text-xs font-medium text-muted">
          Date To
        </label>
        <DatePicker
          value={currentDateTo}
          onChange={(v) => pushParams({ date_to: v || undefined })}
          minDate={currentDateFrom ? new Date(currentDateFrom + "T00:00:00") : undefined}
          placeholderText="YYYY-MM-DD"
          popperPlacement="bottom-end"
        />
      </div>

      {(currentStatus || currentDateFrom || currentDateTo) && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
