import Link from "next/link";
import { Banknote } from "lucide-react";
import { ApiError } from "@/lib/axios";
import { clampInt } from "@/lib/utils";
import { PayoutService } from "@/services/payout.service";
import { DEFAULT_PAYOUTS_PAGE_SIZE } from "@/types/payout";
import type { PayoutLogListResponse } from "@/types";
import { PayoutsTable } from "./_components/payouts-table";
import { PayoutFilters } from "./_components/payout-filters";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";

const BASE_PATH = "/payouts";

type SearchParams = {
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: string;
  per_page?: string;
};

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status?.trim() || undefined;
  const date_from = params.date_from?.trim() || undefined;
  const date_to = params.date_to?.trim() || undefined;
  const per_page = clampInt(params.per_page, DEFAULT_PAYOUTS_PAGE_SIZE, 1, 100);
  const page = clampInt(params.page, 1, 1, 9999);

  let data: PayoutLogListResponse | null = null;
  let loadError: string | null = null;

  try {
    data = await PayoutService.getPayoutLogs({
      status,
      date_from,
      date_to,
      page,
      per_page,
    });
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to reach the platform service. Try again in a moment.";
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const filtering = Boolean(status || date_from || date_to);

  // Convert page-based to offset-based for <Pagination>
  const offset = (page - 1) * per_page;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Payout Management
          </h1>
          <p className="text-sm text-muted max-w-xl">
            View and manage payout logs across all workspaces.
          </p>
        </div>
        <Link
          href="/payouts/create"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
        >
          <Banknote className="h-4 w-4" />
          Payout Manual
        </Link>
      </header>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Payout Logs
          </h2>
          <PayoutFilters
            currentStatus={status}
            currentDateFrom={date_from}
            currentDateTo={date_to}
          />
        </div>

        {loadError ? (
          <ErrorState message={loadError} />
        ) : items.length === 0 ? (
          <EmptyState
            title={filtering ? "No payouts match your filters" : "No payouts yet"}
            description={
              filtering
                ? "Try different filter values, or clear filters to see everything."
                : "Payout logs will appear here once payouts are processed."
            }
          />
        ) : (
          <>
            <PayoutsTable payouts={items} />

            <Pagination
              total={total}
              limit={per_page}
              offset={offset}
              shown={items.length}
              createPageUrl={(nextOffset) => {
                const sp = new URLSearchParams();
                const nextPage = Math.floor(nextOffset / per_page) + 1;
                if (nextPage > 1) sp.set("page", String(nextPage));
                if (per_page !== DEFAULT_PAYOUTS_PAGE_SIZE) sp.set("per_page", String(per_page));
                if (status) sp.set("status", status);
                if (date_from) sp.set("date_from", date_from);
                if (date_to) sp.set("date_to", date_to);
                return `${BASE_PATH}${sp.size ? `?${sp.toString()}` : ""}`;
              }}
              createPageSizeUrl={(newLimit) => {
                const sp = new URLSearchParams();
                sp.set("page", "1");
                if (newLimit !== DEFAULT_PAYOUTS_PAGE_SIZE) sp.set("per_page", String(newLimit));
                if (status) sp.set("status", status);
                if (date_from) sp.set("date_from", date_from);
                if (date_to) sp.set("date_to", date_to);
                return `${BASE_PATH}?${sp.toString()}`;
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
