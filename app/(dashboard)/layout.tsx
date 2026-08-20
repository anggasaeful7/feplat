import { BrandMark } from "@/app/_components/brand-mark";
import { AuthService } from "@/services/auth.service";
import type { AuthUser } from "@/types";
import { SidebarNav } from "@/components/sidebar-nav";
import { Topbar } from "@/components/topbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/axios";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("spc_session")?.value;

  if (!token) {
    redirect("/login");
  }

  let me: AuthUser | null = null;
  let shouldRedirect = false;

  try {
    me = await AuthService.getCurrentUser();
    if (!me) {
      shouldRedirect = true;
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="sticky top-0 h-screen border-r border-border bg-surface flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-6 pb-7">
          <BrandMark size="sm" />
          <div className="leading-tight">
            <div className="text-base font-semibold text-brand">
              {me?.role === "superadmin" ? "Superadmin" : "Tenant Admin"}
              <br />
              Portal
            </div>
            <div className="text-[11px] text-muted mt-0.5">
              {me?.role === "superadmin" ? "Global Control" : "Tenant Control"}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between pb-2">
          <SidebarNav user={me} />
        </div>
      </aside>

      <div className="flex flex-col min-w-0">
        <Topbar user={me} />
        <main className="flex-1 px-8 pt-8 pb-12">{children}</main>
      </div>
    </div>
  );
}
