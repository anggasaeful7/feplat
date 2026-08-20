import React from "react";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand",
        className
      )}
      aria-hidden
    >
      {initials(name) || "?"}
    </div>
  );
}
