import Link from "next/link";
import { PlusIcon } from "@/app/_components/icons";
import { ApiError } from "@/lib/axios";
import { clampInt } from "@/lib/utils";
import { BillComponentService } from "@/services/bill-component.service";
import { DEFAULT_BILL_COMPONENTS_PAGE_SIZE } from "@/types/bill-component";
import type { BillComponentListResponse } from "@/types";
import { BillComponentsTable } from "./bill-components-table";
import { BillComponentFormPanel } from "./bill-component-form-panel";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SearchForm } from "@/components/search-form";

const BASE_PATH = "/master-data";
const TAB = "bill-components";

type SearchParams = {
  search?: string;
  offset?: string;
  limit?: string;
  panel?: "new" | "edit";
  id?: string;
};

function buildHref(params: SearchParams) {
  const sp = new URLSearchParams();
  sp.set("tab", TAB);
  if (params.search) sp.set("search", params.search);
  if (params.limit) sp.set("limit", params.limit);
  if (params.offset) sp.set("offset", params.offset);
  return `${BASE_PATH}?${sp.toString()}`;
}

function buildPaginationUrl(nextOffset: number, params: SearchParams) {
  const sp = new URLSearchParams();
  sp.set("tab", TAB);
  if (params.search) sp.set("search", params.search);
  const limit = clampInt(params.limit, DEFAULT_BILL_COMPONENTS_PAGE_SIZE, 1, 200);
  if (limit !== DEFAULT_BILL_COMPONENTS_PAGE_SIZE) sp.set("limit", String(limit));
  if (nextOffset > 0) sp.set("offset", String(nextOffset));
  return `${BASE_PATH}?${sp.toString()}`;
}

export async function BillComponentsContent({ params }: { params: SearchParams }) {
  const search = (params.search ?? "").trim();
  const limit = clampInt(params.limit, DEFAULT_BILL_COMPONENTS_PAGE_SIZE, 1, 200);
  const offset = clampInt(params.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  let data: BillComponentListResponse | null = null;
  let loadError: string | null = null;

  try {
    data = await BillComponentService.getBillComponents({ search: search || undefined, limit, offset });
  } catch (err) {
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to reach the platform service. Try again in a moment.";
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const filtering = Boolean(search);
  const panel = params.panel;
  const panelOpen = Boolean(panel);

  let panelItem: (typeof items)[number] | undefined;
  if (panel && panel !== "new" && params.id) {
    panelItem = items.find((item) => item.id === params.id);
    if (!panelItem) {
      try {
        panelItem = await BillComponentService.getBillComponent(params.id);
      } catch {
        // ignore
      }
    }
  }

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            All Bill Components
          </h2>
          <div className="flex items-center gap-3">
            <SearchForm placeholder="Search by name…" />
            <Link
              href={`${BASE_PATH}?tab=${TAB}&panel=new`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </Link>
          </div>
        </div>

        {loadError ? (
          <ErrorState message={loadError} />
        ) : items.length === 0 ? (
          <EmptyState
            title={filtering ? `No bill components match "${search}"` : "No bill components yet"}
            description={
              filtering
                ? "Try a different search term, or clear the filter to see everything."
                : "Add your first bill component to start configuring billing."
            }
            actionHref={!filtering ? `${BASE_PATH}?tab=${TAB}&panel=new` : undefined}
            actionLabel={!filtering ? "Add your first bill component" : undefined}
          />
        ) : (
          <>
            <BillComponentsTable
              items={items}
              basePath={`${BASE_PATH}?tab=${TAB}`}
            />

            <Pagination
              total={total}
              limit={limit}
              offset={offset}
              shown={items.length}
              createPageUrl={(nextOffset) => buildPaginationUrl(nextOffset, params)}
            />
          </>
        )}
      </section>

      <BillComponentFormPanel
        open={panelOpen}
        mode={panel === "edit" ? "edit" : "new"}
        item={panelItem}
        closeHref={buildHref(params)}
      />
    </>
  );
}
