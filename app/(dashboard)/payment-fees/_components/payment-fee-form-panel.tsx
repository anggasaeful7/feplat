"use client";

import { useState, useId, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentFeeSchema,
  PAYMENT_METHODS,
  type PaymentFeeInput,
} from "@/lib/validations/payment-fee";
import {
  useCreateWorkspacePaymentFee,
  useUpdateWorkspacePaymentFee,
} from "@/hooks/api/use-workspace";
import type { PaymentFee } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { Drawer } from "@/components/ui/drawer";
import { ApiError } from "@/lib/axios";
import { formatIDR } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const METHOD_LABELS: Record<string, string> = {
  QRIS: "QRIS",
  ALFAMART: "Alfamart",
  INDOMARET: "Indomaret",
  VA_BCA: "VA BCA",
  VA_BRI: "VA BRI",
};

type Props = {
  open: boolean;
  workspaceId: string;
  item?: PaymentFee;
  onClose: () => void;
};

export function PaymentFeeFormPanel({ open, workspaceId, item, onClose }: Props) {
  const isEdit = !!item;

  return (
    <Drawer
      open={open}
      title={isEdit ? "Edit Payment Fee" : "Add Payment Fee"}
      subtitle={isEdit ? item.payment_method : "Add a new payment fee configuration."}
      width="lg"
      onClose={onClose}
    >
      <PaymentFeeForm
        key={item?.id ?? "new"}
        workspaceId={workspaceId}
        item={item}
        onClose={onClose}
      />
    </Drawer>
  );
}

function PaymentFeeForm({
  workspaceId,
  item,
  onClose,
}: {
  workspaceId: string;
  item?: PaymentFee;
  onClose: () => void;
}) {
  const createMutation = useCreateWorkspacePaymentFee(workspaceId);
  const updateMutation = useUpdateWorkspacePaymentFee(workspaceId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFeeInput>({
    resolver: zodResolver(paymentFeeSchema),
    defaultValues: {
      payment_method: item?.payment_method ?? "",
      payment_per_month: item?.payment_per_month ?? 0,
      maximum_payment: item?.maximum_payment ?? 0,
      maximum_month: item?.maximum_month ?? 1,
      is_flat: item?.is_flat ?? false,
      flat_value: item?.flat_value ?? 0,
    } as PaymentFeeInput,
  });

  const isFlat = watch("is_flat");

  useEffect(() => {
    if (isFlat) {
      setValue("payment_per_month", 0, { shouldValidate: true });
      setValue("maximum_payment", 0, { shouldValidate: true });
      setValue("maximum_month", 1, { shouldValidate: true });
    } else {
      setValue("flat_value", 0, { shouldValidate: true });
    }
  }, [isFlat, setValue]);

  const onSubmit = async (data: PaymentFeeInput) => {
    setErrorMsg(null);

    const payload = isFlat
      ? { ...data, payment_per_month: 0, maximum_payment: 0, maximum_month: 1 }
      : { ...data, flat_value: 0 };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateMutation.mutateAsync({
            ...payload,
            paymentMethod: item.payment_method,
          });
        } else {
          await createMutation.mutateAsync(payload);
        }
        onClose();
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
    payment_method: useId(),
    payment_per_month: useId(),
    maximum_payment: useId(),
    maximum_month: useId(),
    flat_value: useId(),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-6">
      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      <Section title="Payment Method">
        <div className="space-y-1.5">
          <label htmlFor={ids.payment_method} className="block text-sm font-medium">
            Payment Method
          </label>
          {isEdit ? (
            <input
              type="text"
              className="input"
              value={METHOD_LABELS[item.payment_method] ?? item.payment_method}
              disabled
            />
          ) : (
            <Select
              value={watch("payment_method")}
              onValueChange={(val) =>
                setValue("payment_method", val as PaymentFeeInput["payment_method"], { shouldValidate: true })
              }
            >
              <SelectTrigger id={ids.payment_method} className="w-full bg-white">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {METHOD_LABELS[method] ?? method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.payment_method && (
            <p className="text-xs text-danger">{errors.payment_method.message}</p>
          )}
        </div>
      </Section>

      <Section title="Fee Configuration">
        <div className="space-y-1.5">
          <label htmlFor={ids.payment_per_month} className="block text-sm font-medium">
            Payment Per Month
          </label>
          <div className={`flex items-stretch overflow-hidden rounded-[0.625rem] border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${isFlat ? "border-border/50" : "border-border"}`}>
            <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
              Rp
            </span>
            <input
              id={ids.payment_per_month}
              type="text"
              inputMode="numeric"
              required
              className="h-11 flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
              disabled={pending || isFlat}
              value={formatIDR(watch("payment_per_month"))}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setValue("payment_per_month", raw === "" ? 0 : Number(raw), {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          {errors.payment_per_month ? (
            <p className="text-xs text-danger">{errors.payment_per_month.message}</p>
          ) : isFlat ? (
            <p className="text-xs text-muted">Not used when flat rate is enabled.</p>
          ) : (
            <p className="text-xs text-muted">Fee charged per month per bill.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.maximum_payment} className="block text-sm font-medium">
            Maximum Payment
          </label>
          <div className={`flex items-stretch overflow-hidden rounded-[0.625rem] border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${isFlat ? "border-border/50" : "border-border"}`}>
            <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
              Rp
            </span>
            <input
              id={ids.maximum_payment}
              type="text"
              inputMode="numeric"
              required
              className="h-11 flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
              disabled={pending || isFlat}
              value={formatIDR(watch("maximum_payment"))}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setValue("maximum_payment", raw === "" ? 0 : Number(raw), {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          {errors.maximum_payment ? (
            <p className="text-xs text-danger">{errors.maximum_payment.message}</p>
          ) : isFlat ? (
            <p className="text-xs text-muted">Not used when flat rate is enabled.</p>
          ) : (
            <p className="text-xs text-muted">Maximum total fee when reaching max months.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.maximum_month} className="block text-sm font-medium">
            Maximum Month
          </label>
          <input
            id={ids.maximum_month}
            type="number"
            min="1"
            required
            className={`input ${errors.maximum_month ? "error" : ""}`}
            disabled={pending || isFlat}
            {...register("maximum_month", { valueAsNumber: true })}
          />
          {errors.maximum_month ? (
            <p className="text-xs text-danger">{errors.maximum_month.message}</p>
          ) : isFlat ? (
            <p className="text-xs text-muted">Not used when flat rate is enabled.</p>
          ) : (
            <p className="text-xs text-muted">Maximum number of months before cap applies.</p>
          )}
        </div>
      </Section>

      <Section title="Flat Rate">
        <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
            disabled={pending}
            {...register("is_flat")}
          />
          <div className="space-y-0.5">
            <div className="text-sm font-medium">Flat rate</div>
            <div className="text-xs text-muted">
              If enabled, a single flat fee applies instead of per-month calculation.
            </div>
          </div>
        </label>

        <div className="space-y-1.5">
          <label htmlFor={ids.flat_value} className="block text-sm font-medium">
            Flat Value
          </label>
          <div
            className={`flex items-stretch overflow-hidden rounded-[0.625rem] border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 ${
              isFlat ? "border-border" : "border-border/50"
            }`}
          >
            <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
              Rp
            </span>
            <input
              id={ids.flat_value}
              type="text"
              inputMode="numeric"
              required
              className="h-11 flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
              disabled={pending || !isFlat}
              value={formatIDR(watch("flat_value"))}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setValue("flat_value", raw === "" ? 0 : Number(raw), {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          {errors.flat_value ? (
            <p className="text-xs text-danger">{errors.flat_value.message}</p>
          ) : !isFlat ? (
            <p className="text-xs text-muted">Enable flat rate above to set flat value.</p>
          ) : (
            <p className="text-xs text-muted">Single fixed fee applied regardless of bill amount.</p>
          )}
        </div>
      </Section>

      <div className="mt-auto flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
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
              : "Create Payment Fee"}
        </button>
      </div>

      <FormStyles />
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
