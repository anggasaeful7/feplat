import { notFound } from "next/navigation";
import { ApiError } from "@/lib/axios";
import { WorkspaceService } from "@/services/workspace.service";
import { DeleteWorkspaceButton } from "../../_components/delete-workspace-button";
import { WorkspaceForm } from "../../_components/workspace-form";
import { WorkspaceSubAccountForm } from "../../_components/workspace-sub-account-form";
import { WorkspacePayoutBankForm } from "../../_components/workspace-payout-bank-form";
import { WorkspaceDeploymentForm } from "../../_components/workspace-deployment-form";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/utils";
import { deploymentDefaults } from "@/lib/deployment-defaults";
import { ErrorState } from "@/components/error-state";

export default async function EditWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  let detail;
  let loadError: string | null = null;
  try {
    detail = await WorkspaceService.getWorkspace(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    loadError =
      err instanceof ApiError
        ? err.message
        : "Unable to reach the platform service. Try again in a moment.";
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          backHref="/workspaces"
          eyebrow="Back to workspaces"
          title="Error Loading Workspace"
          description="We couldn't retrieve the details for this workspace."
        />
        <ErrorState title="Error Loading Details" message={loadError} />
      </div>
    );
  }

  const { workspace, doku_sub_account, payout_bank, deployment } = detail!;
  if (!workspace) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        backHref="/workspaces"
        eyebrow="Back to workspaces"
        title={workspace.display_name}
        description={`Workspace handle: /${workspace.slug}. Edit details, rotate the slug, or end the contract from here.`}
      />

      {created && (
        <div
          role="status"
          className="rounded-lg border border-success-soft bg-success-soft/60 px-4 py-3 text-sm text-success"
        >
          <span className="font-medium">Workspace created.</span> You can fine-tune
          the details below or head back to the directory.
        </div>
      )}

      <MetadataStrip
        id={workspace.id}
        createdAt={workspace.created_at}
        updatedAt={workspace.updated_at}
      />

      <WorkspaceForm mode={{ kind: "edit", workspace }} />

      <WorkspaceSubAccountForm workspaceId={workspace.id} dokuSubAccount={doku_sub_account} />

      <WorkspacePayoutBankForm workspaceId={workspace.id} payoutBank={payout_bank} />

      <WorkspaceDeploymentForm
        workspaceId={workspace.id}
        deployment={deployment}
        defaults={deploymentDefaults()}
      />

      <section className="rounded-2xl border border-danger/20 bg-danger-soft/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-danger">Danger zone</h2>
            <p className="text-sm text-foreground/70 max-w-md">
              Deleting a workspace performs a soft-delete: the record is hidden
              from the console but can be restored by the platform team.
            </p>
          </div>
          <DeleteWorkspaceButton
            id={workspace.id}
            name={workspace.display_name}
            redirectTo="/workspaces"
            variant="button"
            requireConfirmName
          />
        </div>
      </section>
    </div>
  );
}


function MetadataStrip({
  id,
  createdAt,
  updatedAt,
}: {
  id: string;
  createdAt: string;
  updatedAt: string;
}) {
  return (
    <dl className="grid gap-4 rounded-xl border border-border bg-surface px-5 py-4 text-sm sm:grid-cols-3">
      <Item label="Workspace ID" value={id} mono />
      <Item label="Created" value={formatDateTime(createdAt)} />
      <Item label="Last updated" value={formatDateTime(updatedAt)} />
    </dl>
  );
}

function Item({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 truncate text-foreground ${mono ? "font-mono text-xs" : "text-sm"}`}
      >
        {value}
      </dd>
    </div>
  );
}

