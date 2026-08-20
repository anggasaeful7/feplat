"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payoutFeeSchema, type PayoutFeeInput } from "@/lib/validations/payout-fee";
import { usePayoutFee, useUpdatePayoutFee } from "@/hooks/api/use-payout-fee";
import { formatIDR, formatDateTime } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/axios";

export function StaticSettingsForm() {
  const { data, isLoading, isError, error } = usePayoutFee();
  const updateMutation = useUpdatePayoutFee();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayoutFeeInput>({
    resolver: zodResolver(payoutFeeSchema),
    defaultValues: { value: 0 },
  });

  useEffect(() => {
    if (data) {
      reset({ value: data.value });
    }
  }, [data, reset]);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(15,31,26,0.04)]">
        <Spinner className="h-5 w-5 text-brand" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-danger-soft/30 p-6 text-center">
        <h3 className="text-sm font-semibold text-danger">Gagal memuat payout fee</h3>
        <p className="mt-1 text-xs text-foreground/70">
          {error instanceof ApiError ? error.message : "Terjadi kesalahan."}
        </p>
      </div>
    );
  }

  const onSubmit = async (values: PayoutFeeInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateMutation.mutateAsync({ code: "PAYOUT_FEE", value: values.value });
      setSuccessMsg("Payout fee berhasil disimpan.");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  };

  const pending = updateMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-surface p-8 shadow-[0_1px_2px_rgba(15,31,26,0.04)] space-y-6"
    >
      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div role="status" className="rounded-lg border border-brand/15 bg-brand-soft px-3 py-2 text-sm text-brand">
          {successMsg}
        </div>
      )}

      {data?.updated_at && !data.updated_at.startsWith("0001") && (
        <p className="text-xs text-muted">
          Terakhir diperbarui: {formatDateTime(data.updated_at)}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="static-settings-value" className="block text-sm font-medium">
          Payout Fee
        </label>
        <div className="flex items-stretch overflow-hidden rounded-[0.625rem] border border-border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
          <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
            Rp
          </span>
          <input
            id="static-settings-value"
            type="text"
            inputMode="numeric"
            required
            className="h-11 flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
            disabled={pending}
            value={formatIDR(watch("value"))}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "");
              setValue("value", raw === "" ? 0 : Number(raw), { shouldValidate: true });
            }}
          />
        </div>
        {errors.value ? (
          <p className="text-xs text-danger">{errors.value.message}</p>
        ) : (
          <p className="text-xs text-muted">Biaya yang dikenakan untuk setiap transaksi payout.</p>
        )}
      </div>

      <footer className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending && <Spinner />}
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </footer>
    </form>
  );
}
