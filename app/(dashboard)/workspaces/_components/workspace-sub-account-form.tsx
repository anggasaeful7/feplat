"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workspaceSubAccountSchema,
  type WorkspaceSubAccountInput,
} from "@/lib/validations/workspace-sub-account";
import { useUpdateWorkspaceDokuSubAccount } from "@/hooks/api/use-workspace";
import { DokuSubAccount } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { ApiError } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  workspaceId: string;
  dokuSubAccount: DokuSubAccount | null | undefined;
};

export function WorkspaceSubAccountForm({ workspaceId, dokuSubAccount }: Props) {
  const mutation = useUpdateWorkspaceDokuSubAccount(workspaceId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const initialValues: WorkspaceSubAccountInput = {
    email: dokuSubAccount?.account_email || "",
    name: dokuSubAccount?.account_name || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceSubAccountInput>({
    resolver: zodResolver(workspaceSubAccountSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: WorkspaceSubAccountInput) => {
    setErrorMsg(null);
    try {
      await mutation.mutateAsync({
        ...data,
        type: "STANDARD",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  const ids = {
    email: useId(),
    name: useId(),
  };

  const statusColors: Record<string, string> = {
    success: "bg-success-soft text-success border border-success/20",
    pending: "bg-warning-soft text-warning border border-warning/20",
    failed: "bg-danger-soft text-danger border border-danger/20",
  };

  const status = dokuSubAccount?.provisioning_status || "not_provisioned";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-surface p-8 shadow-[0_1px_2px_rgba(15,31,26,0.04)] space-y-6"
    >
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Doku Sub-Account</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure and update the workspace Doku sub-account credentials.
        </p>
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {mutation.isSuccess && (
        <div role="alert" className="rounded-lg border border-success-soft bg-success-soft/60 px-3 py-2 text-sm text-success">
          Doku Sub-Account updated successfully.
        </div>
      )}

      {dokuSubAccount && (
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">Status:</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${statusColors[status] || "bg-muted text-muted-foreground border border-border"
              }`}
          >
            {status}
          </span>
        </div>
      )}

      {status === "failed" && dokuSubAccount?.last_error && (
        <div className="rounded-lg border border-danger/10 bg-danger-soft/20 px-3 py-2.5 text-xs text-danger font-mono">
          <strong>Last Error:</strong> {dokuSubAccount.last_error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={ids.name} className="block text-sm font-medium">
            Account Name
          </label>
          <input
            id={ids.name}
            type="text"
            required
            placeholder="Griya Nusantara"
            className={`input ${errors.name ? "error" : ""}`}
            disabled
            autoComplete="off"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-xs text-danger">{errors.name.message}</p>
          ) : (
            <p className="text-xs text-muted">The name registered on Doku sub-account.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.email} className="block text-sm font-medium">
            Account Email
          </label>
          <input
            id={ids.email}
            type="email"
            required
            placeholder="finance@griya-nusantara.id"
            className={`input ${errors.email ? "error" : ""}`}
            disabled
            autoComplete="off"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-danger">{errors.email.message}</p>
          ) : (
            <p className="text-xs text-muted">The email registered on Doku sub-account.</p>
          )}
        </div>
      </div>

      <footer className="hidden items-center justify-end gap-3 pt-2 border-t border-border">
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
