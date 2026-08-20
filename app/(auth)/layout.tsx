export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <aside className="relative hidden lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-brand" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12) 0, transparent 45%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="text-sm font-medium tracking-wide opacity-80">
            SUPERADMIN PORTAL
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-semibold leading-tight">
              One pane of glass for every tenant workspace.
            </h2>
            <p className="text-white/75 text-base leading-relaxed max-w-md">
              Provision directories, manage access, and monitor platform health
              across the fleet — without leaving the console.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 max-w-sm">
              <Stat label="Workspaces" value="142" />
              <Stat label="Uptime" value="99.9%" />
              <Stat label="Regions" value="6" />
            </div>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Nuratech Digital Nusantara · Global Control
          </p>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/6 px-3 py-3 backdrop-blur-sm">
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/60 mt-0.5">
        {label}
      </div>
    </div>
  );
}
