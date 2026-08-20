import { BillComponentsContent } from "./_components/bill-components/bill-components-content";
import { GeneralFacilitiesContent } from "./_components/general-facilities/general-facilities-content";
import { StaticSettingsContent } from "./_components/static-settings/static-settings-content";
import { MasterDataTabs } from "./_components/master-data-tabs";

type SearchParams = {
  tab?: string;
  search?: string;
  offset?: string;
  limit?: string;
  panel?: "new" | "edit";
  id?: string;
};

export default async function MasterDataPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tab = params.tab || "bill-components";

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Master Data
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Manage global platform configuration, bill components, general facilities, and static settings.
          </p>
        </div>
      </header>

      <MasterDataTabs activeTab={tab} />

      {tab === "general-facilities" ? (
        <GeneralFacilitiesContent params={params} />
      ) : tab === "static-settings" ? (
        <StaticSettingsContent />
      ) : (
        <BillComponentsContent params={params} />
      )}
    </div>
  );
}
