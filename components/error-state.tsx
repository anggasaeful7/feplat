import React from "react";

export interface ErrorStateProps {
  title?: string;
  message: string;
}

export function ErrorState({
  title = "Couldn't load data",
  message,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-8">
      <h3 className="text-base font-semibold text-danger">{title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{message}</p>
    </div>
  );
}
