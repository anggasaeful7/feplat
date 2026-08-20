"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfirmStore } from "@/store/use-confirm-store";
import { useDeleteTenant } from "@/hooks/api/use-tenant";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";

type Props = {
  tenantId: string;
  tenantName: string;
  basePath: string;
};

export function RowMenu({ tenantId, tenantName, basePath }: Props) {
  const router = useRouter();

  const confirm = useConfirmStore((state) => state.confirm);
  const deleteMutation = useDeleteTenant();
  const pending = deleteMutation.isPending;

  function deleteTenant() {
    confirm({
      title: "Delete Tenant",
      message: `Delete tenant "${tenantName}"? This action cannot be undone.`,
      isDestructive: true,
      confirmLabel: "Delete",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(tenantId);
        router.refresh();
      },
    });
  }

  return (
    <DropdownMenu
      width={180}
      trigger={
        <button
          type="button"
          aria-label={`Actions for ${tenantName}`}
          disabled={pending}
          className="grid h-8 w-8 place-items-center rounded-md text-foreground/55 transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>
      }
    >
      <Link
        href={`${basePath}?panel=edit&id=${tenantId}`}
        role="menuitem"
        className="block px-3 py-2 text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground"
      >
        Edit Tenant
      </Link>
      <hr className="my-1 border-border" />
      <DropdownItem
        disabled={pending}
        onClick={deleteTenant}
        className="text-danger hover:bg-danger-soft/60"
      >
        Delete Tenant
      </DropdownItem>
    </DropdownMenu>
  );
}
