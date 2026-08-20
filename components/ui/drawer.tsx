"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  closeHref?: string;
  width?: "md" | "lg";
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  closeHref,
  width = "md",
  children,
  footer,
}: Props) {
  const router = useRouter();

  function handleClose() {
    if (onClose) onClose();
    else if (closeHref) router.push(closeHref);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const widthClass = width === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close panel"
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute right-0 top-0 h-full w-full ${widthClass} bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              {subtitle && (
                <p className="text-sm text-muted">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close panel"
              className="grid h-9 w-9 place-items-center rounded-lg text-foreground/60 transition hover:bg-surface-muted hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M6 6l12 12M6 18 18 6" />
              </svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

          {footer && (
            <footer className="border-t border-border bg-surface px-6 py-4">
              {footer}
            </footer>
          )}
        </div>
      </aside>
    </div>
  );
}
