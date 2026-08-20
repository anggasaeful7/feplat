"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfirmStore } from "@/store/use-confirm-store";
import { useDeleteUser } from "@/hooks/api/use-user";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";

type Props = {
  userId: string;
  userName: string;
  basePath: string;
  isSelf: boolean;
};

export function RowMenu({ userId, userName, basePath, isSelf }: Props) {
  const router = useRouter();

  const confirm = useConfirmStore((state) => state.confirm);
  const deleteMutation = useDeleteUser();
  const pending = deleteMutation.isPending;

  function deleteUser() {
    confirm({
      title: "Delete User",
      message: `Delete "${userName}"?\n\nThis is a soft-delete — the account will be hidden from the console.`,
      isDestructive: true,
      confirmLabel: "Delete",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(userId);
        router.refresh();
      },
    });
  }

  return (
    <DropdownMenu
      width={208}
      trigger={
        <button
          type="button"
          aria-label={`Actions for ${userName}`}
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
        href={`${basePath}?panel=edit&id=${userId}`}
        role="menuitem"
        className="block px-3 py-2 text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground"
      >
        Edit profile
      </Link>
      <Link
        href={`${basePath}?panel=password&id=${userId}`}
        role="menuitem"
        className="block px-3 py-2 text-sm text-foreground/85 transition hover:bg-surface-muted hover:text-foreground"
      >
        Reset password
      </Link>
      <hr className="my-1 border-border" />
      <DropdownItem
        disabled={isSelf || pending}
        onClick={deleteUser}
        className="text-danger hover:bg-danger-soft/60"
      >
        Delete user
        {isSelf && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Self
          </span>
        )}
      </DropdownItem>
    </DropdownMenu>
  );
}
