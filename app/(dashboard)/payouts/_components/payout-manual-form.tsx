"use client";

import { useState, useId, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPayoutSchema, type CreatePayoutInput } from "@/lib/validations/payout";
import { useWorkspaces } from "@/hooks/api/use-workspace";
import { useWorkspaceBalance, useWorkspacePayoutBank } from "@/hooks/api/use-workspace";
import { usePayoutFee } from "@/hooks/api/use-payout-fee";
import { useCreatePayout } from "@/hooks/api/use-payout";
import { formatCurrency } from "@/types/payout";
import { formatIDR } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { FormStyles } from "@/components/form-styles";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { ApiError } from "@/lib/axios";

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className={`mt-1 text-foreground ${mono ? "font-mono text-xs" : "text-sm"}`}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function PayoutManualForm() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const workspaces = useWorkspaces({ limit: 200 });
  const balance = useWorkspaceBalance(selectedId);
  const payoutBank = useWorkspacePayoutBank(selectedId);
  const payoutFee = usePayoutFee();
  const createPayout = useCreatePayout(selectedId);

  const ids = { amount: useId(), reason: useId() };

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreatePayoutInput>({
    resolver: zodResolver(createPayoutSchema),
    defaultValues: { amount: 0, reason: "" },
  });

  const amountValue = useWatch({ control, name: "amount" });

  const b = balance.data;
  const fee = payoutFee.data?.value ?? 0;
  const maxPayout = b ? Math.max(0, b.available_amount - fee) : 0;
  const pending = createPayout.isPending;

  const selectedWorkspace = useMemo(
    () => workspaces.data?.items.find((w) => w.id === selectedId),
    [workspaces.data, selectedId],
  );

  const filteredWorkspaces = useMemo(() => {
    const items = workspaces.data?.items ?? [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (w) =>
        w.display_name.toLowerCase().includes(q) ||
        w.slug.toLowerCase().includes(q),
    );
  }, [workspaces.data, searchQuery]);

  const onSubmit = async (values: CreatePayoutInput) => {
    setErrorMsg(null);
    try {
      await createPayout.mutateAsync(values);
      reset();
      router.push("/payouts");
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : "An unexpected error occurred.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Select Workspace</label>
        <Popover open={open} onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearchQuery("");
        }}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={workspaces.isLoading}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-60"
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
                {workspaces.isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Spinner className="h-5 w-5 text-brand" />
                  </div>
                ) : filteredWorkspaces.length === 0 ? (
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
                      onClick={() => {
                        setSelectedId(w.id);
                        setSearchQuery("");
                        setOpen(false);
                      }}
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
        {workspaces.isError && (
          <p className="text-xs text-danger">
            {workspaces.error instanceof ApiError
              ? workspaces.error.message
              : "Failed to load workspaces."}
          </p>
        )}
      </div>

      {selectedId && (
        <>
          {balance.isLoading || payoutBank.isLoading || payoutFee.isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-surface">
              <Spinner className="h-6 w-6 text-brand" />
            </div>
          ) : balance.isError || payoutBank.isError || payoutFee.isError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft/30 p-6 text-center">
              <h3 className="text-sm font-semibold text-danger">Failed to load workspace data</h3>
              <p className="mt-1 text-xs text-foreground/70">
                {balance.error instanceof ApiError
                  ? balance.error.message
                  : payoutBank.error instanceof ApiError
                    ? payoutBank.error.message
                    : payoutFee.error instanceof ApiError
                      ? payoutFee.error.message
                      : "Unable to reach the platform service."}
              </p>
            </div>
          ) : (
            <>
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-foreground">
                  {selectedWorkspace?.display_name ?? selectedId}
                </h2>

                <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(15,31,26,0.04)] space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <InfoItem
                        label="Available Balance"
                        value={b ? formatCurrency(b.available_amount) : "—"}
                      />
                      <p className="mt-1 text-xs text-muted">
                        Pending: {b ? formatCurrency(b.pending_amount) : "—"}
                      </p>
                    </div>
                    <InfoItem
                      label="Payout Fee"
                      value={fee > 0 ? formatCurrency(fee) : "No fee configured"}
                    />
                    <InfoItem
                      label="Maximum Payout"
                      value={formatCurrency(maxPayout)}
                    />
                  </div>

                  <hr className="border-border" />

                  {payoutBank.data ? (
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <InfoItem label="Bank Name" value={payoutBank.data.bank_name} />
                      <InfoItem label="Account Name" value={payoutBank.data.bank_account_name} />
                      <InfoItem
                        label="Account Number"
                        value={payoutBank.data.bank_account_number}
                        mono
                      />
                      <InfoItem
                        label="Doku Subaccount ID"
                        value={b?.account_id ?? "—"}
                        mono
                      />
                    </dl>
                  ) : (
                    <p className="text-sm text-muted">No payout bank configured.</p>
                  )}
                </div>
              </section>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-2xl border border-border bg-surface p-8 shadow-[0_1px_2px_rgba(15,31,26,0.04)] space-y-6"
              >
                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger"
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor={ids.amount} className="block text-sm font-medium">
                    Amount
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-[0.625rem] border border-border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                    <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
                      Rp
                    </span>
                    <input
                      id={ids.amount}
                      type="text"
                      inputMode="numeric"
                      required
                      className="h-11 flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
                      disabled={pending || maxPayout <= 0}
                      value={formatIDR(amountValue)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        setValue("amount", raw === "" ? 0 : Number(raw), { shouldValidate: true });
                      }}
                    />
                  </div>
                  {errors.amount ? (
                    <p className="text-xs text-danger">{errors.amount.message}</p>
                  ) : (
                    <p className="text-xs text-muted">
                      Max: {formatCurrency(maxPayout)}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={ids.reason} className="block text-sm font-medium">
                    Reason
                  </label>
                  <textarea
                    id={ids.reason}
                    rows={3}
                    required
                    className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-65 ${
                      errors.reason ? "border-danger" : "border-border"
                    }`}
                    disabled={pending}
                    {...register("reason")}
                  />
                  {errors.reason ? (
                    <p className="text-xs text-danger">{errors.reason.message}</p>
                  ) : (
                    <p className="text-xs text-muted">Provide a reason for this payout.</p>
                  )}
                </div>

                <footer className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => router.push("/payouts")}
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending || maxPayout <= 0 || amountValue > maxPayout}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
                  >
                    {pending && <Spinner />}
                    {pending ? "Processing…" : "Submit Payout"}
                  </button>
                </footer>

                <FormStyles />
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}