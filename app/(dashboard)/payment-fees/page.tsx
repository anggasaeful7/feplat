"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useWorkspaces } from "@/hooks/api/use-workspace";
import { useWorkspacePaymentFees } from "@/hooks/api/use-workspace";
import { PaymentFeesTable } from "./_components/payment-fees-table";
import { PaymentFeeFormPanel } from "./_components/payment-fee-form-panel";
import { Spinner } from "@/components/ui/spinner";
import { FormStyles } from "@/components/form-styles";
import { PlusIcon } from "@/app/_components/icons";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ApiError } from "@/lib/axios";
import type { PaymentFee } from "@/types";

export default function PlatformFeePage() {
  const { data, isLoading, isError, error } = useWorkspaces({ limit: 200 });
  const workspaces = data?.items ?? [];
  const [selectedId, setSelectedId] = useState<string>("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentFee | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const {
    data: fees,
    isLoading: feesLoading,
    isError: feesError,
  } = useWorkspacePaymentFees(selectedId);

  const openNew = useCallback(() => {
    setEditingItem(undefined);
    setPanelOpen(true);
  }, []);

  const openEdit = useCallback((item: PaymentFee) => {
    setEditingItem(item);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setEditingItem(undefined);
  }, []);

  const selectedWorkspace = useMemo(
    () => workspaces.find((w) => w.id === selectedId),
    [workspaces, selectedId],
  );

  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces;
    const q = searchQuery.toLowerCase();
    return workspaces.filter(
      (w) =>
        w.display_name.toLowerCase().includes(q) ||
        w.slug.toLowerCase().includes(q),
    );
  }, [workspaces, searchQuery]);

  function selectWorkspace(id: string) {
    setSelectedId(id);
    setSearchQuery("");
    setPopoverOpen(false);
    closePanel();
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Platform Fee
        </h1>
        <p className="text-sm text-muted max-w-xl">
          Configure payment fee rates per workspace and payment method.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(15,31,26,0.04)] space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Workspace
          </label>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner className="h-4 w-4" />
              Loading workspaces…
            </div>
          ) : isError ? (
            <p className="text-sm text-danger">
              {error instanceof ApiError ? error.message : "Failed to load workspaces."}
            </p>
          ) : (
            <Popover open={popoverOpen} onOpenChange={(next) => {
              setPopoverOpen(next);
              if (!next) setSearchQuery("");
            }}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition hover:bg-surface-muted"
                >
                  <span className={selectedWorkspace ? "" : "text-muted"}>
                    {selectedWorkspace?.display_name ?? "Choose a workspace…"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={4}
                className="w-(--radix-popover-trigger-width) p-0"
              >
                <div className="space-y-1 p-2">
                  <input
                    type="text"
                    placeholder="Search workspace…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-auto">
                    {filteredWorkspaces.length === 0 ? (
                      <p className="px-2 py-4 text-center text-sm text-muted">
                        {searchQuery.trim()
                          ? "No workspaces match your search."
                          : "No workspaces found."}
                      </p>
                    ) : (
                      filteredWorkspaces.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => selectWorkspace(w.id)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface-muted ${
                            w.id === selectedId
                              ? "bg-brand/10 font-medium text-brand"
                              : "text-foreground"
                          }`}
                        >
                          {w.display_name}
                          <span className="ml-2 text-xs text-muted">/{w.slug}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <p className="text-xs text-muted">
            Select a workspace to view and configure its payment fee settings.
          </p>
        </div>

        <FormStyles />
      </div>

      {selectedId && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Payment Fee List
            </h2>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong"
            >
              <PlusIcon className="h-4 w-4" />
              Add Payment Fee
            </button>
          </div>

          {feesLoading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-surface">
              <Spinner className="h-6 w-6 text-brand" />
            </div>
          ) : feesError ? (
            <ErrorState message="Failed to load payment fees." />
          ) : fees && fees.items.length > 0 ? (
            <PaymentFeesTable
              items={fees.items}
              onEdit={openEdit}
              workspaceId={selectedId}
            />
          ) : (
            <EmptyState
              title="No payment fees yet"
              description="Add a payment fee configuration for this workspace."
            />
          )}
        </section>
      )}

      <PaymentFeeFormPanel
        open={panelOpen}
        workspaceId={selectedId}
        item={editingItem}
        onClose={closePanel}
      />
    </div>
  );
}
