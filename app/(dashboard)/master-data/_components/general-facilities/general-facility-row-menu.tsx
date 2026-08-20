"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfirmStore } from "@/store/use-confirm-store";
import { useDeleteGeneralFacility } from "@/hooks/api/use-general-facility";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";

type Props = {
  itemId: string;
  itemName: string;
  basePath: string;
};

export function GeneralFacilityRowMenu({ itemId, itemName, basePath }: Props) {
  const router = useRouter();
  const confirm = useConfirmStore((state) => state.confirm);
  const deleteMutation = useDeleteGeneralFacility();
  const pending = deleteMutation.isPending;

  function deleteItem() {
    confirm({
      title: "Delete General Facility",
      message: `Delete general facility "${itemName}"? This action cannot be undone.`,
      isDestructive: true,
      confirmLabel: "Delete",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(itemId);
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
          aria-label={`Actions for ${itemName}`}
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
        href={`${basePath}${basePath.includes("?") ? "&" : "?"}panel=edit&id=${itemId}`}
        role="menuitem"
        className="block px-3 py-2 text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground"
      >
        Edit General Facility
      </Link>
      <hr className="my-1 border-border" />
      <DropdownItem
        disabled={pending}
        onClick={deleteItem}
        className="text-danger hover:bg-danger-soft/60"
      >
        Delete General Facility
      </DropdownItem>
    </DropdownMenu>
  );
}
