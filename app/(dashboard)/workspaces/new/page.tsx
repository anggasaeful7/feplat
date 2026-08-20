import { WorkspaceForm } from "../_components/workspace-form";
import { PageHeader } from "@/components/page-header";
import { TenantService } from "@/services/tenant.service";
import { AuthService } from "@/services/auth.service";
import type { Tenant } from "@/types";

export default async function NewWorkspacePage() {
  let tenants: Tenant[] = [];
  try {
    const me = await AuthService.getCurrentUser();
    if (me?.role === "superadmin") {
      const res = await TenantService.getTenants({ limit: 200 });
      tenants = res?.items ?? [];
    } else if (me?.role === "owner_workspace" && me.tenant_id) {
      try {
        const tenant = await TenantService.getTenant(me.tenant_id);
        if (tenant) {
          tenants = [tenant];
        }
      } catch {
        tenants = [
          {
            id: me.tenant_id,
            name: "My Tenant",
            slug: "my-tenant",
            is_active: true,
            created_at: "",
          },
        ];
      }
    }
  } catch (err) {
    console.error("Failed to load tenants for workspace creation", err);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        backHref="/workspaces"
        eyebrow="Back to workspaces"
        title="Add a new workspace"
        description="Provision a fresh tenant directory. The slug becomes the workspace's URL handle and must be unique across the platform."
      />
      <WorkspaceForm mode={{ kind: "create" }} tenants={tenants} />
    </div>
  );
}
