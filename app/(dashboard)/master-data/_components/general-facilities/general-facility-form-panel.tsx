"use client";

import { useRouter } from "next/navigation";
import { useState, useId, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generalFacilitySchema, type GeneralFacilityInput } from "@/lib/validations/general-facility";
import { useCreateGeneralFacility, useUpdateGeneralFacility } from "@/hooks/api/use-general-facility";
import type { GeneralFacility } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { Drawer } from "@/components/ui/drawer";
import { ApiError } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

type Mode = "new" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  item?: GeneralFacility;
  closeHref: string;
};

export function GeneralFacilityFormPanel({ open, mode, item, closeHref }: Props) {
  return (
    <Drawer
      open={open}
      title={mode === "edit" ? "Edit General Facility" : "Add a new General Facility"}
      subtitle={mode === "edit" ? item?.name : "Add a new general facility to the platform."}
      width="lg"
      closeHref={closeHref}
    >
      {mode === "edit" && item ? (
        <GeneralFacilityForm key={item.id} mode="edit" item={item} closeHref={closeHref} />
      ) : (
        <GeneralFacilityForm mode="new" closeHref={closeHref} />
      )}
    </Drawer>
  );
}

function GeneralFacilityForm({
  mode,
  item,
  closeHref,
}: {
  mode: "new" | "edit";
  item?: GeneralFacility;
  closeHref: string;
}) {
  const router = useRouter();
  const createMutation = useCreateGeneralFacility();
  const updateMutation = useUpdateGeneralFacility(item?.id || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralFacilityInput>({
    resolver: zodResolver(generalFacilitySchema),
    defaultValues: {
      name: item?.name || "",
      is_active: item?.is_active ?? true,
      is_auto_suspend: item?.is_auto_suspend ?? false,
    },
  });

  const onSubmit = async (data: GeneralFacilityInput) => {
    setErrorMsg(null);

    startTransition(async () => {
      try {
        const payload = {
          name: data.name,
          is_active: data.is_active,
          is_auto_suspend: data.is_auto_suspend,
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
    is_active: useId(),
    is_auto_suspend: useId(),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-6">
      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      <Section title="General Facility Details">
        <div className="space-y-1.5">
          <label htmlFor={ids.name} className="block text-sm font-medium">
            Name
          </label>
          <input
            id={ids.name}
            type="text"
            required
            placeholder="e.g. Swimming Pool"
            className={`input ${errors.name ? "error" : ""}`}
            disabled={pending}
            autoComplete="off"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>
      </Section>

      <Section title="Configuration">
        <div className="space-y-3">
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
                Inactive facilities cannot be assigned to units.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
              disabled={pending}
              {...register("is_auto_suspend")}
            />
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Auto Suspend</div>
              <div className="text-xs text-muted">
                If enabled, this facility will be automatically suspended when conditions are met.
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
              : "Create General Facility"}
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
