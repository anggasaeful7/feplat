import React from "react";

export interface ToolbarIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function ToolbarIconButton({
  active,
  className,
  ...props
}: ToolbarIconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`grid h-9 w-9 place-items-center rounded-lg border transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-surface text-foreground/70 hover:bg-surface-muted"
      } ${className || ""}`}
    />
  );
}
