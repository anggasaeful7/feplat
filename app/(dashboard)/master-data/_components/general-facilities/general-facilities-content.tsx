import Link from "next/link";
import { PlusIcon } from "@/app/_components/icons";
import { ApiError } from "@/lib/axios";
import { clampInt } from "@/lib/utils";
import { GeneralFacilityService } from "@/services/general-facility.service";
import { DEFAULT_GENERAL_FACILITIES_PAGE_SIZE } from "@/types/general-facility";
import type { GeneralFacilityListResponse } from "@/types";
import { GeneralFacilitiesTable } from "./general-facilities-table";
import { GeneralFacilityFormPanel } from "./general-facility-form-panel";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SearchForm } from "@/components/search-form";

const BASE_PATH = "/master-data";
const TAB = "general-facilities";

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
  const limit = clampInt(params.limit, DEFAULT_GENERAL_FACILITIES_PAGE_SIZE, 1, 200);
  if (limit !== DEFAULT_GENERAL_FACILITIES_PAGE_SIZE) sp.set("limit", String(limit));
  if (nextOffset > 0) sp.set("offset", String(nextOffset));
  return `${BASE_PATH}?${sp.toString()}`;
}

export async function GeneralFacilitiesContent({ params }: { params: SearchParams }) {
  const search = (params.search ?? "").trim();
  const limit = clampInt(params.limit, DEFAULT_GENERAL_FACILITIES_PAGE_SIZE, 1, 200);
  const offset = clampInt(params.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  let data: GeneralFacilityListResponse | null = null;
  let loadError: string | null = null;

  try {
    data = await GeneralFacilityService.getGeneralFacilities({ search: search || undefined, limit, offset });
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
        panelItem = await GeneralFacilityService.getGeneralFacility(params.id);
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
            All General Facilities
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
            title={filtering ? `No general facilities match "${search}"` : "No general facilities yet"}
            description={
              filtering
                ? "Try a different search term, or clear the filter to see everything."
                : "Add your first general facility to configure platform-wide amenities."
            }
            actionHref={!filtering ? `${BASE_PATH}?tab=${TAB}&panel=new` : undefined}
            actionLabel={!filtering ? "Add your first general facility" : undefined}
          />
        ) : (
          <>
            <GeneralFacilitiesTable
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

      <GeneralFacilityFormPanel
        open={panelOpen}
        mode={panel === "edit" ? "edit" : "new"}
        item={panelItem}
        closeHref={buildHref(params)}
      />
    </>
  );
}
