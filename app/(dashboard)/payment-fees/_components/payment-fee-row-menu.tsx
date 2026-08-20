"use client";

import { useRouter } from "next/navigation";
import { useConfirmStore } from "@/store/use-confirm-store";
import { useDeleteWorkspacePaymentFee } from "@/hooks/api/use-workspace";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import type { PaymentFee } from "@/types";

type Props = {
  item: PaymentFee;
  onEdit: (item: PaymentFee) => void;
  workspaceId: string;
};

export function PaymentFeeRowMenu({ item, onEdit, workspaceId }: Props) {
  const router = useRouter();
  const confirm = useConfirmStore((state) => state.confirm);
  const deleteMutation = useDeleteWorkspacePaymentFee(workspaceId);
  const pending = deleteMutation.isPending;

  function deleteItem() {
    confirm({
      title: "Delete Payment Fee",
      message: `Delete payment fee for "${item.payment_method}"? This action cannot be undone.`,
      isDestructive: true,
      confirmLabel: "Delete",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(item.payment_method);
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
          aria-label={`Actions for ${item.payment_method}`}
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
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="block w-full px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground"
      >
        Edit Payment Fee
      </button>
      <hr className="my-1 border-border" />
      <DropdownItem
        disabled={pending}
        onClick={deleteItem}
        className="text-danger hover:bg-danger-soft/60"
      >
        Delete Payment Fee
      </DropdownItem>
    </DropdownMenu>
  );
}
