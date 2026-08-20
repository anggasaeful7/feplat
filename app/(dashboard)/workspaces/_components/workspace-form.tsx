"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useId } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workspaceSchema, type WorkspaceInput } from "@/lib/validations/workspace";
import { useCreateWorkspace, useUpdateWorkspace } from "@/hooks/api/use-workspace";
import { Workspace, Tenant } from "@/types";
import {
  SLUG_PATTERN,
  TIPE_WORKSPACE_CODES,
  TIPE_WORKSPACE_DEFAULT,
  TIPE_WORKSPACE_LABELS,
} from "@/types/workspace";
import { LogoUploader } from "@/components/logo-uploader";
import { FormStyles } from "@/components/form-styles";
import { DatePicker } from "@/components/ui/date-picker";
import { ApiError } from "@/lib/axios";
import { toDateInput, slugify } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useBankMerchants } from "@/hooks/api/use-bank-merchant";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; workspace: Workspace };

export function WorkspaceForm({ mode, tenants = [] }: { mode: Mode; tenants?: Tenant[] }) {
  const router = useRouter();
  const isEdit = mode.kind === "edit";

  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace(isEdit ? mode.workspace.id : "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: bankMerchantsData, isLoading: isLoadingBankMerchants } = useBankMerchants({
    enabled: !isEdit,
  });
  const bankMerchants = bankMerchantsData?.items ?? [];

  const initialValues: WorkspaceInput = {
    display_name: isEdit ? mode.workspace.display_name : "",
    slug: isEdit ? mode.workspace.slug : "",
    logo: (isEdit ? mode.workspace.logo : "") || "",
    tipe_workspace: (isEdit ? mode.workspace.tipe_workspace : TIPE_WORKSPACE_DEFAULT) ?? TIPE_WORKSPACE_DEFAULT,
    expired_at: isEdit ? toDateInput(mode.workspace.expired_at) : "",
    tenant_id: isEdit ? mode.workspace.tenant_id || "" : (tenants.length === 1 ? tenants[0].id : ""),
    code: isEdit ? mode.workspace.code || "" : "",
    admin_name: "",
    admin_email: "",
    bank_merchant_id: "",
    bank_account_number: "",
    bank_account_name: "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: initialValues,
  });

  const displayName = useWatch({ control, name: "display_name" });
  const slug = useWatch({ control, name: "slug" }) || "";
  const [slugTouched, setSlugTouched] = useState(isEdit || Boolean(initialValues.slug));

  useEffect(() => {
    if (!slugTouched && displayName) {
      setValue("slug", slugify(displayName), { shouldValidate: true });
    }
  }, [displayName, slugTouched, setValue]);

  useEffect(() => {
    if (!isEdit && tenants.length === 1) {
      setValue("tenant_id", tenants[0].id, { shouldValidate: true });
    }
  }, [tenants, isEdit, setValue]);

  const slugInvalid = slug.length > 0 && !SLUG_PATTERN.test(slug);

  const onSubmit = async (data: WorkspaceInput) => {
    setErrorMsg(null);

    // Format expired_at to ISO string for backend
    const payload = {
      display_name: data.display_name,
      slug: data.slug,
      logo: data.logo || undefined,
      tipe_workspace: data.tipe_workspace,
      expired_at: data.expired_at
        ? new Date(`${data.expired_at}T23:59:59Z`).toISOString()
        : undefined,
      tenant_id: !isEdit ? data.tenant_id || undefined : undefined,
      code: !isEdit ? data.code || undefined : undefined,
      admin_name: !isEdit ? data.admin_name || undefined : undefined,
      admin_email: !isEdit ? data.admin_email || undefined : undefined,
      payout_bank: !isEdit && data.bank_merchant_id && data.bank_account_number && data.bank_account_name
        ? {
          bank_merchant_id: data.bank_merchant_id,
          bank_account_number: data.bank_account_number,
          bank_account_name: data.bank_account_name,
        }
        : undefined,
      doku_sub_account: !isEdit && data.admin_email && data.display_name
        ? {
          email: data.admin_email,
          type: "STANDARD" as const,
          name: data.display_name,
        }
        : undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        const created = await createMutation.mutateAsync(payload);
        router.push(`/workspaces/${created.workspace.id}/edit?created=1`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  const ids = {
    name: useId(),
    slug: useId(),
    tipe: useId(),
    tenant: useId(),
    code: useId(),
    adminName: useId(),
    adminEmail: useId(),
    bankMerchantId: useId(),
    bankAccountNumber: useId(),
    bankAccountName: useId(),
  };

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

      {createMutation.isSuccess && (
        <div role="alert" className="rounded-lg border border-success-soft bg-success-soft/60 px-3 py-2 text-sm text-success">
          Workspace created successfully.
        </div>
      )}

      {updateMutation.isSuccess && (
        <div role="alert" className="rounded-lg border border-success-soft bg-success-soft/60 px-3 py-2 text-sm text-success">
          Workspace updated successfully.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={ids.name} className="block text-sm font-medium">
            Display name
          </label>
          <input
            id={ids.name}
            type="text"
            required
            placeholder="Acme Corporation"
            className={`input ${errors.display_name ? "error" : ""}`}
            disabled={pending}
            autoComplete="off"
            {...register("display_name")}
          />
          {errors.display_name ? (
            <p className="text-xs text-danger">{errors.display_name.message}</p>
          ) : (
            <p className="text-xs text-muted">Shown across the console and in tenant headers.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.slug} className="block text-sm font-medium">
            Slug
          </label>
          <div className="flex items-stretch overflow-hidden rounded-[0.625rem] border border-border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
            <span className="grid place-items-center bg-surface-muted px-3 text-xs font-medium text-muted">
              /
            </span>
            <input
              id={ids.slug}
              type="text"
              required
              placeholder="acme-corp"
              className="h-11 flex-1 bg-surface px-3 text-sm outline-none disabled:opacity-65"
              disabled={pending}
              autoComplete="off"
              spellCheck={false}
              {...register("slug", {
                onChange: () => {
                  setSlugTouched(true);
                },
              })}
            />
          </div>
          {errors.slug ? (
            <p className="text-xs text-danger">{errors.slug.message}</p>
          ) : slugInvalid ? (
            <p className="text-xs text-warning">
              Use lowercase letters, digits, and single hyphens between segments.
            </p>
          ) : (
            <p className="text-xs text-muted">Lowercase letters, numbers, single hyphens. Used in URLs.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.tipe} className="block text-sm font-medium">
            Workspace type
          </label>
          <select
            id={ids.tipe}
            required
            disabled={pending}
            className={`input ${errors.tipe_workspace ? "error" : ""}`}
            {...register("tipe_workspace")}
          >
            {TIPE_WORKSPACE_CODES.map((code) => (
              <option key={code} value={code}>
                {TIPE_WORKSPACE_LABELS[code]}
              </option>
            ))}
          </select>
          {errors.tipe_workspace ? (
            <p className="text-xs text-danger">{errors.tipe_workspace.message}</p>
          ) : (
            <p className="text-xs text-muted">Pick the property type managed by this workspace.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">
            Logo
          </label>
          <Controller
            control={control}
            name="logo"
            render={({ field }) => (
              <LogoUploader
                value={field.value}
                onChange={field.onChange}
                disabled={pending}
              />
            )}
          />
          {errors.logo ? (
            <p className="text-xs text-danger">{errors.logo.message}</p>
          ) : (
            <p className="text-xs text-muted">Optional. Stored on the platform CDN and attached to this workspace.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">
            Expiration date
          </label>
          <Controller
            control={control}
            name="expired_at"
            render={({ field }) => (
              <DatePicker
                value={field.value ?? ""}
                onChange={field.onChange}
                minDate={new Date()}
                disabled={pending}
                placeholderText="Select expiration date"
              />
            )}
          />
          {errors.expired_at ? (
            <p className="text-xs text-danger">{errors.expired_at.message}</p>
          ) : (
            <p className="text-xs text-muted">Optional. Leave blank for an indefinite contract.</p>
          )}
        </div>

        {!isEdit && (
          <>
            <div className="space-y-1.5">
              <label htmlFor={ids.tenant} className="block text-sm font-medium">
                Tenant
              </label>
              <select
                id={ids.tenant}
                disabled={pending || tenants.length === 1}
                className={`input ${errors.tenant_id ? "error" : ""}`}
                {...register("tenant_id")}
              >
                <option value="" disabled>
                  Select a tenant
                </option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (/{t.slug})
                  </option>
                ))}
              </select>
              {errors.tenant_id ? (
                <p className="text-xs text-danger">{errors.tenant_id.message}</p>
              ) : (
                <p className="text-xs text-muted">Optional. The tenant directory this workspace belongs to.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor={ids.code} className="block text-sm font-medium">
                Workspace Code
              </label>
              <input
                id={ids.code}
                type="text"
                required
                placeholder="GN"
                className={`input ${errors.code ? "error" : ""}`}
                disabled={pending}
                autoComplete="off"
                {...register("code")}
              />
              {errors.code ? (
                <p className="text-xs text-danger">{errors.code.message}</p>
              ) : (
                <p className="text-xs text-muted">Short code prefix for usernames (e.g. &quot;GN&quot;). Between 2-20 chars.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor={ids.adminName} className="block text-sm font-medium">
                Admin Full Name
              </label>
              <input
                id={ids.adminName}
                type="text"
                required
                placeholder="Jane Doe"
                className={`input ${errors.admin_name ? "error" : ""}`}
                disabled={pending}
                autoComplete="off"
                {...register("admin_name")}
              />
              {errors.admin_name && (
                <p className="text-xs text-danger">{errors.admin_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor={ids.adminEmail} className="block text-sm font-medium">
                Admin Email Address
              </label>
              <input
                id={ids.adminEmail}
                type="email"
                required
                placeholder="jane.doe@example.com"
                className={`input ${errors.admin_email ? "error" : ""}`}
                disabled={pending}
                autoComplete="off"
                {...register("admin_email")}
              />
              {errors.admin_email && (
                <p className="text-xs text-danger">{errors.admin_email.message}</p>
              )}
            </div>

            {/* Section Bank Payout */}
            <div className="col-span-full border-t border-border pt-6 mt-2">
              <h3 className="text-base font-semibold text-foreground">Bank Payout</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure the payout bank details for this workspace.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={ids.bankMerchantId} className="block text-sm font-medium">
                Bank Payout
              </label>
              <select
                id={ids.bankMerchantId}
                required
                disabled={pending || isLoadingBankMerchants}
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
                disabled={pending}
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
                placeholder="Test Residence"
                className={`input ${errors.bank_account_name ? "error" : ""}`}
                disabled={pending}
                autoComplete="off"
                {...register("bank_account_name")}
              />
              {errors.bank_account_name ? (
                <p className="text-xs text-danger">{errors.bank_account_name.message}</p>
              ) : (
                <p className="text-xs text-muted">The registered name for the bank account.</p>
              )}
            </div>
          </>
        )}

      </div>

      <footer className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Link
          href="/workspaces"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/70 hover:bg-surface-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending && <Spinner />}
          {isEdit
            ? pending
              ? "Saving…"
              : "Save changes"
            : pending
              ? "Creating…"
              : "Create workspace"}
        </button>
      </footer>

      <FormStyles />
    </form>
  );
}


