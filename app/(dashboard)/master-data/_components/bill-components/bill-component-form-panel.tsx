"use client";

import { useRouter } from "next/navigation";
import { useState, useId, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billComponentSchema, type BillComponentInput } from "@/lib/validations/bill-component";
import { useCreateBillComponent, useUpdateBillComponent } from "@/hooks/api/use-bill-component";
import type { BillComponent } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { Drawer } from "@/components/ui/drawer";
import { ApiError } from "@/lib/axios";
import { formatIDR, parseIDR } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type Mode = "new" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  item?: BillComponent;
  closeHref: string;
};

export function BillComponentFormPanel({ open, mode, item, closeHref }: Props) {
  return (
    <Drawer
      open={open}
      title={mode === "edit" ? "Edit Bill Component" : "Add a new Bill Component"}
      subtitle={mode === "edit" ? item?.name : "Add a new bill component to the platform."}
      width="lg"
      closeHref={closeHref}
    >
      {mode === "edit" && item ? (
        <BillComponentForm key={item.id} mode="edit" item={item} closeHref={closeHref} />
      ) : (
        <BillComponentForm mode="new" closeHref={closeHref} />
      )}
    </Drawer>
  );
}

function BillComponentForm({
  mode,
  item,
  closeHref,
}: {
  mode: "new" | "edit";
  item?: BillComponent;
  closeHref: string;
}) {
  const router = useRouter();
  const createMutation = useCreateBillComponent();
  const updateMutation = useUpdateBillComponent(item?.id || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BillComponentInput>({
    resolver: zodResolver(billComponentSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      amount: item?.amount ?? 0,
      is_variable: item?.is_variable ?? false,
      is_active: item?.is_active ?? true,
      sort_order: item?.sort_order ?? 0,
    },
  });

  const onSubmit = async (data: BillComponentInput) => {
    setErrorMsg(null);

    startTransition(async () => {
      try {
        const payload = {
          name: data.name,
          description: data.description || "",
          amount: data.amount,
          is_variable: data.is_variable,
          is_active: data.is_active,
          sort_order: data.sort_order,
        };

        if (isEdit) {
          await updateMutation.mutateAsync(payload);
        } else {
          await createMutation.mutateAsync(payload);
        }
        router.push(closeHref);
        router.refresh();
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("An unexpected error occurred. Please try again.");
        }
      }
    });
  };

  const pending = createMutation.isPending || updateMutation.isPending || isPending;

  const ids = {
    name: useId(),
    description: useId(),
    amount: useId(),
    is_variable: useId(),
    is_active: useId(),
    sort_order: useId(),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-6">
      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      <Section title="Bill Component Details">
        <div className="space-y-1.5">
          <label htmlFor={ids.name} className="block text-sm font-medium">
            Name
          </label>
          <input
            id={ids.name}
            type="text"
            required
            placeholder="e.g. Maintenance Fee"
            className={`input ${errors.name ? "error" : ""}`}
            disabled={pending}
            autoComplete="off"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.description} className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id={ids.description}
            rows={3}
            placeholder="Optional description"
            className={`block w-full min-h-11 rounded-[0.625rem] border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none resize-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-65 ${errors.description ? "border-danger focus:border-danger focus:ring-danger/15" : ""}`}
            disabled={pending}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-danger">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.amount} className="block text-sm font-medium">
            Amount (Rp)
          </label>
          <div className="flex items-stretch overflow-hidden rounded-[0.625rem] border border-border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
            <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
              Rp
            </span>
            <input
              id={ids.amount}
              type="text"
              inputMode="numeric"
              min="0"
              required
              className="h-11 flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
              disabled={pending}
              value={formatIDR(watch("amount"))}
              onChange={e => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setValue("amount", raw === "" ? 0 : Number(raw), { shouldValidate: true });
              }}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-danger">{errors.amount.message}</p>
          )}
        </div>
      </Section>

      <Section title="Configuration">
        <div className="space-y-1.5">
          <label htmlFor={ids.sort_order} className="block text-sm font-medium">
            Sort Order
          </label>
          <input
            id={ids.sort_order}
            type="number"
            min="0"
            required
            className={`input ${errors.sort_order ? "error" : ""}`}
            disabled={pending}
            {...register("sort_order", { valueAsNumber: true })}
          />
          {errors.sort_order ? (
            <p className="text-xs text-danger">{errors.sort_order.message}</p>
          ) : (
            <p className="text-xs text-muted">Determines the display order. Lower numbers appear first.</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
              disabled={pending}
              {...register("is_variable")}
            />
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Variable amount</div>
              <div className="text-xs text-muted">
                If enabled, the amount can vary per billing cycle.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
              disabled={pending}
              {...register("is_active")}
            />
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted">
                Inactive bill components will not appear in billing.
              </div>
            </div>
          </label>
        </div>
      </Section>

      <div className="mt-auto flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => router.push(closeHref)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-muted hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending && <Spinner />}
          {isEdit
            ? pending
              ? "Saving…"
              : "Save changes"
            : pending
              ? "Creating…"
              : "Create Bill Component"}
        </button>
      </div>

      <FormStyles />
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
