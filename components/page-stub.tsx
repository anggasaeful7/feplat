export function PageStub({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted max-w-xl">{description}</p>
      </header>

      <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">Coming up next</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
          This module is wired into the navigation but the full experience is
          still being built. Check back soon.
        </p>
      </div>
    </div>
  );
}
