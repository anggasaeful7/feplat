"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export function Popover({
  children,
  ...props
}: PopoverPrimitive.PopoverProps) {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>;
}

export function PopoverTrigger({
  children,
  className,
  ...props
}: PopoverPrimitive.PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger className={cn(className)} {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  );
}

export function PopoverContent({
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-xl border border-border bg-surface p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
