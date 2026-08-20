"use client";

import Link from "next/link";

const TABS = [
  { key: "bill-components", label: "Bill Component" },
  { key: "general-facilities", label: "General Facility" },
  { key: "static-settings", label: "Static Settings" },
] as const;

export function MasterDataTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-border bg-surface-muted/50 p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/master-data?tab=${tab.key}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? "bg-brand text-white shadow-sm"
              : "text-foreground/70 hover:text-foreground hover:bg-surface"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
