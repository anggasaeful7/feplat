import React from "react";

export interface StatCardProps {
  label: string;
  value: string;
  tone: "brand" | "warning" | "success";
  footer: string;
  icon?: React.ReactNode;
  footerIcon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  tone,
  footer,
  icon,
  footerIcon,
}: StatCardProps) {
  const valueTone = {
    brand: "text-brand",
    warning: "text-warning",
    success: "text-success",
  }[tone];

  const glow = {
    brand:
      "before:bg-[radial-gradient(circle_at_top_right,rgba(13,64,41,0.10),transparent_60%)]",
    warning:
      "before:bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_60%)]",
    success:
      "before:bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_60%)]",
  }[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(15,31,26,0.04)] before:absolute before:inset-0 before:z-0 ${glow}`}
    >
      <div className="relative space-y-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </div>
        <div className={`text-5xl font-semibold tracking-tight ${valueTone}`}>
          {value}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          {footerIcon && <span>{footerIcon}</span>}
          <span>{footer}</span>
        </div>
      </div>
    </div>
  );
}
