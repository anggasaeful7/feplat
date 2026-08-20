"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Map } from "lucide-react";
import type { AuthUser } from "@/types";
import {
  AnalyticsIcon,
  BuildingIcon,
  ClockIcon,
  CreditCardIcon,
  DashboardIcon,
  GridIcon,
  LayersIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
} from "@/app/_components/icons";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { Icon, href, label } = item;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active
        ? "bg-brand-soft text-brand"
        : "text-foreground/75 hover:bg-surface-muted hover:text-foreground"
        }`}
    >
      {active && (
        <span className="absolute right-0 top-1.5 bottom-1.5 w-1 rounded-l bg-brand" />
      )}
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function SidebarNav({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const isSuperadmin = !user || user.role === "superadmin";

  const isOwnerWorkspace = user?.role === "owner_workspace";

  const primaryNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
    isSuperadmin && { href: "/tenants", label: "Tenants", Icon: GridIcon },
    { href: "/workspaces", label: "Workspaces", Icon: BuildingIcon },
    { href: "/maps", label: "Maps", Icon: Map },
    (isSuperadmin || isOwnerWorkspace) && { href: "/user-access", label: "User Access", Icon: UsersIcon },
    isSuperadmin && { href: "/payment-fees", label: "Platform Fee", Icon: CreditCardIcon },
    isSuperadmin && { href: "/invoices", label: "Invoices", Icon: FileText },
    isSuperadmin && { href: "/payouts", label: "Payouts", Icon: ReceiptIcon },
    isSuperadmin && { href: "/analytics", label: "Analytics", Icon: AnalyticsIcon },
    isSuperadmin && { href: "/audit-logs", label: "Audit Logs", Icon: ClockIcon },
    { href: "/master-data", label: "Master Data", Icon: LayersIcon },
  ].filter(Boolean) as NavItem[];

  return (
    <>
      <nav className="space-y-1 px-3">
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      <nav className="space-y-1 px-3 pb-4">
        <NavLink item={{ href: "/settings", label: "Settings", Icon: SettingsIcon }}
          active={isActive("/settings")} />
      </nav>
    </>
  );
}
