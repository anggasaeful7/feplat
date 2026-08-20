"use client";

import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user";
import { useUpdateUser } from "@/hooks/api/use-user";
import { ApiError } from "@/lib/axios";
import { FormStyles } from "@/components/form-styles";

export function ProfileForm({
  userId,
  fullName,
  email,
  role,
  workspaceId,
}: {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  workspaceId?: string;
}) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateUser(userId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: fullName,
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      try {
        await updateMutation.mutateAsync(
          {
            full_name: data.full_name,
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["auth"] });
              setSuccessMsg("Profile updated successfully.");
            },
          }
        );
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("An unexpected error occurred. Please try again.");
        }
      }
    });
  };

  const pending = updateMutation.isPending || isPending;
  const ids = {
    fullName: useId(),
    email: useId(),
    role: useId(),
    ws: useId(),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div role="status" className="rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
          {successMsg}
        </div>
      )}

      <Field id={ids.fullName} label="Full name" error={errors.full_name?.message}>
        <input
          id={ids.fullName}
          type="text"
          required
          disabled={pending}
          className={`input ${errors.full_name ? "error" : ""}`}
          {...register("full_name")}
        />
      </Field>

      <Field id={ids.email} label="Email">
        <input
          id={ids.email}
          type="email"
          value={email}
          readOnly
          className="input bg-surface-muted text-muted"
        />
        <p className="text-xs text-muted mt-1">
          Email cannot be changed once an account exists.
        </p>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={ids.role} label="Role">
          <span className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground/80">
            {role}
          </span>
        </Field>
        <Field id={ids.ws} label="Workspace">
          <span className="text-sm text-foreground/80">
            {workspaceId ? (
              <code className="text-xs">{workspaceId}</code>
            ) : (
              <span className="text-muted">— platform-wide —</span>
            )}
          </span>
        </Field>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
      <FormStyles />
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </label>
  );
}
