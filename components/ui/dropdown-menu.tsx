"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface DropdownMenuProps {
  trigger: React.ReactElement<React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>;
  children: React.ReactNode;
  width?: number;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && typeof ref === "object" && "current" in ref) {
    const mutable = ref as React.MutableRefObject<T | null>;
    mutable.current = value;
  }
}

export function DropdownMenu({ trigger, children, width = 180 }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function computePosition() {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return null;
    const rect = triggerEl.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(window.innerWidth - width - 8, rect.right - width)
    );
    const top = rect.bottom + 6;
    return { top, left };
  }

  function toggle() {
    if (open) {
      setOpen(false);
    } else {
      const pos = computePosition();
      if (pos) {
        setPosition(pos);
        setOpen(true);
      }
    }
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    const close = () => setOpen(false);

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  // Clone trigger to attach ref and onClick handler
  const triggerElement = React.cloneElement(trigger, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Keep any original ref if exists
      const triggerWithRef = trigger as React.ReactElement & { ref?: React.Ref<HTMLElement> };
      assignRef(triggerWithRef.ref, node);
    },
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (trigger.props.onClick) trigger.props.onClick(e);
      toggle();
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
  });

  return (
    <>
      {triggerElement}
      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width,
            }}
            className="z-40 origin-top-right overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-xl animate-in fade-in"
          >
            {/* Close dropdown on select/click of any item inside */}
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>,
          document.body
        )}
    </>
  );
}

export function DropdownItem({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
