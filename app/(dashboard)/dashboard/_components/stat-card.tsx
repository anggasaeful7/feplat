type Tone = "brand" | "warning" | "success" | "muted";

export function StatCard({
  label,
  value,
  tone = "brand",
  hint,
}: {
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
}) {
  const valueTone = {
    brand: "text-brand",
    warning: "text-warning",
    success: "text-success",
    muted: "text-foreground",
  }[tone];

  const glow = {
    brand:
      "before:bg-[radial-gradient(circle_at_top_right,rgba(13,64,41,0.10),transparent_60%)]",
    warning:
      "before:bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_60%)]",
    success:
      "before:bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_60%)]",
    muted:
      "before:bg-[radial-gradient(circle_at_top_right,rgba(15,31,26,0.06),transparent_60%)]",
  }[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(15,31,26,0.04)] before:absolute before:inset-0 before:-z-0 ${glow}`}
    >
      <div className="relative space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label}
        </div>
        <div className={`text-4xl font-semibold tracking-tight ${valueTone}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {hint && <div className="text-xs text-muted">{hint}</div>}
      </div>
    </div>
  );
}
