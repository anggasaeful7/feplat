import React from "react";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "active"
  | "expiring"
  | "expired";

export interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusCls = {
    active: "bg-success-soft text-success",
    success: "bg-success-soft text-success",
    
    expiring: "bg-warning-soft text-warning",
    warning: "bg-warning-soft text-warning",
    
    expired: "bg-danger-soft text-danger",
    danger: "bg-danger-soft text-danger",
    
    info: "bg-brand-soft text-brand",
    neutral: "bg-surface-muted text-muted",
  }[status] || "bg-surface-muted text-muted";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusCls} ${
        className || ""
      }`}
    >
      {label}
    </span>
  );
}
