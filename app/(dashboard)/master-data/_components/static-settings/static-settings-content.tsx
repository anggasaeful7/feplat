import { StaticSettingsForm } from "./static-settings-form";


export function StaticSettingsContent() {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Static Settings
        </h2>
        <p className="text-sm text-muted">
          Configure platform-wide static values and fees.
        </p>
      </div>
      <StaticSettingsForm />
    </section>
  );
}
