"use client";

import { useRouter } from "next/navigation";
import { useState, useId, useTransition, useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema, editTenantSchema, type TenantInput } from "@/lib/validations/tenant";
import { useCreateTenant, useUpdateTenant } from "@/hooks/api/use-tenant";
import type { Tenant } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { Drawer } from "@/components/ui/drawer";
import { ApiError } from "@/lib/axios";
import { slugify } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type Mode = "new" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  tenant?: Tenant;
  closeHref: string;
};

export function TenantFormPanel({
  open,
  mode,
  tenant,
  closeHref,
}: Props) {
  return (
    <Drawer
      open={open}
      title={mode === "edit" ? "Edit Tenant" : "Add a new Tenant"}
      subtitle={
        mode === "edit"
          ? tenant?.slug
          : "Add a new tenant residency directory to the platform."
      }
      width="lg"
      closeHref={closeHref}
    >
      {mode === "edit" && tenant ? (
        <TenantForm
          key={tenant.id}
          mode="edit"
          tenant={tenant}
          closeHref={closeHref}
        />
      ) : (
        <TenantForm mode="new" closeHref={closeHref} />
      )}
    </Drawer>
  );
}

function TenantForm({
  mode,
  tenant,
  closeHref,
}: {
  mode: "new" | "edit";
  tenant?: Tenant;
  closeHref: string;
}) {
  const router = useRouter();
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant(tenant?.id || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";

  const schema = isEdit ? editTenantSchema : tenantSchema;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TenantInput>({
    resolver: zodResolver(schema) as unknown as Resolver<TenantInput>,
    defaultValues: {
      name: tenant?.name || "",
      slug: tenant?.slug || "",
      owner_name: "", // note: backend holds these, but on edit they might be optional or prefilled if we fetch tenant details.
      owner_email: "",
      is_active: tenant ? tenant.is_active : true,
    },
  });

  const nameValue = useWatch({ control, name: "name" });

  // Auto slugify name when creating a new tenant and slug is not manually modified
  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue, isEdit]);

  const onSubmit = async (data: TenantInput) => {
    setErrorMsg(null);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateMutation.mutateAsync({
            name: data.name,
            slug: data.slug,
            is_active: data.is_active,
          });
        } else {
          await createMutation.mutateAsync({
            name: data.name,
            slug: data.slug,
            owner_name: data.owner_name!,
            owner_email: data.owner_email!,
          });
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
    slug: useId(),
    owner_name: useId(),
    owner_email: useId(),
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col gap-6"
    >
      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      <Section title="Tenant Details">
        <div className="space-y-1.5">
          <label htmlFor={ids.name} className="block text-sm font-medium">
            Tenant Name
          </label>
          <input
            id={ids.name}
            type="text"
            required
            placeholder="Perumahan Jamrud"
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
          <label htmlFor={ids.slug} className="block text-sm font-medium">
            Slug
          </label>
          <input
            id={ids.slug}
            type="text"
            required
            placeholder="jamrud-residence"
            className={`input ${errors.slug ? "error" : ""}`}
            disabled={pending}
            autoComplete="off"
            {...register("slug")}
          />
          {errors.slug ? (
            <p className="text-xs text-danger">{errors.slug.message}</p>
          ) : (
            <p className="text-xs text-muted">
              Used as the workspace URL handle (e.g. /jamrud-residence). Only lowercase letters, numbers, and single hyphens.
            </p>
          )}
        </div>
      </Section>

      {!isEdit && (
        <Section title="Owner Account Details">
          <div className="space-y-1.5">
            <label htmlFor={ids.owner_name} className="block text-sm font-medium">
              Owner Full Name
            </label>
            <input
              id={ids.owner_name}
              type="text"
              required
              placeholder="John Doe"
              className={`input ${errors.owner_name ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              {...register("owner_name")}
            />
            {errors.owner_name && (
              <p className="text-xs text-danger">{errors.owner_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.owner_email} className="block text-sm font-medium">
              Owner Email Address
            </label>
            <input
              id={ids.owner_email}
              type="email"
              required
              placeholder="john.doe@example.com"
              className={`input ${errors.owner_email ? "error" : ""}`}
              disabled={pending}
              autoComplete="off"
              spellCheck={false}
              {...register("owner_email")}
            />
            {errors.owner_email && (
              <p className="text-xs text-danger">{errors.owner_email.message}</p>
            )}
          </div>
        </Section>
      )}

      {isEdit && (
        <Section title="Status">
          <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
              disabled={pending}
              {...register("is_active")}
            />
            <div className="space-y-0.5">
              <div className="text-sm font-medium">
                Tenant is active
              </div>
              <div className="text-xs text-muted">
                Inactive tenants cannot access their workspace. You can flip this any time.
              </div>
            </div>
          </label>
        </Section>
      )}

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
              : "Create Tenant"}
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


