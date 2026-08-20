"use client";

import { useId, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/user";
import { useChangePassword } from "@/hooks/api/use-user";
import { ApiError } from "@/lib/axios";
import { FormStyles } from "@/components/form-styles";

export function PasswordForm({ userId }: { userId: string }) {
  const passwordMutation = useChangePassword(userId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const toggleShow = (field: string) => setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      try {
        await passwordMutation.mutateAsync({ password: data.password, confPassword: data.confPassword });
        setSuccessMsg("Password updated successfully.");
        reset();
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("An unexpected error occurred. Please try again.");
        }
      }
    });
  };

  const pending = passwordMutation.isPending || isPending;

  const ids = {
    next: useId(),
    confirm: useId(),
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

      <Field
        id={ids.next}
        label="New password"
        error={errors.password?.message}
      >
        <div className="relative">
          <input
            id={ids.next}
            type={showPassword["new"] ? "text" : "password"}
            required
            autoComplete="new-password"
            disabled={pending}
            className={`input pr-10 ${errors.password ? "error" : ""}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => toggleShow("new")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword["new"] ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <Field
        id={ids.confirm}
        label="Confirm new password"
        error={errors.confPassword?.message}
      >
        <div className="relative">
          <input
            id={ids.confirm}
            type={showPassword["confirm"] ? "text" : "password"}
            required
            autoComplete="new-password"
            disabled={pending}
            className={`input pr-10 ${errors.confPassword ? "error" : ""}`}
            {...register("confPassword")}
          />
          <button
            type="button"
            onClick={() => toggleShow("confirm")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword["confirm"] ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update password"}
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
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </label>
  );
}