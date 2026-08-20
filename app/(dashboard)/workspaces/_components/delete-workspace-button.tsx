"use client";

import { useRouter } from "next/navigation";
import { useDeleteWorkspace } from "@/hooks/api/use-workspace";
import { DeleteButton } from "@/components/delete-button";

type Props = {
  id: string;
  name: string;
  redirectTo?: string;
  variant?: "icon" | "button";
  requireConfirmName?: boolean;
};

export function DeleteWorkspaceButton({
  id,
  name,
  redirectTo,
  variant = "icon",
  requireConfirmName = false,
}: Props) {
  const router = useRouter();
  const deleteMutation = useDeleteWorkspace();

  return (
    <DeleteButton
      id={id}
      name={name}
      confirmTitle="Delete Workspace"
      confirmMessage={`Delete "${name}"?\n\nThis is a soft-delete — the workspace will be hidden from the console.`}
      buttonLabel="Delete workspace"
      isPending={deleteMutation.isPending}
      confirmInputText={requireConfirmName ? name : undefined}
      confirmInputPlaceholder="Type the workspace name to confirm..."
      onDelete={async () => {
        await deleteMutation.mutateAsync(id);
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      }}
      variant={variant}
    />
  );
}
