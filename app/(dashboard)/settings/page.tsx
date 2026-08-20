import { AuthService } from "@/services/auth.service";
import type { AuthUser } from "@/types";
import { FormStyles } from "@/components/form-styles";
import { PasswordForm } from "./_components/password-form";
import { ProfileForm } from "./_components/profile-form";

export default async function SettingsPage() {
  let me: AuthUser | null = null;
  let loadError: string | null = null;
  try {
    me = await AuthService.getCurrentUser();
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Unable to load your profile.";
  }

  return (
    <div className="space-y-8">
      <FormStyles />

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted max-w-xl">
          Manage your profile and account credentials.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-8">
          <h3 className="text-base font-semibold text-danger">
            Couldn&apos;t load profile
          </h3>
          <p className="mt-1 text-sm text-foreground/70">{loadError}</p>
        </div>
      ) : me ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <header className="mb-5">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-xs text-muted">
                Update your account display information.
              </p>
            </header>
            <ProfileForm
              userId={me.id}
              fullName={me.full_name}
              email={me.email}
              role={me.role}
              workspaceId={me.workspace_id}
            />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <header className="mb-5">
              <h2 className="text-lg font-semibold">Change password</h2>
              <p className="text-xs text-muted">
                Use a strong password unique to this portal.
              </p>
            </header>
            <PasswordForm userId={me.id} />
          </section>
        </div>
      ) : null}

    </div>
  );
}
