"use client";

import { useRouter } from "next/navigation";
import { useState, useId, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type ChangePasswordInput,
} from "@/lib/validations/user";
import {
  useCreateUser,
  useUpdateUser,
  useChangePassword,
} from "@/hooks/api/use-user";
import { ROLES, ROLE_DESCRIPTION, ROLE_LABEL } from "@/types/user";
import type { Role, User, Workspace, Tenant } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { Drawer } from "@/components/ui/drawer";
import { ApiError } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

type Mode = "new" | "edit" | "password";

type Props = {
  open: boolean;
  mode: Mode;
  user?: User;
  workspaces: Workspace[];
  tenants: Tenant[];
  closeHref: string;
  isOwnerWorkspace?: boolean;
};

export function UserFormPanel({
  open,
  mode,
  user,
  workspaces,
  tenants,
  closeHref,
  isOwnerWorkspace = false,
}: Props) {
  if (mode === "password") {
    return (
      <Drawer
        open={open}
        title="Reset password"
        subtitle={user ? `New password for ${user.full_name}` : undefined}
        closeHref={closeHref}
      >
        {user && (
          <PasswordForm key={user.id} user={user} closeHref={closeHref} />
        )}
      </Drawer>
    );
  }

  return (
    <Drawer
      open={open}
      title={mode === "edit" ? "Edit admin" : isOwnerWorkspace ? "Add workspace admin" : "Add a new user"}
      subtitle={
        mode === "edit"
          ? user?.email
          : isOwnerWorkspace
            ? "Create a new admin_workspace account for your workspace."
            : "Send the new account credentials to the operator."
      }
      width="lg"
      closeHref={closeHref}
    >
      {mode === "edit" && user ? (
        <ProfileForm
          key={user.id}
          mode="edit"
          user={user}
          workspaces={workspaces}
          tenants={tenants}
          closeHref={closeHref}
          isOwnerWorkspace={isOwnerWorkspace}
        />
      ) : (
        <ProfileForm
          mode="new"
          workspaces={workspaces}
          tenants={tenants}
          closeHref={closeHref}
          isOwnerWorkspace={isOwnerWorkspace}
        />
      )}
    </Drawer>
  );
}

function ProfileForm({
  mode,
  user,
  workspaces,
  tenants,
  closeHref,
  isOwnerWorkspace = false,
}: {
  mode: "new" | "edit";
  user?: User;
  workspaces: Workspace[];
  tenants: Tenant[];
  closeHref: string;
  isOwnerWorkspace?: boolean;
}) {
  const router = useRouter();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(user?.id || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showInitPassword, setShowInitPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserInput & UpdateUserInput>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema) as unknown as Resolver<CreateUserInput & UpdateUserInput>,
    defaultValues: {
      email: user?.email || "",
      full_name: user?.full_name || "",
      password: "",
      role: (user?.role || "admin_workspace") as Role,
      workspace_id: user?.workspace_id || "",
      tenant_id: user?.tenant_id || "",
      is_active: user ? user.is_active : true,
    },
  });

  const role = useWatch({ control, name: "role" });
  const requireWorkspace = role === "admin_workspace";
  const requireTenant = role === "owner_workspace" && !isOwnerWorkspace;

  const onSubmit = async (data: CreateUserInput & UpdateUserInput) => {
    setErrorMsg(null);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateMutation.mutateAsync({
            full_name: data.full_name,
            role: data.role as Role,
            workspace_id: data.role === "admin_workspace" ? data.workspace_id || undefined : undefined,
            tenant_id: data.role === "owner_workspace" ? data.tenant_id || undefined : undefined,
            is_active: data.is_active,
          });
        } else {
          await createMutation.mutateAsync({
            email: data.email,
            password: data.password,
            full_name: data.full_name,
            role: data.role as Role,
            workspace_id: data.role === "admin_workspace" ? data.workspace_id || undefined : undefined,
            tenant_id: data.role === "owner_workspace" ? data.tenant_id || undefined : undefined,
            is_active: data.is_active,
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
    full_name: useId(),
    email: useId(),
    password: useId(),
    role: useId(),
    workspace: useId(),
    tenant: useId(),
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

      <Section title="Identity">
        <div className="space-y-1.5">
          <label htmlFor={ids.full_name} className="block text-sm font-medium">
            Full name
          </label>
          <input
            id={ids.full_name}
            type="text"
            required
            placeholder="Avery Johnson"
            className={`input ${errors.full_name ? "error" : ""}`}
            disabled={pending}
            autoComplete="off"
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-xs text-danger">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.email} className="block text-sm font-medium">
            Email
          </label>
          <input
            id={ids.email}
            type="email"
            required={!isEdit}
            placeholder="avery@platform.io"
            className={`input ${errors.email ? "error" : ""}`}
            disabled={pending || isEdit}
            autoComplete="off"
            spellCheck={false}
            {...register("email")}
          />
          {isEdit ? (
            <p className="text-xs text-muted">Email cannot be changed after creation.</p>
          ) : errors.email ? (
            <p className="text-xs text-danger">{errors.email.message}</p>
          ) : null}
        </div>

        {!isEdit && (
          <div className="space-y-1.5">
            <label htmlFor={ids.password} className="block text-sm font-medium">
              Initial password
            </label>
            <div className="relative">
              <input
                id={ids.password}
                type={showInitPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className={`input pr-10 ${errors.password ? "error" : ""}`}
                disabled={pending}
                autoComplete="new-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowInitPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                tabIndex={-1}
              >
                {showInitPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-danger">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-muted">At least 8 characters. Share it securely with the user.</p>
            )}
          </div>
        )}
      </Section>

      <Section title="Access">
        <div className="space-y-1.5">
          <label htmlFor={ids.role} className="block text-sm font-medium">
            Role
          </label>
          {isOwnerWorkspace ? (
            // owner_workspace can only create admin_workspace accounts
            <>
              <input type="hidden" {...register("role")} value="admin_workspace" />
              <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-soft/30 px-3 py-2 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-[#1d4ed8]" />
                <span className="font-medium">Workspace Admin</span>
                <span className="ml-auto text-xs text-muted">Fixed for your role</span>
              </div>
              <p className="text-xs text-muted">{ROLE_DESCRIPTION["admin_workspace"]}</p>
            </>
          ) : (
            <>
              {ROLE_DESCRIPTION[role as Role] && (
                <p className="text-xs text-muted mb-2">{ROLE_DESCRIPTION[role as Role]}</p>
              )}
              <div className="grid gap-2">
                {ROLES.map((r) => {
                  const checked = role === r;
                  return (
                    <label
                      key={r}
                      className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${checked
                        ? "border-brand bg-brand-soft/40"
                        : "border-border bg-surface hover:border-brand/30"
                        }`}
                    >
                      <input
                        type="radio"
                        value={r}
                        checked={checked}
                        className="mt-1 accent-brand"
                        disabled={pending}
                        {...register("role")}
                      />
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{ROLE_LABEL[r]}</div>
                        <div className="text-xs text-muted">
                          {ROLE_DESCRIPTION[r]}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-xs text-danger">{errors.role.message}</p>
              )}
            </>
          )}
        </div>

        {requireWorkspace && (
          <div className="space-y-1.5">
            <label htmlFor={ids.workspace} className="block text-sm font-medium">
              Workspace
            </label>
            <select
              id={ids.workspace}
              className={`input ${errors.workspace_id ? "error" : ""}`}
              disabled={pending}
              required
              {...register("workspace_id")}
            >
              <option value="" disabled>
                Select a workspace
              </option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.display_name} (/{w.slug})
                </option>
              ))}
            </select>
            {errors.workspace_id ? (
              <p className="text-xs text-danger">{errors.workspace_id.message}</p>
            ) : (
              <p className="text-xs text-muted">The workspace this user belongs to.</p>
            )}
          </div>
        )}

        {requireTenant && (
          <div className="space-y-1.5">
            <label htmlFor={ids.tenant} className="block text-sm font-medium">
              Tenant
            </label>
            <select
              id={ids.tenant}
              className={`input ${errors.tenant_id ? "error" : ""}`}
              disabled={pending}
              required
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
              <p className="text-xs text-muted">The tenant this user owns/belongs to.</p>
            )}
          </div>
        )}

        <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
            disabled={pending}
            {...register("is_active")}
          />
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              Account is active
            </div>
            <div className="text-xs text-muted">
              Inactive users cannot sign in. You can flip this any time.
            </div>
          </div>
        </label>
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
              ? "Inviting…"
              : "Invite user"}
        </button>
      </div>

      <FormStyles />
    </form>
  );
}

function PasswordForm({
  user,
  closeHref,
}: {
  user: User;
  closeHref: string;
}) {
  const router = useRouter();
  const passwordMutation = useChangePassword(user.id);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const toggleShow = (field: string) => setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const {
    register,
    handleSubmit,
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
    startTransition(async () => {
      try {
        await passwordMutation.mutateAsync({ password: data.password, confPassword: data.confPassword });
        setTimeout(() => {
          router.push(closeHref);
        }, 800);
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

  const ids = { password: useId(), confirm: useId() };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col gap-5">
      {errorMsg && (
        <div role="alert" className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {passwordMutation.isSuccess && (
        <div role="status" className="rounded-lg border border-success-soft bg-success-soft/60 px-3 py-2 text-sm text-success">
          Password updated successfully.
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-4 text-sm">
        <div className="text-xs uppercase tracking-wider text-muted">
          Account
        </div>
        <div className="mt-1 font-medium text-foreground">{user.full_name}</div>
        <div className="text-xs text-muted">{user.email}</div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.password} className="block text-sm font-medium">
          New password
        </label>
        <div className="relative">
          <input
            id={ids.password}
            type={showPassword["new"] ? "text" : "password"}
            required
            placeholder="••••••••"
            className={`input pr-10 ${errors.password ? "error" : ""}`}
            autoComplete="new-password"
            disabled={pending || passwordMutation.isSuccess}
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
        {errors.password ? (
          <p className="text-xs text-danger">{errors.password.message}</p>
        ) : (
          <p className="text-xs text-muted">Must be 8–128 characters.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.confirm} className="block text-sm font-medium">
          Confirm password
        </label>
        <div className="relative">
          <input
            id={ids.confirm}
            type={showPassword["confirm"] ? "text" : "password"}
            required
            placeholder="••••••••"
            className={`input pr-10 ${errors.confPassword ? "error" : ""}`}
            autoComplete="new-password"
            disabled={pending || passwordMutation.isSuccess}
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
        {errors.confPassword && (
          <p className="text-xs text-danger">{errors.confPassword.message}</p>
        )}
      </div>

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
          disabled={pending || passwordMutation.isSuccess}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
        >
          {pending && <Spinner />}
          {pending ? "Updating…" : passwordMutation.isSuccess ? "Updated" : "Update password"}
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


