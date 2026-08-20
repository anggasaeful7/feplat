"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/api/use-auth";
import { writeAuth } from "@/lib/auth-storage";
import { ApiError } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLogin();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput & { remember?: boolean }) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await loginMutation.mutateAsync({
          email: data.email,
          password: data.password,
        });

        // Set client auth state with a placeholder token since the actual JWT is in the HttpOnly cookie
        writeAuth("session", res.user, !!data.remember);

        router.replace("/workspaces");
        router.refresh();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Sign in failed. Please try again.");
        }
      }
    });
  };

  const pending = loginMutation.isPending || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
        </div>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@yourdomain.com"
          className={`input ${errors.email ? "border-danger" : ""}`}
          disabled={pending}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-danger">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <a
            href="#"
            className="text-xs font-medium text-brand hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`input pr-10 ${errors.password ? "border-danger" : ""}`}
            disabled={pending}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted select-none">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-brand"
          {...register("remember")}
        />
        Keep me signed in on this device
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {pending ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <style>{`
        .input {
          display: block;
          width: 100%;
          height: 3rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 0 0.875rem;
          font-size: 0.95rem;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input::placeholder { color: #a8a89c; }
        .input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand) 18%, transparent);
        }
        .input:disabled { opacity: .65; cursor: not-allowed; }
        .input.border-danger {
          border-color: var(--danger);
        }
      `}</style>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="m3 3 18 18" strokeLinecap="round" />
      <path d="M10.6 6.1A10.7 10.7 0 0 1 12 6c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
    </svg>
  );
}


