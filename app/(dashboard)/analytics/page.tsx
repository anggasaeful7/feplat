import Link from "next/link";
import { ApiError } from "@/lib/axios";
import { StatService } from "@/services/stat.service";
import type { AnalyticsRange } from "@/types";
import { BarChartCard } from "./_components/bar-chart";
import { LineChartCard } from "./_components/line-chart";

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

type SearchParams = { range?: string };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const range: AnalyticsRange = isRange(sp.range) ? sp.range : "30d";

  let data = null;
  let loadError: string | null = null;
  try {
    data = await StatService.getAnalytics(range);
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to load analytics.";
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted max-w-xl">
            Usage trends, adoption metrics, and growth signals across the
            workspace fleet.
          </p>
        </div>
        <RangeSelector current={range} />
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-8">
          <h3 className="text-base font-semibold text-danger">
            Couldn&apos;t load analytics
          </h3>
          <p className="mt-1 text-sm text-foreground/70">{loadError}</p>
        </div>
      ) : data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <LineChartCard title="Daily user signups" data={data.signups_daily} />
          <BarChartCard
            title="Monthly workspace growth"
            data={data.workspaces_monthly}
            color="#1d4ed8"
          />
          <div className="lg:col-span-2">
            <LineChartCard
              title="Daily audit activity"
              data={data.audit_daily}
              color="#854d0e"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RangeSelector({ current }: { current: AnalyticsRange }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-1 text-sm">
      {RANGES.map((r) => (
        <Link
          key={r.value}
          href={`/analytics?range=${r.value}`}
          className={`rounded-md px-3 py-1.5 transition ${
            r.value === current
              ? "bg-brand text-white"
              : "text-foreground/70 hover:bg-surface-muted"
          }`}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}

function isRange(v: unknown): v is AnalyticsRange {
  return v === "30d" || v === "90d" || v === "12m";
}
