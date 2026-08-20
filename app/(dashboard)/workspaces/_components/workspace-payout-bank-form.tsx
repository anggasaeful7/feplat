"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workspacePayoutBankSchema,
  type WorkspacePayoutBankInput,
} from "@/lib/validations/workspace-payout-bank";
import { useUpdateWorkspacePayoutBank } from "@/hooks/api/use-workspace";
import { useBankMerchants } from "@/hooks/api/use-bank-merchant";
import { PayoutBank } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { ApiError } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  workspaceId: string;
  payoutBank: PayoutBank | null | undefined;
};

export function WorkspacePayoutBankForm({ workspaceId, payoutBank }: Props) {
  const mutation = useUpdateWorkspacePayoutBank(workspaceId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: bankMerchantsData, isLoading: isLoadingBankMerchants } = useBankMerchants();
  const bankMerchants = bankMerchantsData?.items ?? [];

  const initialValues: WorkspacePayoutBankInput = {
    bank_merchant_id: payoutBank?.bank_merchant_id || "",
    bank_account_number: payoutBank?.bank_account_number || "",
    bank_account_name: payoutBank?.bank_account_name || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspacePayoutBankInput>({
    resolver: zodResolver(workspacePayoutBankSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: WorkspacePayoutBankInput) => {
    setErrorMsg(null);
    try {
      await mutation.mutateAsync(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  const ids = {
    bankMerchantId: useId(),
    bankAccountNumber: useId(),
    bankAccountName: useId(),
  };

  const verificationColors: Record<string, string> = {
    verified: "bg-success-soft text-success border border-success/20",
    unverified: "bg-warning-soft text-warning border border-warning/20",
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-surface p-8 shadow-[0_1px_2px_rgba(15,31,26,0.04)] space-y-6"
    >
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Payout Bank</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure and update the bank account details for workspace payouts.
        </p>
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {mutation.isSuccess && (
        <div role="alert" className="rounded-lg border border-success-soft bg-success-soft/60 px-3 py-2 text-sm text-success">
          Payout Bank details updated successfully.
        </div>
      )}

      {payoutBank && (
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Verification Status:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                verificationColors[payoutBank.verification_status] ||
                "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {payoutBank.verification_status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Active:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                payoutBank.is_active
                  ? "bg-success-soft text-success border border-success/20"
                  : "bg-danger-soft text-danger border border-danger/20"
              }`}
            >
              {payoutBank.is_active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={ids.bankMerchantId} className="block text-sm font-medium">
            Bank Payout
          </label>
          <select
            id={ids.bankMerchantId}
            required
            disabled={mutation.isPending || isLoadingBankMerchants}
            className={`input ${errors.bank_merchant_id ? "error" : ""}`}
            {...register("bank_merchant_id")}
          >
            <option value="" disabled>
              {isLoadingBankMerchants ? "Loading banks..." : "Select bank"}
            </option>
            {bankMerchants.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.bank_name} ({bank.bank_code})
              </option>
            ))}
          </select>
          {errors.bank_merchant_id ? (
            <p className="text-xs text-danger">{errors.bank_merchant_id.message}</p>
          ) : (
            <p className="text-xs text-muted">Select the payout bank for platform control.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.bankAccountNumber} className="block text-sm font-medium">
            Bank Account Number
          </label>
          <input
            id={ids.bankAccountNumber}
            type="text"
            required
            placeholder="1234567890"
            className={`input ${errors.bank_account_number ? "error" : ""}`}
            disabled={mutation.isPending}
            autoComplete="off"
            {...register("bank_account_number")}
          />
          {errors.bank_account_number ? (
            <p className="text-xs text-danger">{errors.bank_account_number.message}</p>
          ) : (
            <p className="text-xs text-muted">The bank account number for disbursements.</p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor={ids.bankAccountName} className="block text-sm font-medium">
            Bank Account Name
          </label>
          <input
            id={ids.bankAccountName}
            type="text"
            required
            placeholder="Griya Nusantara"
            className={`input ${errors.bank_account_name ? "error" : ""}`}
            disabled={mutation.isPending}
            autoComplete="off"
            {...register("bank_account_name")}
          />
          {errors.bank_account_name ? (
            <p className="text-xs text-danger">{errors.bank_account_name.message}</p>
          ) : (
            <p className="text-xs text-muted">The registered name for the bank account.</p>
          )}
        </div>
      </div>

      <footer className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          {mutation.isPending && <Spinner />}
          Save changes
        </button>
      </footer>

      <FormStyles />
    </form>
  );
}
