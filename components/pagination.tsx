import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  shown: number;
  createPageUrl: (offset: number) => string;
  createPageSizeUrl?: (limit: number) => string;
}

const PAGE_SIZES = [10, 25, 50, 100];
const WINDOW = 2;

export function Pagination({
  total,
  limit,
  offset,
  shown,
  createPageUrl,
  createPageSizeUrl,
}: PaginationProps) {
  if (total <= shown && offset === 0) return null;

  const from = offset + 1;
  const to = offset + shown;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;
  const hasPrev = offset > 0;
  const hasNext = nextOffset < total;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - WINDOW && i <= currentPage + WINDOW)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-3">
        <div className="text-muted">
          Showing <span className="font-medium text-foreground">{from}</span>–
          <span className="font-medium text-foreground">{to}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span>
        </div>

        {createPageSizeUrl && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted">Show</span>
            <div className="flex overflow-hidden rounded-lg border border-border">
              {PAGE_SIZES.map((s) => {
                const isActive = s === limit;
                return (
                  <Link
                    key={s}
                    href={isActive ? "#" : createPageSizeUrl(s)}
                    className={`px-2.5 py-1.5 text-xs transition ${isActive
                      ? "bg-brand text-white"
                      : "bg-surface text-foreground/70 hover:bg-surface-muted hover:text-foreground"
                      }`}
                  >
                    {s}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <PageBtn href={createPageUrl(prevOffset)} disabled={!hasPrev} label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </PageBtn>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-2 text-muted">
              ...
            </span>
          ) : (
            <PageBtn
              key={p}
              href={p === currentPage ? "#" : createPageUrl((p - 1) * limit)}
              disabled={false}
              active={p === currentPage}
              label={`Page ${p}`}
            >
              {p}
            </PageBtn>
          )
        )}

        <PageBtn href={createPageUrl(nextOffset)} disabled={!hasNext} label="Next page">
          <ChevronRight className="h-4 w-4" />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  href,
  disabled,
  active,
  children,
  label,
}: {
  href: string;
  disabled: boolean;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  const base =
    "grid h-8 w-8 place-items-center rounded-lg text-sm transition";
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${base} text-foreground/30`}
      >
        {children}
      </span>
    );
  }
  if (active) {
    return (
      <span
        className={`${base} bg-brand text-white font-medium`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${base} text-foreground/70 hover:bg-surface-muted hover:text-foreground`}
    >
      {children}
    </Link>
  );
}
