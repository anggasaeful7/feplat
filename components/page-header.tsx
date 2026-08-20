import Link from "next/link";

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
}: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand"
      >
        <span aria-hidden>←</span>
        <span>{eyebrow}</span>
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted max-w-xl">{description}</p>
      </div>
    </header>
  );
}
